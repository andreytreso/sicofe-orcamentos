import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
}

export function useAccountHierarchy(filters?: AccountHierarchyFilters) {
  return useQuery({
    queryKey: ['account-hierarchy', filters],
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

      const { data, error } = await query
        .order('level_1', { ascending: true, nullsFirst: false })
        .order('level_2', { ascending: true, nullsFirst: false })
        .order('analytical_account', { ascending: true, nullsFirst: false });

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
  const { data: hierarchy = [] } = useAccountHierarchy();
  const level1Options = Array.from(
    new Set(
      hierarchy
        .map((item) => normalize(item.level_1))
        .filter((value) => value.length > 0)
    )
  );
  return level1Options;
}

export function useLevel2Options(level1?: string) {
  const { data: hierarchy = [] } = useAccountHierarchy();
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

export function useAnalyticalAccountOptions(level1?: string, level2?: string) {
  const { data: hierarchy = [] } = useAccountHierarchy();
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
