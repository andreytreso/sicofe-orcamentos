-- View that enriches collaborators with company and cost center details
BEGIN;

DROP VIEW IF EXISTS public.collaborators_with_details;

CREATE VIEW public.collaborators_with_details AS
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
FROM public.collaborators col
LEFT JOIN public.companies co ON co.id = col.company_id
LEFT JOIN public.cost_centers cc ON cc.id = col.cost_center_id;

COMMENT ON VIEW public.collaborators_with_details IS 'Lista colaboradores com nomes de empresa e centro de custo.';

COMMIT;
