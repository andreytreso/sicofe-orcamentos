import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyGroup {
  id: string;
  name: string;
  code: string | null;
  created_at: string;
  updated_at: string;
}

export function useCompanyGroups() {
  return useQuery({
    queryKey: ['company-groups'],
    queryFn: async (): Promise<CompanyGroup[]> => {
      const { data, error } = await supabase
        .from('companies_with_group')
        .select('group_id, group_name, group_code')
        .not('group_id', 'is', null)
        .order('group_name');

      if (error) {
        throw new Error(`Failed to fetch company groups: ${error.message}`);
      }

      // Remove duplicates based on group_id
      const uniqueGroups = (data || []).reduce((acc, current) => {
        const exists = acc.find(item => item.id === current.group_id);
        if (!exists) {
          acc.push({
            id: current.group_id!,
            name: current.group_name!,
            code: current.group_code || null,
            created_at: '',
            updated_at: ''
          });
        }
        return acc;
      }, [] as CompanyGroup[]);

      return uniqueGroups;
    }
  });
}

export function useCompaniesByGroup(groupId: string | null) {
  return useQuery({
    queryKey: ['companies-by-group', groupId],
    queryFn: async (): Promise<string[]> => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('companies_with_group')
        .select('id')
        .eq('group_id', groupId);

      if (error) {
        throw new Error(`Failed to fetch companies by group: ${error.message}`);
      }

      return (data || []).map(c => c.id!).filter(Boolean);
    },
    enabled: !!groupId
  });
}