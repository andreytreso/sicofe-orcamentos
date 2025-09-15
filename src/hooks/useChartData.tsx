import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ChartDataPoint {
  month: string;
  receitas: number;
  despesas: number;
  meta: number;
  monthKey: string;
  receitasAcum?: number;
  despesasAcum?: number;
  metaAcum?: number;
}

export function useChartData(companyIds?: string[]) {
  return useQuery({
    queryKey: ['chart-data', companyIds],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      let query = supabase
        .from('transactions')
        .select('*')
        .gte('transaction_date', '2024-01-01')
        .lte('transaction_date', '2024-12-31')
        .order('transaction_date', { ascending: true });

      // Apply company filter if specified
      if (companyIds && companyIds.length > 0) {
        query = query.in('company_id', companyIds);
      }

      const { data: transactions, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch chart data: ${error.message}`);
      }

      // Agrupar transações por mês
      const monthlyData = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.transaction_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthName,
            receitas: 0,
            despesas: 0,
            meta: 0,
            monthKey
          };
        }
        
        const amount = Math.abs(Number(transaction.amount));
        
        if (transaction.level_1_group === 'Receita Bruta') {
          acc[monthKey].receitas += amount;
        } else {
          acc[monthKey].despesas += amount;
        }
        
        // Meta simples: despesas * 1.2
        acc[monthKey].meta = acc[monthKey].despesas * 1.2;
        
        return acc;
      }, {} as Record<string, ChartDataPoint>);

      // Converter para array e ordenar por mês
      const sortedData = Object.values(monthlyData).sort((a, b) =>
        a.monthKey.localeCompare(b.monthKey)
      );

      // Calcular valores acumulados
      let receitasAcum = 0;
      let despesasAcum = 0;
      let metaAcum = 0;

      const dataWithAccumulated = sortedData.map((item) => {
        receitasAcum += item.receitas;
        despesasAcum += item.despesas;
        metaAcum += item.meta;

        return {
          ...item,
          receitasAcum,
          despesasAcum,
          metaAcum
        };
      });

      return dataWithAccumulated as ChartDataPoint[];
    }
  });
}
