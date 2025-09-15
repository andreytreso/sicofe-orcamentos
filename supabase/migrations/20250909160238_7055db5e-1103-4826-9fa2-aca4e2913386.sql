-- Fix Security Definer Views
-- These views currently bypass user-level RLS policies, which is a security risk

-- First, let's identify which views have SECURITY DEFINER
SELECT 
  schemaname, 
  viewname,
  definition
FROM pg_views 
WHERE schemaname = 'public'
AND definition ILIKE '%security definer%';

-- Drop and recreate the Security Definer views without SECURITY DEFINER
-- This ensures they respect the calling user's RLS policies instead of bypassing them

-- Drop existing Security Definer views if they exist
DROP VIEW IF EXISTS public.account_hierarchy CASCADE;
DROP VIEW IF EXISTS public.companies_with_group CASCADE;

-- Recreate account_hierarchy view without SECURITY DEFINER (as SECURITY INVOKER)
CREATE VIEW public.account_hierarchy 
SECURITY INVOKER
AS
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

-- Recreate companies_with_group view without SECURITY DEFINER (as SECURITY INVOKER)  
CREATE VIEW public.companies_with_group
SECURITY INVOKER
AS
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
COMMENT ON VIEW public.account_hierarchy IS 'SECURITY INVOKER view that respects user-level RLS policies from underlying tables';
COMMENT ON VIEW public.companies_with_group IS 'SECURITY INVOKER view that respects user-level RLS policies from underlying tables';