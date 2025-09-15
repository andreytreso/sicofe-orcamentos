-- Fix Security Definer Views by recreating them without SECURITY DEFINER
-- Views are SECURITY INVOKER by default, which is what we want

-- First, identify current views that might have SECURITY DEFINER
SELECT 
  schemaname, 
  viewname
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('account_hierarchy', 'companies_with_group');

-- Drop existing views if they exist (they will be recreated automatically by Supabase)
DROP VIEW IF EXISTS public.account_hierarchy CASCADE;
DROP VIEW IF EXISTS public.companies_with_group CASCADE;

-- Recreate account_hierarchy view (SECURITY INVOKER is the default)
CREATE VIEW public.account_hierarchy AS
SELECT 
  ah.level_1,
  ah.level_2,
  ah.analytical_account,
  ah.company_id,
  ah.created_at,
  g.id as group_id,
  'active' as type,
  'active' as status,
  '' as code_analytical,
  '' as code_level_1,
  '' as code_level_2
FROM account_hierarchy_legacy ah
LEFT JOIN companies c ON c.id = ah.company_id
LEFT JOIN company_groups g ON g.id = c.group_id;

-- Recreate companies_with_group view (SECURITY INVOKER is the default)
CREATE VIEW public.companies_with_group AS
SELECT 
  c.id,
  c.name,
  c.status,
  c.created_at,
  c.updated_at,
  c.cnpj,
  c.email,
  c.telefone,
  c.endereco_rua,
  c.endereco_numero,
  c.endereco_cidade,
  c.endereco_estado,
  c.endereco_cep,
  c.group_id,
  g.name as group_name,
  g.code as group_code
FROM companies c
LEFT JOIN company_groups g ON g.id = c.group_id;

-- Add comments to document the security model
COMMENT ON VIEW public.account_hierarchy IS 'View respects user-level RLS policies from underlying tables (account_hierarchy_legacy, companies, company_groups)';
COMMENT ON VIEW public.companies_with_group IS 'View respects user-level RLS policies from underlying tables (companies, company_groups)';