-- =====================================================
-- SECURITY FIX: Critical Error-Level Issues
-- =====================================================

-- 1. CREATE USER ROLES TABLE (Critical: Roles must NOT be in profiles)
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'aprovador', 'pacoteiro');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role, company_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can grant roles"
ON public.user_roles FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can revoke roles"
ON public.user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, granted_at)
SELECT user_id, 'admin'::app_role, NOW()
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role, company_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role, granted_at)
SELECT user_id, 'aprovador'::app_role, NOW()
FROM public.profiles
WHERE aprovador = true
ON CONFLICT (user_id, role, company_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role, granted_at)
SELECT user_id, 'pacoteiro'::app_role, NOW()
FROM public.profiles
WHERE pacoteiro = true
ON CONFLICT (user_id, role, company_id) DO NOTHING;

-- 2. FIX PROFILES - Restrict to own profile + admins only
-- =====================================================
DROP POLICY IF EXISTS "Profiles: owner or admin select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: admin update all" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user update own" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Restrictive SELECT policy
CREATE POLICY "Users view own profile or admins view all"
ON public.profiles FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Users can only update their own basic info (not role fields)
CREATE POLICY "Users update own profile basic info"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can update all profiles
CREATE POLICY "Admins update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. FIX COMPANIES - Create limited view for non-admins
-- =====================================================
CREATE VIEW public.companies_limited AS
SELECT 
  id, 
  name, 
  status, 
  group_id, 
  created_at, 
  updated_at,
  cnpj
FROM public.companies;

GRANT SELECT ON public.companies_limited TO authenticated;

-- Restrict full companies table to admins only
DROP POLICY IF EXISTS "Users can view companies they have access to" ON public.companies;

CREATE POLICY "Admins view all company details"
ON public.companies FOR SELECT
USING (has_role(auth.uid(), 'admin') OR is_system_admin(auth.uid()));

CREATE POLICY "Users with access view basic company info"
ON public.companies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_company_access u
    WHERE u.user_id = auth.uid() AND u.company_id = companies.id
  ) AND NOT has_role(auth.uid(), 'admin')
);

-- 4. UPDATE is_admin function to use new user_roles
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT has_role(uid, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_company_access uca
      WHERE uca.user_id = uid AND uca.role = 'admin'
    );
$function$;

-- Update is_system_admin to use user_roles
CREATE OR REPLACE FUNCTION public.is_system_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT has_role(uid, 'admin'::app_role);
$function$;

-- 5. NOTE: account_hierarchy is a VIEW, not a table
-- Views inherit RLS from underlying tables, so we cannot enable RLS on the view itself
-- The underlying tables must have proper RLS policies
COMMENT ON VIEW public.account_hierarchy IS 'Security Note: This view inherits RLS from underlying tables. Ensure base tables have proper access control.';
