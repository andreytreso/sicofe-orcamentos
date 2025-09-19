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
        .from('company_groups')
        .select('id, name, code, created_at, updated_at')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch company groups: ${error.message}`);
      }

      return (data || []).map((group) => ({
        id: group.id,
        name: group.name,
        code: group.code ?? null,
        created_at: group.created_at ?? '',
        updated_at: group.updated_at ?? '',
      }));
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

      return (data || []).map((c) => c.id!).filter(Boolean);
    },
    enabled: !!groupId
  });
}