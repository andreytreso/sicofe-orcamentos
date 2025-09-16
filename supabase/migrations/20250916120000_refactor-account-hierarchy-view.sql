-- Replace account_hierarchy view to use group_chart_of_accounts from company groups
DROP VIEW IF EXISTS public.account_hierarchy;
DROP TABLE IF EXISTS public.account_hierarchy_legacy;

CREATE VIEW public.account_hierarchy AS
SELECT
  gcoa.nome_conta_resultado_s1 AS level_1,
  gcoa.nome_conta_resultado_s2 AS level_2,
  gcoa.nome_conta_resultado_a1 AS analytical_account,
  c.id AS company_id,
  gcoa.created_at,
  gcoa.group_id,
  COALESCE(gcoa.type, 'custom') AS type,
  gcoa.cod_conta_resultado_a1 AS code_analytical,
  gcoa.cod_conta_resultado_s1 AS code_level_1,
  gcoa.cod_conta_resultado_s2 AS code_level_2,
  COALESCE(gcoa.status, 'ativo') AS status
FROM public.group_chart_of_accounts gcoa
JOIN public.company_groups cg ON cg.id = gcoa.group_id
JOIN public.companies c ON c.group_id = cg.id;

COMMENT ON VIEW public.account_hierarchy IS 'Plano de contas derivado de group_chart_of_accounts e replicado por empresa.';



