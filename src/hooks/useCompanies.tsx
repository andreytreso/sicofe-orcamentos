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

export interface CompanyWithGroup {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  group_id: string | null;
  group_name: string | null;
  group_code: string | null;
}

export function useUserCompanies() {
  return useQuery({
    queryKey: ['user-companies'],
    queryFn: async (): Promise<CompanyWithGroup[]> => {
      const { data, error } = await supabase
        .from('companies_with_group')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch user companies: ${error.message}`);
      }

      return (data || []) as CompanyWithGroup[];
    }
  });
}