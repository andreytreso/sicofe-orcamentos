
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApprovalItem, ApprovalFilter, ApprovalAction, ApprovalHistoryItem } from '@/types/approval';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useApprovals(filters: ApprovalFilter) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasSearched, setHasSearched] = useState(false);

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals', filters, hasSearched],
    queryFn: async (): Promise<ApprovalItem[]> => {
      if (!hasSearched) {
        return []; // Não retorna dados até que a busca seja executada
      }

      let query = supabase
        .from('approval_items')
        .select(`
          *,
          companies(name),
          transactions(observations)
        `)
        .order('created_at', { ascending: false });

      if (filters.empresaId && filters.empresaId !== 'all') {
        query = query.eq('company_id', filters.empresaId);
      }

      if (filters.periodo) {
        query = query.eq('period', filters.periodo);
      }

      if (filters.status !== 'TODOS') {
        const statusMap = {
          'PENDENTE': 'PENDING',
          'APROVADO': 'APPROVED', 
          'REPROVADO': 'REJECTED'
        };
        query = query.eq('status', statusMap[filters.status as keyof typeof statusMap]);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch approvals: ${error.message}`);
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
        status: item.status === 'PENDING' ? 'PENDENTE' : 
               item.status === 'APPROVED' ? 'APROVADO' : 'REPROVADO',
        empresaId: item.company_id,
        periodo: item.period,
        observacoes: item.transactions?.[0]?.observations || '',
        level: item.approval_level as 1 | 2 | 3
      }));
    },
    enabled: hasSearched // Só executa a query após busca manual
  });

  const search = useCallback(() => {
    setHasSearched(true);
    queryClient.invalidateQueries({ queryKey: ['approvals'] });
  }, [queryClient]);

  const approvalMutation = useMutation({
    mutationFn: async (action: ApprovalAction) => {
      const newStatus = action.acao === 'APROVAR' ? 'APPROVED' : 'REJECTED';
      
      const { error } = await supabase
        .from('approval_items')
        .update({ status: newStatus })
        .in('id', action.ids);

      if (error) {
        throw new Error(`Failed to update approval status: ${error.message}`);
      }

      // Insert history records
      for (const id of action.ids) {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const { error: historyError } = await supabase
            .from('approval_history')
            .insert({
              approval_item_id: id,
              user_id: user.user.id,
              action: action.acao,
              comment: action.comentario
            });

           if (historyError) {
            console.error('Failed to insert history:', historyError);
          }
        }
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      const actionText = variables.acao === 'APROVAR' ? 'aprovados' : 'reprovados';
      toast({
        title: "Ação concluída",
        description: `${variables.ids.length} item(s) ${actionText} com sucesso`,
        variant: variables.acao === 'APROVAR' ? 'default' : 'destructive'
      });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao executar ação. Tente novamente.",
        variant: 'destructive'
      });
    }
  });

  const executeAction = useCallback((action: ApprovalAction) => {
    approvalMutation.mutate(action);
  }, [approvalMutation]);

  return {
    approvals,
    isLoading,
    executeAction,
    isExecuting: approvalMutation.isPending,
    search,
    hasSearched
  };
}

export function useApprovalHistory(approvalId: string) {
  return useQuery({
    queryKey: ['approval-history', approvalId],
    queryFn: async (): Promise<ApprovalHistoryItem[]> => {
      const { data, error } = await supabase
        .from('approval_history')
        .select('*')
        .eq('approval_item_id', approvalId)
        .order('created_at');

      if (error) {
        throw new Error(`Failed to fetch approval history: ${error.message}`);
      }

      return (data || []).map(item => ({
        id: item.id,
        data: new Date(item.created_at).toLocaleString('pt-BR'),
        usuario: 'Usuário do Sistema',
        acao: item.action,
        comentario: item.comment || ''
      }));
    },
    enabled: !!approvalId
  });
}
