-- Add optional supplier and collaborator references to transactions
BEGIN;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS collaborator_id UUID REFERENCES public.collaborators(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_supplier_id ON public.transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_collaborator_id ON public.transactions(collaborator_id);

COMMIT;

