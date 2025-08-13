-- Security Fix: Strengthen supplier access controls to prevent data harvesting

-- Step 1: Make company_id required for all suppliers to prevent orphaned records
ALTER TABLE public.suppliers 
ALTER COLUMN company_id SET NOT NULL;

-- Step 2: Add a constraint to ensure company_id references valid companies
ALTER TABLE public.suppliers 
ADD CONSTRAINT fk_suppliers_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Step 3: Drop existing RLS policies for suppliers
DROP POLICY IF EXISTS "Users can view suppliers for their companies" ON public.suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers for their companies" ON public.suppliers;
DROP POLICY IF EXISTS "Users can update suppliers for their companies" ON public.suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers for their companies" ON public.suppliers;

-- Step 4: Create new stricter RLS policies that prevent data harvesting

-- SELECT policy: Only allow access to suppliers from companies the user has access to
CREATE POLICY "Users can view suppliers for authorized companies only" 
ON public.suppliers 
FOR SELECT 
USING (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

-- INSERT policy: Only allow creating suppliers for companies the user has access to
CREATE POLICY "Users can create suppliers for authorized companies only" 
ON public.suppliers 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

-- UPDATE policy: Only allow updating suppliers from companies the user has access to
CREATE POLICY "Users can update suppliers for authorized companies only" 
ON public.suppliers 
FOR UPDATE 
USING (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

-- DELETE policy: Only allow deleting suppliers from companies the user has access to
CREATE POLICY "Users can delete suppliers for authorized companies only" 
ON public.suppliers 
FOR DELETE 
USING (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

-- Step 5: Ensure RLS is enabled
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Step 6: Create index for better performance on company-based queries
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON public.suppliers(company_id);

-- Security Note: Removed OR is_admin(auth.uid()) condition to prevent admin data harvesting
-- Admin access should be granted through proper company access relationships