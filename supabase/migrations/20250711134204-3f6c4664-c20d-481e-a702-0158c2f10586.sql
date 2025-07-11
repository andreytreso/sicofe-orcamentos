-- Create tables for the application entities

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table 
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- User company access table (many-to-many relationship)
CREATE TABLE public.user_company_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Account hierarchy table
CREATE TABLE public.account_hierarchy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_1 TEXT NOT NULL,
  level_2 TEXT NOT NULL,
  analytical_account TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(level_1, level_2, analytical_account)
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  year INTEGER NOT NULL,
  level_1_group TEXT NOT NULL,
  level_2_group TEXT NOT NULL,
  analytical_account TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(15,2) NOT NULL,
  observations TEXT,
  competency_months TEXT[] NOT NULL DEFAULT '{}', -- array of month abbreviations
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Approval items table
CREATE TABLE public.approval_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  level_1_group TEXT NOT NULL,
  level_2_group TEXT NOT NULL,
  analytical_account TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  requester TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  period TEXT NOT NULL,
  approval_level INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Approval history table
CREATE TABLE public.approval_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  approval_item_id UUID NOT NULL REFERENCES public.approval_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- Create policies for companies
CREATE POLICY "Users can view companies they have access to" 
ON public.companies 
FOR SELECT 
USING (
  id IN (
    SELECT company_id 
    FROM public.user_company_access 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.user_company_access 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update companies they have access to" 
ON public.companies 
FOR UPDATE 
USING (
  id IN (
    SELECT company_id 
    FROM public.user_company_access 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create policies for user_company_access
CREATE POLICY "Users can view their own company access" 
ON public.user_company_access 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage company access" 
ON public.user_company_access 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_company_access 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for account_hierarchy
CREATE POLICY "All authenticated users can view account hierarchy" 
ON public.account_hierarchy 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage account hierarchy" 
ON public.account_hierarchy 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_company_access 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for transactions
CREATE POLICY "Users can view transactions for their companies" 
ON public.transactions 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.user_company_access 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert transactions for their companies" 
ON public.transactions 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  company_id IN (
    SELECT company_id 
    FROM public.user_company_access 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (
  user_id = auth.uid() AND
  company_id IN (
    SELECT company_id 
    FROM public.user_company_access 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (
  user_id = auth.uid() AND
  company_id IN (
    SELECT company_id 
    FROM public.user_company_access 
    WHERE user_id = auth.uid()
  )
);

-- Create policies for approval_items
CREATE POLICY "Users can view approval items for their companies" 
ON public.approval_items 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.user_company_access 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert approval items for their companies" 
ON public.approval_items 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  company_id IN (
    SELECT company_id 
    FROM public.user_company_access 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update approval items for their companies" 
ON public.approval_items 
FOR UPDATE 
USING (
  company_id IN (
    SELECT company_id 
    FROM public.user_company_access 
    WHERE user_id = auth.uid()
  )
);

-- Create policies for approval_history
CREATE POLICY "Users can view approval history for their companies" 
ON public.approval_history 
FOR SELECT 
USING (
  approval_item_id IN (
    SELECT id 
    FROM public.approval_items 
    WHERE company_id IN (
      SELECT company_id 
      FROM public.user_company_access 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert approval history" 
ON public.approval_history 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  approval_item_id IN (
    SELECT id 
    FROM public.approval_items 
    WHERE company_id IN (
      SELECT company_id 
      FROM public.user_company_access 
      WHERE user_id = auth.uid()
    )
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_approval_items_updated_at
BEFORE UPDATE ON public.approval_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for companies
INSERT INTO public.companies (name, status) VALUES
('Tech Solutions LTDA', 'active'),
('Marketing Digital S/A', 'active'),
('Consultoria Financeira', 'inactive'),
('E-commerce Brasil', 'active'),
('SICOFE LTDA', 'active'),
('Examine Loja 1', 'active'),
('Examine Loja 2', 'active'),
('Examine Loja 3', 'active'),
('Examine Loja 4', 'active'),
('Examine Loja 6', 'active'),
('Examine Loja 7', 'active');

-- Insert account hierarchy data
INSERT INTO public.account_hierarchy (level_1, level_2, analytical_account) VALUES
-- Receita Bruta
('Receita Bruta', 'Mercadorias para Revenda', 'Receitas com Visa Crédito'),
('Receita Bruta', 'Mercadorias para Revenda', 'Receitas com Mastercard Crédito'),
('Receita Bruta', 'Mercadorias para Revenda', 'Receitas com Elo Crédito'),
('Receita Bruta', 'Mercadorias para Revenda', 'Receitas com Visa Débito'),
('Receita Bruta', 'Mercadorias para Revenda', 'Receitas com Mastercard Débito'),
('Receita Bruta', 'Mercadorias para Revenda', 'Receitas com Elo Débito'),
('Receita Bruta', 'Mercadorias para Revenda', 'Receitas com PIX'),
('Receita Bruta', 'Mercadorias para Revenda', 'Receitas em Dinheiro'),
('Receita Bruta', 'Mercadorias para Revenda', 'Receitas com Cheque'),

-- Deduções Sobre as Vendas
('Deduções Sobre as Vendas', 'Impostos Indiretos', 'ICMS sobre Vendas'),
('Deduções Sobre as Vendas', 'Impostos Indiretos', 'PIS sobre Vendas'),
('Deduções Sobre as Vendas', 'Impostos Indiretos', 'COFINS sobre Vendas'),
('Deduções Sobre as Vendas', 'Cancelamentos e Devoluções', 'Cancelamentos de Vendas'),
('Deduções Sobre as Vendas', 'Cancelamentos e Devoluções', 'Devoluções de Vendas'),

-- Resultado Não Operacional
('Resultado Não Operacional', 'Outras Receitas', 'Receitas Financeiras'),
('Resultado Não Operacional', 'Outras Receitas', 'Descontos Obtidos'),
('Resultado Não Operacional', 'Outras Receitas/ (Despesas) Não Operacionais', 'Multas e Juros Recebidos'),
('Resultado Não Operacional', 'Outras Receitas/ (Despesas) Não Operacionais', 'Outras Receitas Diversas'),

-- Custo das Mercadorias para Revenda
('Custo das Mercadorias para Revenda', 'Custo das Mercadorias para Revenda', 'Custo de Produtos Vendidos'),
('Custo das Mercadorias para Revenda', 'Custo das Mercadorias para Revenda', 'Fretes sobre Compras'),
('Custo das Mercadorias para Revenda', 'Custo das Mercadorias para Revenda', 'Seguros sobre Compras'),

-- SG&A
('SG&A', 'Utilidades', 'Energia Elétrica'),
('SG&A', 'Utilidades', 'Água e Esgoto'),
('SG&A', 'Utilidades', 'Telefone'),
('SG&A', 'Utilidades', 'Internet'),
('SG&A', 'Folha de Pagamentos', 'Salários e Ordenados'),
('SG&A', 'Folha de Pagamentos', 'Encargos Sociais'),
('SG&A', 'Folha de Pagamentos', 'FGTS'),
('SG&A', 'Folha de Pagamentos', 'Férias e 13º Salário'),
('SG&A', 'Outras Despesas', 'Material de Escritório'),
('SG&A', 'Outras Despesas', 'Material de Limpeza'),
('SG&A', 'Outras Despesas', 'Despesas Bancárias'),
('SG&A', 'Ocupação', 'Aluguel do Imóvel'),
('SG&A', 'Ocupação', 'Condomínio'),
('SG&A', 'Ocupação', 'IPTU'),
('SG&A', 'Aluguel de Equipamentos', 'Aluguel de Equipamentos de TI'),
('SG&A', 'Aluguel de Equipamentos', 'Aluguel de Máquinas'),
('SG&A', 'Marketing', 'Publicidade e Propaganda'),
('SG&A', 'Marketing', 'Marketing Digital'),
('SG&A', 'Contratação de Terceiros', 'Serviços Contábeis'),
('SG&A', 'Contratação de Terceiros', 'Serviços Jurídicos'),
('SG&A', 'Contratação de Terceiros', 'Consultoria'),
('SG&A', 'TI/Software', 'Licenças de Software'),
('SG&A', 'TI/Software', 'Manutenção de Sistemas'),
('SG&A', 'Despesas de Veículos', 'Combustível'),
('SG&A', 'Despesas de Veículos', 'Manutenção de Veículos'),
('SG&A', 'Manutenção', 'Manutenção de Equipamentos'),
('SG&A', 'Manutenção', 'Manutenção Predial'),
('SG&A', 'Material de Uso e Consumo', 'Material de Expediente'),
('SG&A', 'Material de Uso e Consumo', 'Produtos de Limpeza'),
('SG&A', 'Deságio de Cartões', 'Taxa Visa Crédito'),
('SG&A', 'Deságio de Cartões', 'Taxa Mastercard Crédito'),
('SG&A', 'Deságio de Cartões', 'Taxa Elo Crédito'),
('SG&A', 'Deságio de Cartões', 'Taxa PIX'),
('SG&A', 'Impostos e Taxas', 'Simples Nacional'),
('SG&A', 'Impostos e Taxas', 'Taxas Diversas');