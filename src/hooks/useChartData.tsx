import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PeriodType } from '@/components/PeriodSelector';

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

export function useChartData(selectedPeriod: PeriodType) {
  return useQuery({
    queryKey: ['chart-data', selectedPeriod],
    queryFn: async (): Promise<ChartDataPoint[]> => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('transaction_date', '2024-01-01')
        .lte('transaction_date', '2024-12-31');

      if (error) {
        throw new Error(`Failed to fetch chart data: ${error.message}`);
      }

      // Group transactions by month
      const monthlyData: { [key: string]: { receitas: number; despesas: number } } = {};
      
      (data || []).forEach(transaction => {
        const date = new Date(transaction.transaction_date);
        const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
        const month = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { receitas: 0, despesas: 0 };
        }
        
        if (transaction.amount > 0) {
          monthlyData[monthKey].receitas += transaction.amount;
        } else {
          monthlyData[monthKey].despesas += Math.abs(transaction.amount);
        }
      });

      // Convert to chart format
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const chartData: ChartDataPoint[] = months.map((month, index) => {
        const monthKey = `${String(index + 1).padStart(2, '0')}-2024`;
        const data = monthlyData[monthKey] || { receitas: 0, despesas: 0 };
        
        return {
          month,
          receitas: data.receitas,
          despesas: data.despesas,
          meta: Math.max(data.receitas, data.despesas) * 1.1, // Simple meta calculation
          monthKey
        };
      });

      // Calculate accumulated values
      let receitasAcum = 0;
      let despesasAcum = 0;
      let metaAcum = 0;
      
      return chartData.map(item => {
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
    }
  });
}