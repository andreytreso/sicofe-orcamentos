-- Add admin override to SELECT policies so admins can view all records
begin;

-- companies
alter policy "Users can view companies they have access to"
  on public.companies
  using (
    exists (
      select 1 from public.user_company_access u
      where u.user_id = auth.uid() and u.company_id = companies.id
    )
    or public.is_admin(auth.uid())
  );

-- budgets
alter policy "Users can view budgets for their companies"
  on public.budgets
  using (
    company_id in (
      select uca.company_id from public.user_company_access uca where uca.user_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

-- cost_centers
alter policy "Users can view cost centers for their companies"
  on public.cost_centers
  using (
    company_id in (
      select uca.company_id from public.user_company_access uca where uca.user_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

-- suppliers
alter policy "Users can view suppliers for their companies"
  on public.suppliers
  using (
    company_id in (
      select uca.company_id from public.user_company_access uca where uca.user_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

-- transactions
alter policy "Users can view transactions for their companies"
  on public.transactions
  using (
    company_id in (
      select uca.company_id from public.user_company_access uca where uca.user_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

-- entries
alter policy "Users can view entries for their company budgets"
  on public.entries
  using (
    budget_id in (
      select b.id from public.budgets b
      where b.company_id in (
        select uca.company_id from public.user_company_access uca where uca.user_id = auth.uid()
      )
    )
    or public.is_admin(auth.uid())
  );

-- approval_items
alter policy "Users can view approval items for their companies"
  on public.approval_items
  using (
    company_id in (
      select uca.company_id from public.user_company_access uca where uca.user_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

-- chart_of_accounts
alter policy "Users can view chart of accounts for their companies"
  on public.chart_of_accounts
  using (
    company_id in (
      select uca.company_id from public.user_company_access uca where uca.user_id = auth.uid()
    )
    or public.is_admin(auth.uid())
  );

commit;