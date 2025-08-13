-- Fix account hierarchy to add company_id with proper data migration

-- Step 1: Add company_id column as nullable first
ALTER TABLE public.account_hierarchy 
ADD COLUMN IF NOT EXISTS company_id UUID;

-- Step 2: Update existing records to use the first available company
-- This assumes users want to migrate existing data to the first company
UPDATE public.account_hierarchy 
SET company_id = (
  SELECT id FROM public.companies 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE company_id IS NULL;

-- Step 3: Now make company_id required
ALTER TABLE public.account_hierarchy 
ALTER COLUMN company_id SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE public.account_hierarchy 
ADD CONSTRAINT fk_account_hierarchy_company_id 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

-- Step 5: Drop existing RLS policies
DROP POLICY IF EXISTS "All authenticated users can view account hierarchy" ON public.account_hierarchy;
DROP POLICY IF EXISTS "Admins can manage account hierarchy" ON public.account_hierarchy;

-- Step 6: Create new company-based RLS policies

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

-- Step 7: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_account_hierarchy_company_id ON public.account_hierarchy(company_id);