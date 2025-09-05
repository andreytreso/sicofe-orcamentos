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

export function useAccountHierarchy(filters?: {
  level_1?: string;
  level_2?: string;
  analytical_account?: string;
}) {
  return useQuery({
    queryKey: ['account-hierarchy', filters],
    queryFn: async (): Promise<AccountHierarchy[]> => {
      let query = supabase
        .from('account_hierarchy')
        .select('*');

      // Apply filters if provided
      if (filters?.level_1) {
        query = query.eq('level_1', filters.level_1);
      }
      if (filters?.level_2) {
        query = query.eq('level_2', filters.level_2);
      }
      if (filters?.analytical_account) {
        query = query.eq('analytical_account', filters.analytical_account);
      }

      const { data, error } = await query.order('level_1, level_2, analytical_account');

      if (error) {
        throw new Error(`Failed to fetch account hierarchy: ${error.message}`);
      }

      return data || [];
    }
  });
}

export function useLevel1Options() {
  const { data: hierarchy = [] } = useAccountHierarchy();
  
  const level1Options = [...new Set(hierarchy.map(item => item.level_1).filter(Boolean))];
  return level1Options;
}

export function useLevel2Options(level1?: string) {
  const { data: hierarchy = [] } = useAccountHierarchy();
  
  const level2Options = hierarchy
    .filter(item => !level1 || item.level_1 === level1)
    .map(item => item.level_2)
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
    
  return level2Options;
}

export function useAnalyticalAccountOptions(level1?: string, level2?: string) {
  const { data: hierarchy = [] } = useAccountHierarchy();
  
  const analyticalOptions = hierarchy
    .filter(item => 
      (!level1 || item.level_1 === level1) && 
      (!level2 || item.level_2 === level2)
    )
    .map(item => item.analytical_account)
    .filter(Boolean);
    
  return analyticalOptions;
}