import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Supplier {
  id: string;
  name: string;
  status?: string | null;
  company_id: string;
}

export function useCompanySuppliers(companyId?: string) {
  return useQuery({
    queryKey: ['suppliers', companyId],
    enabled: !!companyId,
    queryFn: async (): Promise<Supplier[]> => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, status, company_id')
        .eq('company_id', companyId)
        .order('name', { ascending: true });
      if (error) throw new Error(`Failed to fetch suppliers: ${error.message}`);
      return (data || []) as Supplier[];
    }
  });
}

