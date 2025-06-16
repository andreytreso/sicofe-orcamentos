
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApprovalItem, ApprovalFilter, ApprovalAction, ApprovalHistoryItem } from '@/types/approval';
import { useToast } from '@/hooks/use-toast';

// Mock data expandido para demonstrar diferentes cenários
const mockApprovals: ApprovalItem[] = [
  {
    id: '1',
    data: '2024-12-15',
    grupo1Nivel: 'Receitas',
    grupo2Nivel: 'Receitas Operacionais',
    contaAnalitica: 'Vendas de Produtos',
    valor: 150000,
    solicitante: 'João Silva',
    status: 'PENDENTE',
    empresaId: '1',
    periodo: '2024-12',
    level: 3
  },
  {
    id: '2',
    data: '2024-12-14',
    grupo1Nivel: 'Despesas',
    grupo2Nivel: 'Despesas Administrativas',
    contaAnalitica: 'Material de Escritório',
    valor: 5000,
    solicitante: 'Maria Santos',
    status: 'PENDENTE',
    empresaId: '1',
    periodo: '2024-12',
    level: 3
  },
  {
    id: '3',
    data: '2024-12-13',
    grupo1Nivel: 'Despesas',
    grupo2Nivel: 'Despesas Operacionais',
    contaAnalitica: 'Salários',
    valor: 80000,
    solicitante: 'Carlos Lima',
    status: 'APROVADO',
    empresaId: '1',
    periodo: '2024-12',
    level: 3
  },
  {
    id: '4',
    data: '2024-11-30',
    grupo1Nivel: 'Receitas',
    grupo2Nivel: 'Receitas Extraordinárias',
    contaAnalitica: 'Venda de Ativos',
    valor: 25000,
    solicitante: 'Ana Costa',
    status: 'REPROVADO',
    empresaId: '2',
    periodo: '2024-11',
    level: 3
  },
  {
    id: '5',
    data: '2024-10-25',
    grupo1Nivel: 'Despesas',
    grupo2Nivel: 'Despesas Comerciais',
    contaAnalitica: 'Marketing Digital',
    valor: 12000,
    solicitante: 'Pedro Oliveira',
    status: 'PENDENTE',
    empresaId: '3',
    periodo: '2024-Q4',
    level: 3
  }
];

export function useApprovals(filters: ApprovalFilter) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasSearched, setHasSearched] = useState(false);

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals', filters, hasSearched],
    queryFn: async () => {
      if (!hasSearched) {
        return []; // Não retorna dados até que a busca seja executada
      }

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Fetching approvals with filters:', filters);
      return mockApprovals.filter(item => {
        if (filters.empresaId && item.empresaId !== filters.empresaId) return false;
        if (filters.periodo && item.periodo !== filters.periodo) return false;
        if (filters.status !== 'TODOS' && item.status !== filters.status) return false;
        return true;
      });
    },
    enabled: hasSearched // Só executa a query após busca manual
  });

  const search = useCallback(() => {
    setHasSearched(true);
    queryClient.invalidateQueries({ queryKey: ['approvals'] });
  }, [queryClient]);

  const approvalMutation = useMutation({
    mutationFn: async (action: ApprovalAction) => {
      console.log('Executing approval action:', action);
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
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
      console.log('Fetching history for approval:', approvalId);
      // Mock data
      return [
        {
          id: '1',
          data: '2024-12-15 10:30',
          usuario: 'João Silva',
          acao: 'Criado',
          comentario: 'Orçamento inicial criado'
        },
        {
          id: '2',
          data: '2024-12-15 14:20',
          usuario: 'Maria Santos',
          acao: 'Modificado',
          comentario: 'Valor ajustado conforme reunião'
        }
      ];
    },
    enabled: !!approvalId
  });
}
