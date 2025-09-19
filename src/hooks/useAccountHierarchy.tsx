import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserCompanies } from '@/hooks/useCompanies';

export interface AccountHierarchy {
  id: string | null;
  level_1: string | null;
  level_2: string | null;
  analytical_account: string | null;
  company_id: string | null;
  created_at: string | null;
  group_id: string | null;
  type: string | null;
  code_analytical: string | null;
  code_level_1: string | null;
  code_level_2: string | null;
  status: string | null;
}

export interface AccountHierarchyFilters {
  level_1?: string;
  level_2?: string;
  analytical_account?: string;
  companyIds?: string[];
  groupId?: string;
}

export type UseAccountHierarchyOptions = Pick<UseQueryOptions<AccountHierarchy[], Error>, 'enabled'>;

function useAccessibleCompanyIds() {
  const { data: userCompanies = [] } = useUserCompanies();

  return useMemo(() => userCompanies.map((company) => company.id).filter(Boolean), [userCompanies]);
}

export function useAccountHierarchy(filters?: AccountHierarchyFilters, options?: UseAccountHierarchyOptions) {
  return useQuery({
    queryKey: ['account-hierarchy', filters],
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<AccountHierarchy[]> => {
      let query = supabase
        .from('account_hierarchy')
        .select('*');

      if (filters?.companyIds && filters.companyIds.length > 0) {
        query = query.in('company_id', filters.companyIds);
      }

      if (filters?.level_1) {
        query = query.eq('level_1', filters.level_1);
      }
      if (filters?.level_2) {
        query = query.eq('level_2', filters.level_2);
      }
      if (filters?.analytical_account) {
        query = query.eq('analytical_account', filters.analytical_account);
      }
      if (filters?.groupId) {
        query = query.eq('group_id', filters.groupId);
      }

      const { data, error } = await query
        .order('level_1', { ascending: true, nullsFirst: false })
        .order('level_2', { ascending: true, nullsFirst: false })
        .order('analytical_account', { ascending: true, nullsFirst: false });

      console.log('[useAccountHierarchy] response', {
        filters,
        count: (data || []).length,
        sample: (data || []).slice(0, 3),
        error,
      });

      if (error) {
        throw new Error(`Failed to fetch account hierarchy: ${error.message}`);
      }

      return data || [];
    },
  });
}

function normalize(value?: string | null) {
  return (value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
}

export function useLevel1Options() {
  const companyIds = useAccessibleCompanyIds();
  const filters = useMemo<AccountHierarchyFilters | undefined>(() => {
    if (companyIds.length === 0) return undefined;
    return { companyIds };
  }, [companyIds]);
  const { data: hierarchy = [] } = useAccountHierarchy(filters);
  const level1Options = Array.from(
    new Set(
      hierarchy
        .map((item) => normalize(item.level_1))
        .filter((value) => value.length > 0)
    )
  );
  return level1Options;
}

export function useLevel2Options(level1?: string, groupId?: string) {
  const companyIds = useAccessibleCompanyIds();
  const filters = useMemo<AccountHierarchyFilters | undefined>(() => {
    const base: AccountHierarchyFilters = {};

    if (companyIds.length > 0) {
      base.companyIds = companyIds;
    }
    if (level1) {
      base.level_1 = level1;
    }
    if (groupId) {
      base.groupId = groupId;
    }

    return Object.keys(base).length > 0 ? base : undefined;
  }, [companyIds, level1, groupId]);

  const { data: hierarchy = [] } = useAccountHierarchy(filters);
  const l1 = normalize(level1);
  const level2Options = Array.from(
    new Set(
      hierarchy
        .filter((item) => !l1 || normalize(item.level_1) === l1)
        .map((item) => normalize(item.level_2))
        .filter((value) => value.length > 0)
    )
  );
  return level2Options;
}

export function useAnalyticalAccountOptions(level1?: string, level2?: string, groupId?: string) {
  const companyIds = useAccessibleCompanyIds();
  const filters = useMemo<AccountHierarchyFilters | undefined>(() => {
    const base: AccountHierarchyFilters = {};

    if (companyIds.length > 0) {
      base.companyIds = companyIds;
    }
    if (level1) {
      base.level_1 = level1;
    }
    if (level2) {
      base.level_2 = level2;
    }
    if (groupId) {
      base.groupId = groupId;
    }

    return Object.keys(base).length > 0 ? base : undefined;
  }, [companyIds, level1, level2]);

  const { data: hierarchy = [] } = useAccountHierarchy(filters);
  const l1 = normalize(level1);
  const l2 = normalize(level2);
  const analyticalOptions = Array.from(
    new Set(
      hierarchy
        .filter(
          (item) => (!l1 || normalize(item.level_1) === l1) && (!l2 || normalize(item.level_2) === l2)
        )
        .map((item) => normalize(item.analytical_account))
        .filter((value) => value.length > 0)
    )
  );
  return analyticalOptions;
}












