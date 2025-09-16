-- Create collaborators table and policies
BEGIN;

CREATE TABLE IF NOT EXISTS public.collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_name TEXT,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  cost_center_id UUID REFERENCES public.cost_centers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage collaborators for companies they have access to
DROP POLICY IF EXISTS "Users can view collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Users can insert collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Users can update collaborators" ON public.collaborators;
DROP POLICY IF EXISTS "Users can delete collaborators" ON public.collaborators;

CREATE POLICY "Users can view collaborators"
ON public.collaborators
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.user_company_access WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert collaborators"
ON public.collaborators
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.user_company_access WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update collaborators"
ON public.collaborators
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id FROM public.user_company_access WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete collaborators"
ON public.collaborators
FOR DELETE
USING (
  company_id IN (
    SELECT company_id FROM public.user_company_access WHERE user_id = auth.uid()
  )
);

-- Trigger to update updated_at
CREATE TRIGGER upd_collaborators BEFORE UPDATE ON public.collaborators
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;

