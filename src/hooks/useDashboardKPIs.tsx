import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PeriodType } from '@/components/PeriodSelector';

interface KPIData {
  budget: { value: string; trend: { value: string; absoluteValue: string; isPositive: boolean } };
  realized: { value: string; trend: { value: string; absoluteValue: string; isPositive: boolean } };
  available: { value: string; trend: { value: string; absoluteValue: string; isPositive: boolean } };
  variation: { value: string; trend: { value: string; absoluteValue: string; isPositive: boolean } };
}

export function useDashboardKPIs(companyIds?: string[]) {
  return useQuery({
    queryKey: ['dashboard-kpis', companyIds],
    queryFn: async (): Promise<KPIData> => {
      try {
        // Obter dados das transações
        let query = supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: false });

        // Apply company filter if specified
        if (companyIds && companyIds.length > 0) {
          query = query.in('company_id', companyIds);
        }

        const { data: transactions, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch transactions: ${error.message}`);
        }

        // Calcular valores do ano atual completo (2024)
        const currentYear = new Date().getFullYear();
        const currentTransactions = (transactions || []).filter(t => {
          const transactionDate = new Date(t.transaction_date);
          return transactionDate.getFullYear() === currentYear;
        });

        // Calcular valores do ano anterior para comparação
        const previousTransactions = (transactions || []).filter(t => {
          const transactionDate = new Date(t.transaction_date);
          return transactionDate.getFullYear() === currentYear - 1;
        });

      // Calcular valores - As transações são orçamento planejado, não realizado
      const budget = currentTransactions.reduce((sum, t) => {
        // Considerar apenas despesas (valores negativos)
        if (t.level_1_group !== 'Receita Bruta') {
          return sum + Math.abs(Number(t.amount));
        }
        return sum;
      }, 0);

      const previousBudget = previousTransactions.reduce((sum, t) => {
        if (t.level_1_group !== 'Receita Bruta') {
          return sum + Math.abs(Number(t.amount));
        }
        return sum;
      }, 0);

      // Como não temos tabela de realizado ainda, realizado = 0
      const currentRealized = 0;
      const previousRealized = 0;

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