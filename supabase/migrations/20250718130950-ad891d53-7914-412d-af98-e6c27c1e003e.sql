-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entries table
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL,
  category_id UUID NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  entry_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (budget_id) REFERENCES public.budgets(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT
);

-- Add missing fields to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS endereco_rua TEXT,
ADD COLUMN IF NOT EXISTS endereco_numero TEXT,
ADD COLUMN IF NOT EXISTS endereco_cidade TEXT,
ADD COLUMN IF NOT EXISTS endereco_estado TEXT,
ADD COLUMN IF NOT EXISTS endereco_cep TEXT;

-- Update budgets table to match the required schema
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS actual_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "All authenticated users can view categories" 
ON public.categories 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_company_access 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create RLS policies for entries
CREATE POLICY "Users can view entries for their company budgets" 
ON public.entries 
FOR SELECT 
USING (budget_id IN (
  SELECT b.id FROM budgets b 
  WHERE b.company_id IN (
    SELECT company_id FROM user_company_access 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can insert entries for their company budgets" 
ON public.entries 
FOR INSERT 
WITH CHECK (budget_id IN (
  SELECT b.id FROM budgets b 
  WHERE b.company_id IN (
    SELECT company_id FROM user_company_access 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can update entries for their company budgets" 
ON public.entries 
FOR UPDATE 
USING (budget_id IN (
  SELECT b.id FROM budgets b 
  WHERE b.company_id IN (
    SELECT company_id FROM user_company_access 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can delete entries for their company budgets" 
ON public.entries 
FOR DELETE 
USING (budget_id IN (
  SELECT b.id FROM budgets b 
  WHERE b.company_id IN (
    Select company_id FROM user_company_access 
    WHERE user_id = auth.uid()
  )
));

-- Insert some default categories
INSERT INTO public.categories (name, type) VALUES
('Receitas', 'income'),
('Despesas Operacionais', 'expense'),
('Investimentos', 'expense'),
('Marketing', 'expense'),
('Vendas', 'income')
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entries_updated_at
BEFORE UPDATE ON public.entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();