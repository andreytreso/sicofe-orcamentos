import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  status: string;
  company_id: string;
}

export function useCostCenters(companyId?: string) {
  return useQuery({
    queryKey: ['cost-centers', companyId],
    enabled: !!companyId,
    queryFn: async (): Promise<CostCenter[]> => {
      if (!companyId) return [];

      const { data, error } = await supabase
        .from('cost_centers')
        .select('id, code, name, status, company_id')
        .eq('company_id', companyId)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch cost centers: ${error.message}`);
      }

      return (data || []) as CostCenter[];
    }
  });
}

