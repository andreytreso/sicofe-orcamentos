-- Create collaborators table
CREATE TABLE public.collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  group_name TEXT,
  status TEXT NOT NULL DEFAULT 'active'::text,
  company_id UUID NOT NULL,  
  cost_center_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view collaborators for their companies" 
ON public.collaborators 
FOR SELECT 
USING (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  ) 
  OR is_admin(auth.uid())
);

CREATE POLICY "Users can insert collaborators for their companies" 
ON public.collaborators 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update collaborators for their companies" 
ON public.collaborators 
FOR UPDATE 
USING (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete collaborators for their companies" 
ON public.collaborators 
FOR DELETE 
USING (
  company_id IN (
    SELECT uca.company_id 
    FROM user_company_access uca 
    WHERE uca.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_collaborators_updated_at
  BEFORE UPDATE ON public.collaborators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();