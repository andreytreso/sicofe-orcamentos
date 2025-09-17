import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Supplier {
  id: string;
  name: string;
  status?: string | null;
  company_id: string | null;
  company_name?: string | null;
  group_id?: string | null;
}

async function resolveCompanyIds(baseCompanyId?: string) {
  if (baseCompanyId) {
    return [baseCompanyId];
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw new Error(`Failed to identify user: ${userError.message}`);
  }

  const userId = userResult.user?.id;
  if (!userId) {
    return [];
  }

  const { data: accessRows, error: accessError } = await supabase
    .from('user_company_access')
    .select('company_id')
    .eq('user_id', userId);

  if (accessError) {
    throw new Error(`Failed to resolve accessible companies: ${accessError.message}`);
  }

  const ids = (accessRows || [])
    .map((row) => row.company_id)
    .filter((value): value is string => Boolean(value));

  if (ids.length > 0) {
    return ids;
  }

  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id');

  if (companiesError) {
    throw new Error(`Failed to fetch companies: ${companiesError.message}`);
  }

  return (companies || [])
    .map((row) => row.id)
    .filter((value): value is string => Boolean(value));
}

async function resolveGroupIds(companyIds: string[], explicitGroupId?: string) {
  const groupIds = new Set<string>();

  if (explicitGroupId) {
    groupIds.add(explicitGroupId);
  }

  if (companyIds.length > 0) {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, group_id')
      .in('id', companyIds);

    if (error) {
      throw new Error(`Failed to fetch company groups: ${error.message}`);
    }

    (companies || []).forEach((company) => {
      if (company.group_id) {
        groupIds.add(company.group_id);
      }
    });
  }

  return Array.from(groupIds);
}

export function useCompanySuppliers(companyId?: string, groupId?: string) {
  return useQuery({
    queryKey: ['suppliers', companyId, groupId],
    queryFn: async (): Promise<Supplier[]> => {
      const companyIds = await resolveCompanyIds(companyId);
      const groupIds = await resolveGroupIds(companyIds, groupId);

      if (companyIds.length === 0 && groupIds.length === 0) {
        return [];
      }

      // Debug logs to help troubleshoot why queries may return empty results
      try {
        // eslint-disable-next-line no-console
        console.debug('[useCompanySuppliers] companyIds:', companyIds);
        // eslint-disable-next-line no-console
        console.debug('[useCompanySuppliers] explicit groupId:', groupId, 'resolved groupIds:', groupIds);
      } catch (e) {
        // ignore
      }

      let query = supabase
        .from('suppliers_with_details')
        .select('id, name, status, company_id, company_name, group_id');

      const orFilters: string[] = [];
      if (companyIds.length > 0) {
        const companyFilter = companyIds.map((id) => `"${id}"`).join(',');
        orFilters.push(`company_id.in.(${companyFilter})`);
      }
      if (groupIds.length > 0) {
        const groupFilter = groupIds.map((id) => `"${id}"`).join(',');
        orFilters.push(`group_id.in.(${groupFilter})`);
      }
      if (orFilters.length > 0) {
        const orString = orFilters.join(',');
        // eslint-disable-next-line no-console
        console.debug('[useCompanySuppliers] orFilters:', orString);
        query = query.or(orString);
      }

      const { data, error } = await query.order('name', { ascending: true });

      // eslint-disable-next-line no-console
      console.debug('[useCompanySuppliers] fetched suppliers count:', (data || []).length);
      if (error) {
        throw new Error(`Failed to fetch suppliers: ${error.message}`);
      }

      const unique = new Map<string, Supplier>();
      (data || []).forEach((supplier) => {
        if (supplier.id && !unique.has(supplier.id)) {
          unique.set(supplier.id, supplier as Supplier);
        }
      });

      return Array.from(unique.values());
    },
  });
}

export function useSuppliersByCompanyIds(companyIds?: string[]) {
  return useQuery({
    queryKey: ['suppliers-by-companies', companyIds],
    queryFn: async (): Promise<Supplier[]> => {
      if (!companyIds || companyIds.length === 0) return [];

      // debug
      try {
        // eslint-disable-next-line no-console
        console.debug('[useSuppliersByCompanyIds] requested companyIds:', companyIds);
      } catch (e) {}

      let query = supabase
        .from('suppliers_with_details')
        .select('id, name, status, company_id, company_name, group_id');

      const idsFilter = companyIds.map((id) => `"${id}"`).join(',');
      query = query.in('company_id', companyIds);

      const { data, error } = await query.order('name', { ascending: true });
      if (error) {
        // eslint-disable-next-line no-console
        console.error('[useSuppliersByCompanyIds] fetch error:', error.message || error);
      }

      // eslint-disable-next-line no-console
      console.debug('[useSuppliersByCompanyIds] fetched suppliers count:', (data || []).length);
      if (error) {
        throw new Error(`Failed to fetch suppliers by companies: ${error.message}`);
      }

      const unique = new Map<string, Supplier>();
      (data || []).forEach((supplier) => {
        if ((supplier as any).id && !unique.has((supplier as any).id)) {
          unique.set((supplier as any).id, supplier as Supplier);
        }
      });

      return Array.from(unique.values());
    },
    enabled: !!companyIds && companyIds.length > 0,
  });
}
