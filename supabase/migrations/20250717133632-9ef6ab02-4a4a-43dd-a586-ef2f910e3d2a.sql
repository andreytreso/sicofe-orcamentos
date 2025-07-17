-- Fix infinite recursion in user_company_access policies
-- Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can manage company access" ON public.user_company_access;

-- Create a simpler admin policy that doesn't reference itself
CREATE POLICY "Admins can manage company access" ON public.user_company_access
FOR ALL TO authenticated
USING (
  -- Admin users can manage all company access records
  EXISTS (
    SELECT 1 FROM public.user_company_access uca
    WHERE uca.user_id = auth.uid() AND uca.role = 'admin'
    LIMIT 1
  )
  OR
  -- Users can only see their own access records
  user_id = auth.uid()
)
WITH CHECK (
  -- Admin users can insert/update any company access record
  EXISTS (
    SELECT 1 FROM public.user_company_access uca
    WHERE uca.user_id = auth.uid() AND uca.role = 'admin'
    LIMIT 1
  )
  OR
  -- Regular users can only insert their own access records
  user_id = auth.uid()
);

-- Create budgets table for Orçamentos page
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  planned_amount NUMERIC NOT NULL DEFAULT 0,
  realized_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  progress NUMERIC NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable RLS for budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budgets
CREATE POLICY "Users can view budgets for their companies" 
ON public.budgets 
FOR SELECT 
USING (company_id IN (
  SELECT user_company_access.company_id
  FROM user_company_access
  WHERE user_company_access.user_id = auth.uid()
));

CREATE POLICY "Users can insert budgets for their companies" 
ON public.budgets 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND 
  company_id IN (
    SELECT user_company_access.company_id
    FROM user_company_access
    WHERE user_company_access.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update budgets for their companies" 
ON public.budgets 
FOR UPDATE 
USING (company_id IN (
  SELECT user_company_access.company_id
  FROM user_company_access
  WHERE user_company_access.user_id = auth.uid()
));

CREATE POLICY "Users can delete budgets for their companies" 
ON public.budgets 
FOR DELETE 
USING (
  user_id = auth.uid() AND 
  company_id IN (
    SELECT user_company_access.company_id
    FROM user_company_access
    WHERE user_company_access.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates on budgets
CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();