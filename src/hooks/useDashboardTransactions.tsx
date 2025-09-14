import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardTransaction {
  id: string;
  transaction_date: string;
  company_id: string;
  level_1_group: string;
  level_2_group: string;
  analytical_account: string;
  amount: number;
  description: string | null;
  observations: string | null;
  companies?: { name: string };
}

export function useDashboardTransactions(limit = 10, companyIds?: string[]) {
  return useQuery({
    queryKey: ['dashboard-transactions', limit, companyIds],
    queryFn: async (): Promise<DashboardTransaction[]> => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          companies(name)
        `)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply company filter if specified
      if (companyIds && companyIds.length > 0) {
        query = query.in('company_id', companyIds);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return data || [];
    }
  });
}