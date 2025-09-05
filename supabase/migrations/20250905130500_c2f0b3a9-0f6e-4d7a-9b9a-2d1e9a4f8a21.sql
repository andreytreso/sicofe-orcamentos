-- Add relation between transactions and cost centers (many-to-many)
BEGIN;

-- Flag on transactions to indicate if applies to all cost centers
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS all_cost_centers BOOLEAN NOT NULL DEFAULT TRUE;

-- Join table
CREATE TABLE IF NOT EXISTS public.transaction_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  cost_center_id UUID NOT NULL REFERENCES public.cost_centers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, cost_center_id)
);

CREATE INDEX IF NOT EXISTS idx_tcc_transaction_id ON public.transaction_cost_centers(transaction_id);
CREATE INDEX IF NOT EXISTS idx_tcc_cost_center_id ON public.transaction_cost_centers(cost_center_id);

-- Enable RLS
ALTER TABLE public.transaction_cost_centers ENABLE ROW LEVEL SECURITY;

-- Policies: user must have access to the company of the transaction
CREATE POLICY IF NOT EXISTS "Users can view their transaction cost centers"
ON public.transaction_cost_centers
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.transactions t
    JOIN public.user_company_access uca ON uca.company_id = t.company_id
    WHERE t.id = transaction_cost_centers.transaction_id
      AND uca.user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Users can insert their transaction cost centers"
ON public.transaction_cost_centers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.transactions t
    JOIN public.user_company_access uca ON uca.company_id = t.company_id
    JOIN public.cost_centers cc ON cc.id = transaction_cost_centers.cost_center_id
    WHERE t.id = transaction_cost_centers.transaction_id
      AND cc.company_id = t.company_id
      AND uca.user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Users can delete their transaction cost centers"
ON public.transaction_cost_centers
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.transactions t
    JOIN public.user_company_access uca ON uca.company_id = t.company_id
    WHERE t.id = transaction_cost_centers.transaction_id
      AND uca.user_id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Users can update their transaction cost centers"
ON public.transaction_cost_centers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.transactions t
    JOIN public.user_company_access uca ON uca.company_id = t.company_id
    WHERE t.id = transaction_cost_centers.transaction_id
      AND uca.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.transactions t
    JOIN public.user_company_access uca ON uca.company_id = t.company_id
    JOIN public.cost_centers cc ON cc.id = transaction_cost_centers.cost_center_id
    WHERE t.id = transaction_cost_centers.transaction_id
      AND cc.company_id = t.company_id
      AND uca.user_id = auth.uid()
  )
);

COMMIT;

