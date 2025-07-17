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

export function useDashboardTransactions(limit = 10) {
  return useQuery({
    queryKey: ['dashboard-transactions', limit],
    queryFn: async (): Promise<DashboardTransaction[]> => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          companies(name)
        `)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      return data || [];
    }
  });
}