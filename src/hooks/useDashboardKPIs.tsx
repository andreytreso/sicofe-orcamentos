import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PeriodType } from '@/components/PeriodSelector';

interface KPIData {
  budget: { value: string; trend: { value: string; absoluteValue: string; isPositive: boolean } };
  realized: { value: string; trend: { value: string; absoluteValue: string; isPositive: boolean } };
  available: { value: string; trend: { value: string; absoluteValue: string; isPositive: boolean } };
  variation: { value: string; trend: { value: string; absoluteValue: string; isPositive: boolean } };
}

export function useDashboardKPIs(period: PeriodType) {
  return useQuery({
    queryKey: ['dashboard-kpis', period],
    queryFn: async (): Promise<KPIData> => {
      try {
        // Obter dados das transações
        const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      // Filtrar transações por período
      const now = new Date();
      const currentYear = now.getFullYear();
      let startDate: Date;
      let endDate = new Date(currentYear, 11, 31); // 31 de dezembro do ano atual

      switch (period) {
        case 'month':
          startDate = new Date(currentYear, now.getMonth(), 1);
          endDate = new Date(currentYear, now.getMonth() + 1, 0);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(currentYear, quarter * 3, 1);
          endDate = new Date(currentYear, (quarter + 1) * 3, 0);
          break;
        case 'year':
          startDate = new Date(currentYear, 0, 1);
          endDate = new Date(currentYear, 11, 31);
          break;
        case 'ytd':
          startDate = new Date(currentYear, 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(currentYear, now.getMonth(), 1);
          endDate = new Date(currentYear, now.getMonth() + 1, 0);
      }

      // Filtrar transações do período atual
      const currentTransactions = (transactions || []).filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      // Calcular período anterior para comparação
      let prevStartDate: Date;
      let prevEndDate: Date;

      switch (period) {
        case 'month':
          prevStartDate = new Date(currentYear, now.getMonth() - 1, 1);
          prevEndDate = new Date(currentYear, now.getMonth(), 0);
          break;
        case 'quarter':
          const prevQuarter = Math.floor(now.getMonth() / 3) - 1;
          if (prevQuarter < 0) {
            prevStartDate = new Date(currentYear - 1, 9, 1); // Q4 do ano anterior
            prevEndDate = new Date(currentYear - 1, 11, 31);
          } else {
            prevStartDate = new Date(currentYear, prevQuarter * 3, 1);
            prevEndDate = new Date(currentYear, (prevQuarter + 1) * 3, 0);
          }
          break;
        case 'year':
          prevStartDate = new Date(currentYear - 1, 0, 1);
          prevEndDate = new Date(currentYear - 1, 11, 31);
          break;
        case 'ytd':
          prevStartDate = new Date(currentYear - 1, 0, 1);
          prevEndDate = new Date(currentYear - 1, now.getMonth(), now.getDate());
          break;
        default:
          prevStartDate = new Date(currentYear, now.getMonth() - 1, 1);
          prevEndDate = new Date(currentYear, now.getMonth(), 0);
      }

      // Filtrar transações do período anterior
      const previousTransactions = (transactions || []).filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate >= prevStartDate && transactionDate <= prevEndDate;
      });

      // Calcular valores
      const currentRealized = currentTransactions.reduce((sum, t) => {
        // Considerar apenas despesas (valores negativos)
        if (t.level_1_group !== 'Receita Bruta') {
          return sum + Math.abs(Number(t.amount));
        }
        return sum;
      }, 0);

      const previousRealized = previousTransactions.reduce((sum, t) => {
        if (t.level_1_group !== 'Receita Bruta') {
          return sum + Math.abs(Number(t.amount));
        }
        return sum;
      }, 0);

      // Para orçamento, vamos usar uma meta baseada no realizado * 1.5 (simulação)
      // Em um sistema real, isso viria de uma tabela de orçamentos
      const budget = currentRealized * 1.5;
      const previousBudget = previousRealized * 1.5;

      const available = budget - currentRealized;
      const previousAvailable = previousBudget - previousRealized;

      const variation = budget > 0 ? (currentRealized / budget) * 100 : 0;
      const previousVariation = previousBudget > 0 ? (previousRealized / previousBudget) * 100 : 0;

      // Calcular tendências
      const budgetTrend = calculateTrend(budget, previousBudget);
      const realizedTrend = calculateTrend(currentRealized, previousRealized);
      const availableTrend = calculateTrend(available, previousAvailable);
      const variationTrend = calculateTrend(variation, previousVariation, true);

      return {
        budget: {
          value: formatCurrency(budget),
          trend: budgetTrend
        },
        realized: {
          value: formatCurrency(currentRealized),
          trend: realizedTrend
        },
        available: {
          value: formatCurrency(available),
          trend: availableTrend
        },
        variation: {
          value: `${variation.toFixed(1)}%`,
          trend: variationTrend
        }
      };
      } catch (error) {
        console.error('Error calculating KPIs:', error);
        // Retornar valores padrão em caso de erro
        return {
          budget: {
            value: 'R$ 0,00',
            trend: { value: '0%', absoluteValue: '0', isPositive: false }
          },
          realized: {
            value: 'R$ 0,00',
            trend: { value: '0%', absoluteValue: '0', isPositive: false }
          },
          available: {
            value: 'R$ 0,00',
            trend: { value: '0%', absoluteValue: '0', isPositive: false }
          },
          variation: {
            value: '0%',
            trend: { value: '0%', absoluteValue: '0', isPositive: false }
          }
        };
      }
    }
  });
}

function calculateTrend(current: number, previous: number, isPercentage = false) {
  if (previous === 0) {
    return {
      value: "0%",
      absoluteValue: "0",
      isPositive: false
    };
  }

  const difference = current - previous;
  const percentChange = (difference / previous) * 100;
  
  return {
    value: `${Math.abs(percentChange).toFixed(1)}%`,
    absoluteValue: isPercentage ? "0" : formatCurrency(Math.abs(difference)),
    isPositive: difference >= 0
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}