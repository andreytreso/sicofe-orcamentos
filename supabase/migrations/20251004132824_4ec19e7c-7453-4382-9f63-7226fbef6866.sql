-- Fix Security Definer View Issue
-- Recreate views as SECURITY INVOKER with security_barrier to respect RLS of underlying tables

-- 1. Drop and recreate account_hierarchy view
DROP VIEW IF EXISTS public.account_hierarchy CASCADE;

CREATE VIEW public.account_hierarchy 
WITH (security_invoker = true, security_barrier = true)
AS
SELECT 
  gcoa.id,
  gcoa.nome_conta_resultado_s1 AS level_1,
  gcoa.nome_conta_resultado_s2 AS level_2,
  gcoa.nome_conta_resultado_a1 AS analytical_account,
  c.id AS company_id,
  gcoa.created_at,
  gcoa.group_id,
  COALESCE(gcoa.type, 'custom'::text) AS type,
  gcoa.cod_conta_resultado_a1 AS code_analytical,
  gcoa.cod_conta_resultado_s1 AS code_level_1,
  gcoa.cod_conta_resultado_s2 AS code_level_2,
  COALESCE(gcoa.status, 'ativo'::text) AS status
FROM group_chart_of_accounts gcoa
JOIN company_groups cg ON cg.id = gcoa.group_id
JOIN companies c ON c.group_id = cg.id
WHERE c.id IN (
  SELECT uca.company_id
  FROM user_company_access uca
  WHERE uca.user_id = auth.uid()
)
OR public.is_admin(auth.uid());

COMMENT ON VIEW public.account_hierarchy IS 'Plano de contas derivado de group_chart_of_accounts e replicado por empresa. Security invoker view respects user permissions.';

-- 2. Drop and recreate collaborators_with_details view
DROP VIEW IF EXISTS public.collaborators_with_details CASCADE;

CREATE VIEW public.collaborators_with_details
WITH (security_invoker = true, security_barrier = true)
AS
SELECT 
  col.id,
  col.name,
  col.group_name,
  col.status,
  col.company_id,
  col.cost_center_id,
  col.created_at,
  col.updated_at,
  co.name AS company_name,
  cc.code AS cost_center_code,
  cc.name AS cost_center_name
FROM collaborators col
LEFT JOIN companies co ON co.id = col.company_id
LEFT JOIN cost_centers cc ON cc.id = col.cost_center_id
WHERE col.company_id IN (
  SELECT uca.company_id
  FROM user_company_access uca
  WHERE uca.user_id = auth.uid()
)
OR public.is_admin(auth.uid());

COMMENT ON VIEW public.collaborators_with_details IS 'Lista colaboradores com nomes de empresa e centro de custo. Security invoker view respects user permissions.';

-- 3. Drop and recreate companies_with_group view
DROP VIEW IF EXISTS public.companies_with_group CASCADE;

CREATE VIEW public.companies_with_group
WITH (security_invoker = true, security_barrier = true)
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
  g.name AS group_name,
  g.code AS group_code
FROM companies c
LEFT JOIN company_groups g ON g.id = c.group_id
WHERE EXISTS (
  SELECT 1
  FROM user_company_access u
  WHERE u.user_id = auth.uid() 
  AND u.company_id = c.id
)
OR public.is_admin(auth.uid());

COMMENT ON VIEW public.companies_with_group IS 'View respects user-level RLS policies. Security invoker view with built-in access control.';

-- 4. Drop and recreate suppliers_with_details view
DROP VIEW IF EXISTS public.suppliers_with_details CASCADE;

CREATE VIEW public.suppliers_with_details
WITH (security_invoker = true, security_barrier = true)
AS
SELECT 
  s.id,
  s.name,
  s.cnpj,
  s.email,
  s.phone,
  s.address,
  s.status,
  s.company_id,
  s.created_at,
  s.updated_at,
  c.name AS company_name
FROM suppliers s
LEFT JOIN companies c ON c.id = s.company_id
WHERE s.company_id IN (
  SELECT uca.company_id
  FROM user_company_access uca
  WHERE uca.user_id = auth.uid()
)
OR public.is_admin(auth.uid());

COMMENT ON VIEW public.suppliers_with_details IS 'Lista fornecedores com o nome da empresa. Security invoker view respects user permissions.';