import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AccountHierarchy {
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
  includeGlobal?: boolean;
}

async function resolveCompanyIds(provided?: string[]) {
  if (provided && provided.length > 0) {
    return provided.filter(Boolean);
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

  return (accessRows || [])
    .map((row) => row.company_id)
    .filter((value): value is string => Boolean(value));
}

export function useAccountHierarchy(filters?: AccountHierarchyFilters) {
  return useQuery({
    queryKey: ['account-hierarchy', filters],
    queryFn: async (): Promise<AccountHierarchy[]> => {
      const companyIds = await resolveCompanyIds(filters?.companyIds);
      const includeGlobal = filters?.includeGlobal ?? true;

      if (!includeGlobal && companyIds.length === 0) {
        return [];
      }

      let query = supabase
        .from('account_hierarchy')
        .select('*');

      if (companyIds.length > 0) {
        if (includeGlobal) {
          const inValues = companyIds.map((id) => `"${id}"`).join(',');
          const orFilter = [`company_id.in.(${inValues})`];
          orFilter.push('company_id.is.null');
          query = query.or(orFilter.join(','));
        } else {
          query = query.in('company_id', companyIds);
        }
      } else if (includeGlobal) {
        query = query.is('company_id', null);
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
    }
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
