-- Enable Row Level Security on account_hierarchy table
ALTER TABLE public.account_hierarchy ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for account_hierarchy
-- Users can view account hierarchy for companies they have access to
CREATE POLICY "Users can view account hierarchy for their companies" 
ON public.account_hierarchy 
FOR SELECT 
USING (
  company_id IN (
    SELECT uca.company_id
    FROM user_company_access uca
    WHERE uca.user_id = auth.uid()
  ) OR is_admin(auth.uid())
);

-- Users can insert account hierarchy for companies they have access to
CREATE POLICY "Users can insert account hierarchy for their companies" 
ON public.account_hierarchy 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT uca.company_id
    FROM user_company_access uca
    WHERE uca.user_id = auth.uid()
  )
);

-- Users can update account hierarchy for companies they have access to
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

-- Users can delete account hierarchy for companies they have access to
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

-- Note: companies_with_group appears to be a view, not a table
-- Views inherit RLS from their underlying tables (companies and company_groups)
-- Since companies table already has proper RLS policies, the view should be secure
-- However, let's ensure the view itself has RLS enabled for extra security

-- Check if companies_with_group is a view or table and handle accordingly
DO $$
BEGIN
  -- Try to enable RLS on companies_with_group if it's a table
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'companies_with_group'
    AND table_type = 'BASE TABLE'
  ) THEN
    -- It's a table, enable RLS
    ALTER TABLE public.companies_with_group ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policy for companies_with_group table
    CREATE POLICY "Users can view companies with group for their companies" 
    ON public.companies_with_group 
    FOR SELECT 
    USING (
      id IN (
        SELECT uca.company_id
        FROM user_company_access uca
        WHERE uca.user_id = auth.uid()
      ) OR is_admin(auth.uid())
    );
  END IF;
END $$;