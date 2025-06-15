
import { useState } from 'react';
import { StatsCard } from "@/components/StatsCard";
import { PeriodSelector, PeriodType } from "@/components/PeriodSelector";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const chartData = [
  {
    month: "Jan",
    receitas: 45000,
    despesas: 32000,
  },
  {
    month: "Fev",
    receitas: 52000,
    despesas: 38000,
  },
  {
    month: "Mar",
    receitas: 48000,
    despesas: 35000,
  },
  {
    month: "Abr",
    receitas: 61000,
    despesas: 42000,
  },
  {
    month: "Mai",
    receitas: 55000,
    despesas: 40000,
  },
  {
    month: "Jun",
    receitas: 67000,
    despesas: 45000,
  },
];

const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "#059669",
  },
  despesas: {
    label: "Despesas",
    color: "#dc2626",
  },
};

// Mock data based on period - in real app this would come from API
const getKPIData = (period: PeriodType) => {
  const data = {
    month: {
      budget: { value: "R$ 150.000,00", trend: { value: "12%", absoluteValue: "R$ 18.000", isPositive: true } },
      realized: { value: "R$ 87.500,00", trend: { value: "8%", absoluteValue: "R$ 6.500", isPositive: true } },
      available: { value: "R$ 62.500,00", trend: { value: "5%", absoluteValue: "R$ 2.800", isPositive: false } },
      variation: { value: "58,3%", trend: { value: "3%", absoluteValue: "0", isPositive: true } }
    },
    quarter: {
      budget: { value: "R$ 450.000,00", trend: { value: "15%", absoluteValue: "R$ 58.500", isPositive: true } },
      realized: { value: "R$ 287.500,00", trend: { value: "12%", absoluteValue: "R$ 30.800", isPositive: true } },
      available: { value: "R$ 162.500,00", trend: { value: "8%", absoluteValue: "R$ 12.000", isPositive: false } },
      variation: { value: "63,9%", trend: { value: "6%", absoluteValue: "0", isPositive: true } }
    },
    year: {
      budget: { value: "R$ 1.800.000,00", trend: { value: "18%", absoluteValue: "R$ 274.500", isPositive: true } },
      realized: { value: "R$ 1.125.000,00", trend: { value: "14%", absoluteValue: "R$ 138.200", isPositive: true } },
      available: { value: "R$ 675.000,00", trend: { value: "10%", absoluteValue: "R$ 61.400", isPositive: false } },
      variation: { value: "62,5%", trend: { value: "4%", absoluteValue: "0", isPositive: true } }
    },
    ytd: {
      budget: { value: "R$ 900.000,00", trend: { value: "16%", absoluteValue: "R$ 124.100", isPositive: true } },
      realized: { value: "R$ 562.500,00", trend: { value: "11%", absoluteValue: "R$ 55.700", isPositive: true } },
      available: { value: "R$ 337.500,00", trend: { value: "7%", absoluteValue: "R$ 22.000", isPositive: false } },
      variation: { value: "62,5%", trend: { value: "2%", absoluteValue: "0", isPositive: true } }
    }
  };
  return data[period];
};

const tooltips = {
  budget: "Valor planejado para o período selecionado.",
  realized: "Despesas liquidadas até hoje.",
  available: "Orçamento Total – Realizado.",
  variation: "Realizado ÷ Orçamento Total."
};

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const kpiData = getKPIData(selectedPeriod);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-sicofe-navy">Dashboard</h1>
          <p className="text-sicofe-gray mt-2">
            Visão geral do controle orçamentário
          </p>
        </div>
        
        <PeriodSelector 
          value={selectedPeriod} 
          onChange={setSelectedPeriod}
          className="mt-1"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Orçamento Total"
          value={kpiData.budget.value}
          icon={DollarSign}
          tooltip={tooltips.budget}
          trend={kpiData.budget.trend}
        />
        <StatsCard
          title="Realizado"
          value={kpiData.realized.value}
          icon={TrendingUp}
          tooltip={tooltips.realized}
          trend={kpiData.realized.trend}
        />
        <StatsCard
          title="Disponível"
          value={kpiData.available.value}
          icon={PieChart}
          tooltip={tooltips.available}
          trend={kpiData.available.trend}
        />
        <StatsCard
          title="Variação"
          value={kpiData.variation.value}
          icon={TrendingDown}
          tooltip={tooltips.variation}
          trend={kpiData.variation.trend}
        />
      </div>

      {/* Charts and Additional Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-sicofe-navy mb-4">
            Receitas vs Despesas
          </h3>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis 
                tick={{ fill: '#334155', fontSize: 12, fontWeight: 500 }}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Bar 
                dataKey="receitas" 
                fill="var(--color-receitas)" 
                style={{ cursor: 'default' }}
              />
              <Bar 
                dataKey="despesas" 
                fill="var(--color-despesas)" 
                style={{ cursor: 'default' }}
              />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-sicofe-navy mb-4">
            Últimos Lançamentos
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-sicofe-gray-dark">Receita de Vendas</span>
              <span className="text-sm font-medium text-sicofe-green">+R$ 25.000,00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-sicofe-gray-dark">Despesas Operacionais</span>
              <span className="text-sm font-medium text-sicofe-red">-R$ 15.500,00</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-sicofe-gray-dark">Marketing</span>
              <span className="text-sm font-medium text-sicofe-red">-R$ 8.200,00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
