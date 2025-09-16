-- View that enriches suppliers with company details
BEGIN;

DROP VIEW IF EXISTS public.suppliers_with_details;

CREATE VIEW public.suppliers_with_details AS
SELECT
  s.id,
  s.name,
  s.cnpj,
  s.email,
  s.phone,
  s.address,
  s.status,
  s.company_id,
  s.group_id,
  s.created_at,
  s.updated_at,
  c.name AS company_name,
  cg.name AS group_name
FROM public.suppliers s
LEFT JOIN public.companies c ON c.id = s.company_id
LEFT JOIN public.company_groups cg ON cg.id = COALESCE(s.group_id, c.group_id);
COMMENT ON VIEW public.suppliers_with_details IS 'Lista fornecedores com o nome da empresa.';

COMMIT;


