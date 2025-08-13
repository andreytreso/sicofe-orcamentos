-- Add company_id to account_hierarchy table and strengthen access controls

-- Step 1: Add company_id column to account_hierarchy
ALTER TABLE public.account_hierarchy 
ADD COLUMN company_id UUID;

-- Step 2: Add foreign key constraint
ALTER TABLE public.account_hierarchy 
ADD CONSTRAINT fk_account_hierarchy_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Step 3: Make company_id required for new records
ALTER TABLE public.account_hierarchy 
ALTER COLUMN company_id SET NOT NULL;

-- Step 4: Drop existing RLS policies
DROP POLICY IF EXISTS "All authenticated users can view account hierarchy" ON public.account_hierarchy;
DROP POLICY IF EXISTS "Admins can manage account hierarchy" ON public.account_hierarchy;

-- Step 5: Create new company-based RLS policies

-- SELECT policy: Users can only see account hierarchy for their companies
CREATE POLICY "Users can view account hierarchy for their companies" 
ON public.account_hierarchy 
FOR SELECT 
USING (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

-- INSERT policy: Users can create account hierarchy for their companies
CREATE POLICY "Users can create account hierarchy for their companies" 
ON public.account_hierarchy 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

-- UPDATE policy: Users can update account hierarchy for their companies
CREATE POLICY "Users can update account hierarchy for their companies" 
ON public.account_hierarchy 
FOR UPDATE 
USING (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

-- DELETE policy: Users can delete account hierarchy for their companies
CREATE POLICY "Users can delete account hierarchy for their companies" 
ON public.account_hierarchy 
FOR DELETE 
USING (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

-- Step 6: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_account_hierarchy_company_id ON public.account_hierarchy(company_id);