import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async (): Promise<Company[]> => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch companies: ${error.message}`);
      }

      return (data || []) as Company[];
    }
  });
}

export function useUserCompanies() {
  return useQuery({
    queryKey: ['user-companies'],
    queryFn: async (): Promise<Company[]> => {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          status,
          created_at,
          updated_at,
          user_company_access!inner(user_id)
        `)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch user companies: ${error.message}`);
      }

      return (data || []) as Company[];
    }
  });
}