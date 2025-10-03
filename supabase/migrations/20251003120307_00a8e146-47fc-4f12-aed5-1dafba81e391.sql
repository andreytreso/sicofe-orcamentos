-- Criar trigger para automaticamente criar approval_items quando uma transaction é criada
CREATE OR REPLACE FUNCTION public.create_approval_item_from_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar item de aprovação para a nova transação
  INSERT INTO public.approval_items (
    company_id,
    user_id,
    transaction_date,
    period,
    level_1_group,
    level_2_group,
    analytical_account,
    amount,
    requester,
    status,
    approval_level
  )
  VALUES (
    NEW.company_id,
    NEW.user_id,
    NEW.transaction_date,
    NEW.year::text || '-' || LPAD(NEW.competency_months[1]::text, 2, '0'), -- Formato: YYYY-MM
    NEW.level_1_group,
    NEW.level_2_group,
    NEW.analytical_account,
    NEW.amount,
    (SELECT COALESCE(first_name || ' ' || last_name, 'Usuário') FROM profiles WHERE user_id = NEW.user_id),
    'PENDING',
    3 -- Nível analítico por padrão
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger que dispara após inserção de transaction
DROP TRIGGER IF EXISTS create_approval_on_transaction_insert ON transactions;
CREATE TRIGGER create_approval_on_transaction_insert
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION create_approval_item_from_transaction();

-- Atualizar RLS policies para approval_items - apenas aprovadores podem visualizar
DROP POLICY IF EXISTS "Users can view approval items for their companies" ON approval_items;
CREATE POLICY "Approvers can view approval items for their companies"
  ON approval_items
  FOR SELECT
  USING (
    -- Admin pode ver tudo
    is_admin(auth.uid())
    OR
    -- Aprovador pode ver itens das empresas que tem acesso
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND aprovador = true
      )
      AND company_id IN (
        SELECT uca.company_id
        FROM user_company_access uca
        WHERE uca.user_id = auth.uid()
      )
    )
  );

-- Atualizar RLS policy para update - apenas aprovadores podem atualizar
DROP POLICY IF EXISTS "Users can update approval items for their companies" ON approval_items;
CREATE POLICY "Approvers can update approval items for their companies"
  ON approval_items
  FOR UPDATE
  USING (
    -- Admin pode atualizar tudo
    is_admin(auth.uid())
    OR
    -- Aprovador pode atualizar itens das empresas que tem acesso
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND aprovador = true
      )
      AND company_id IN (
        SELECT uca.company_id
        FROM user_company_access uca
        WHERE uca.user_id = auth.uid()
      )
    )
  );

-- Atualizar RLS policy para approval_history - apenas aprovadores podem inserir histórico
DROP POLICY IF EXISTS "Users can insert approval history" ON approval_history;
CREATE POLICY "Approvers can insert approval history"
  ON approval_history
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    AND (
      -- Admin pode inserir
      is_admin(auth.uid())
      OR
      -- Aprovador pode inserir para itens das empresas que tem acesso
      (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE user_id = auth.uid() 
          AND aprovador = true
        )
        AND approval_item_id IN (
          SELECT ai.id
          FROM approval_items ai
          WHERE ai.company_id IN (
            SELECT uca.company_id
            FROM user_company_access uca
            WHERE uca.user_id = auth.uid()
          )
        )
      )
    )
  );

-- Atualizar RLS policy para visualização de histórico
DROP POLICY IF EXISTS "Users can view approval history for their companies" ON approval_history;
CREATE POLICY "Approvers can view approval history for their companies"
  ON approval_history
  FOR SELECT
  USING (
    -- Admin pode ver tudo
    is_admin(auth.uid())
    OR
    -- Aprovador pode ver histórico dos itens das empresas que tem acesso
    (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND aprovador = true
      )
      AND approval_item_id IN (
        SELECT ai.id
        FROM approval_items ai
        WHERE ai.company_id IN (
          SELECT uca.company_id
          FROM user_company_access uca
          WHERE uca.user_id = auth.uid()
        )
      )
    )
  );