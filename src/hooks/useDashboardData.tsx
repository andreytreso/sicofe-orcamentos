
import { useQuery } from '@tanstack/react-query';
import { ApprovalItem } from '@/types/approval';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardData() {
  const { data: approvedItems = [], isLoading } = useQuery({
    queryKey: ['dashboard-approved-items'],
    queryFn: async (): Promise<ApprovalItem[]> => {
      const { data, error } = await supabase
        .from('approval_items')
        .select(`
          *,
          companies(name)
        `)
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch approved items: ${error.message}`);
      }

      // Transform data to match ApprovalItem interface
      return (data || []).map(item => ({
        id: item.id,
        data: item.transaction_date,
        grupo1Nivel: item.level_1_group,
        grupo2Nivel: item.level_2_group,
        contaAnalitica: item.analytical_account,
        valor: Number(item.amount),
        solicitante: item.requester,
        status: 'APROVADO' as const,
        empresaId: item.company_id,
        periodo: item.period,
        level: item.approval_level as 1 | 2 | 3
      }));
    }
  });

  return {
    approvedItems,
    isLoading
  };
}
