-- Fix Companies Table Data Exposure
-- Issue: Any company admin can see all companies data, not just their own
-- Solution: Distinguish between system admins and company admins

-- 1. Create a function to check for system-level admin (profiles.role = 'admin')
CREATE OR REPLACE FUNCTION public.is_system_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = uid AND p.role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_system_admin IS 'Check if user is a system-level administrator (not just company admin)';

-- 2. Drop and recreate the SELECT policy to use is_system_admin instead of is_admin
DROP POLICY IF EXISTS "Users can view companies they have access to" ON public.companies;

CREATE POLICY "Users can view companies they have access to"
ON public.companies
FOR SELECT
TO authenticated
USING (
  -- Users can see companies they have explicit access to
  EXISTS (
    SELECT 1
    FROM user_company_access u
    WHERE u.user_id = auth.uid() 
    AND u.company_id = companies.id
  )
  -- OR users who are system-level admins (not just company admins)
  OR public.is_system_admin(auth.uid())
);

-- 3. Fix the overly permissive INSERT policy
DROP POLICY IF EXISTS "companies_insert_authenticated" ON public.companies;

CREATE POLICY "Admins can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only system admins can create new companies
  public.is_system_admin(auth.uid())
);

-- 4. Add comment explaining the security model
COMMENT ON TABLE public.companies IS 'Companies table with RLS. Users can only view companies they have access to via user_company_access, or if they are system administrators.';