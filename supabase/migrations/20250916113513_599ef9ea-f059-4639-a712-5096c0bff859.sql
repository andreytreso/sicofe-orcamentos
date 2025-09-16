-- Add DELETE policy for companies table
CREATE POLICY "Admins can delete companies they have access to" 
ON public.companies 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM user_company_access u 
    WHERE u.user_id = auth.uid() 
      AND u.company_id = companies.id 
      AND u.role = 'admin'
  )
);