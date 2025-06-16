
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApprovalItem, ApprovalFilter, ApprovalAction, ApprovalHistoryItem } from '@/types/approval';
import { useToast } from '@/hooks/use-toast';

// Mock data para desenvolvimento
const mockApprovals: ApprovalItem[] = [
  {
    id: '1',
    data: '2024-06-15',
    grupo1Nivel: 'Receitas',
    grupo2Nivel: 'Receitas Operacionais',
    contaAnalitica: 'Vendas de Produtos',
    valor: 150000,
    solicitante: 'João Silva',
    status: 'PENDENTE',
    empresaId: '1',
    periodo: '2024-06',
    level: 3
  },
  {
    id: '2',
    data: '2024-06-15',
    grupo1Nivel: 'Despesas',
    grupo2Nivel: 'Despesas Administrativas',
    contaAnalitica: 'Material de Escritório',
    valor: 5000,
    solicitante: 'Maria Santos',
    status: 'PENDENTE',
    empresaId: '1',
    periodo: '2024-06',
    level: 3
  },
  {
    id: '3',
    data: '2024-06-14',
    grupo1Nivel: 'Despesas',
    grupo2Nivel: 'Despesas Operacionais',
    contaAnalitica: 'Salários',
    valor: 80000,
    solicitante: 'Carlos Lima',
    status: 'APROVADO',
    empresaId: '1',
    periodo: '2024-06',
    level: 3
  }
];

export function useApprovals(filters: ApprovalFilter) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals', filters],
    queryFn: async () => {
      // Simular API call
      console.log('Fetching approvals with filters:', filters);
      return mockApprovals.filter(item => {
        if (filters.empresaId && item.empresaId !== filters.empresaId) return false;
        if (filters.periodo && item.periodo !== filters.periodo) return false;
        if (filters.status !== 'TODOS' && item.status !== filters.status) return false;
        return true;
      });
    }
  });

  const approvalMutation = useMutation({
    mutationFn: async (action: ApprovalAction) => {
      console.log('Executing approval action:', action);
      // Simular API call
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
    isExecuting: approvalMutation.isPending
  };
}

export function useApprovalHistory(approvalId: string) {
  return useQuery({
    queryKey: ['approval-history', approvalId],
    queryFn: async (): Promise<ApprovalHistoryItem[]> => {
      console.log('Fetching history for approval:', approvalId);
      // Mock data
      return [
        {
          id: '1',
          data: '2024-06-15 10:30',
          usuario: 'João Silva',
          acao: 'Criado',
          comentario: 'Orçamento inicial criado'
        },
        {
          id: '2',
          data: '2024-06-15 14:20',
          usuario: 'Maria Santos',
          acao: 'Modificado',
          comentario: 'Valor ajustado conforme reunião'
        }
      ];
    },
    enabled: !!approvalId
  });
}
