-- The functions with SECURITY DEFINER are actually legitimate security functions
-- However, let's check if 'is_admin' function needs SECURITY DEFINER
-- This function might be the source of the warning since it's used in RLS policies

-- Check the current definition of is_admin function
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'is_admin';

-- The is_admin function should be SECURITY INVOKER since it only reads data
-- and RLS policies should respect the calling user's permissions
-- Let's recreate it as SECURITY INVOKER

DROP FUNCTION IF EXISTS public.is_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER  -- Changed from SECURITY DEFINER to SECURITY INVOKER
SET search_path TO 'public'
AS $$
  select
    exists (
      select 1 from public.profiles p
      where p.user_id = uid and p.role = 'admin'
    )
    or exists (
      select 1 from public.user_company_access uca
      where uca.user_id = uid and uca.role = 'admin'
    );
$$;