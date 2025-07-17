import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Budget {
  id: string;
  name: string;
  company_id: string;
  period_start: string;
  period_end: string;
  planned_amount: number;
  realized_amount: number;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  companies?: { name: string };
}

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async (): Promise<Budget[]> => {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          companies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch budgets: ${error.message}`);
      }

      return (data || []) as Budget[];
    }
  });
}