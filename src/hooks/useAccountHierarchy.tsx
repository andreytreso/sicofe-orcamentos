import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AccountHierarchy {
  id: string;
  level_1: string;
  level_2: string;
  analytical_account: string;
  created_at: string;
}

export function useAccountHierarchy() {
  return useQuery({
    queryKey: ['account-hierarchy'],
    queryFn: async (): Promise<AccountHierarchy[]> => {
      const { data, error } = await supabase
        .from('account_hierarchy')
        .select('*')
        .order('level_1, level_2, analytical_account');

      if (error) {
        throw new Error(`Failed to fetch account hierarchy: ${error.message}`);
      }

      return data || [];
    }
  });
}

export function useLevel1Options() {
  const { data: hierarchy = [] } = useAccountHierarchy();
  
  const level1Options = [...new Set(hierarchy.map(item => item.level_1))];
  return level1Options;
}

export function useLevel2Options(level1: string) {
  const { data: hierarchy = [] } = useAccountHierarchy();
  
  const level2Options = hierarchy
    .filter(item => item.level_1 === level1)
    .map(item => item.level_2)
    .filter((value, index, array) => array.indexOf(value) === index);
    
  return level2Options;
}

export function useAnalyticalAccountOptions(level1: string, level2: string) {
  const { data: hierarchy = [] } = useAccountHierarchy();
  
  const analyticalOptions = hierarchy
    .filter(item => item.level_1 === level1 && item.level_2 === level2)
    .map(item => item.analytical_account);
    
  return analyticalOptions;
}