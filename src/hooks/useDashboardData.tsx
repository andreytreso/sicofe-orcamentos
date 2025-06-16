
import { useQuery } from '@tanstack/react-query';
import { ApprovalItem } from '@/types/approval';

// Mock data apenas com itens aprovados para o dashboard
const mockApprovedItems: ApprovalItem[] = [
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

export function useDashboardData() {
  const { data: approvedItems = [], isLoading } = useQuery({
    queryKey: ['dashboard-approved-items'],
    queryFn: async () => {
      // Simular API call que retorna apenas itens aprovados
      console.log('Fetching approved items for dashboard');
      return mockApprovedItems;
    }
  });

  return {
    approvedItems,
    isLoading
  };
}
