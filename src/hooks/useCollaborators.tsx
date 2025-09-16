import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Collaborator {
  id: string;
  name: string;
  group_name: string | null;
  status: 'active' | 'inactive';
  company_id: string;
  cost_center_id: string | null;
}

export function useCompanyCollaborators(companyId?: string) {
  return useQuery({
    queryKey: ['collaborators', companyId],
    enabled: !!companyId,
    queryFn: async (): Promise<Collaborator[]> => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('collaborators')
        .select('id, name, group_name, status, company_id, cost_center_id')
        .eq('company_id', companyId)
        .order('name', { ascending: true });
      if (error) throw new Error(`Failed to fetch collaborators: ${error.message}`);
      return (data || []) as Collaborator[];
    }
  });
}

