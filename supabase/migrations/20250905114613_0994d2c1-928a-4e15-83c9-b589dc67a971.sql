-- Add trigger to automatically give admin access to company creators
DROP TRIGGER IF EXISTS on_company_created ON public.companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.add_creator_as_admin();

-- Grant current user admin access to all existing companies (temporary fix)
INSERT INTO public.user_company_access (user_id, company_id, role)
SELECT auth.uid(), id, 'admin' 
FROM public.companies 
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_company_access 
  WHERE user_id = auth.uid() AND company_id = companies.id
);