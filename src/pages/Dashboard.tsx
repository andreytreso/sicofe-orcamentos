import { useState } from 'react';
import { StatsCard } from "@/components/StatsCard";
import { PeriodSelector, PeriodType } from "@/components/PeriodSelector";
import { LancamentoDetalhe } from "@/components/LancamentoDetalhe";
import { TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUp, ArrowDown, Megaphone } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router-dom";

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

// Mock data for recent transactions
const recentTransactions = [
  {
    id: '1',
    data: '15/06/2025',
    tipo: 'receita' as const,
    descricao: 'Receita de Vendas',
    valor: 25000,
    empresa: 'Empresa A',
    centroCusto: 'Vendas',
    observacoes: 'Venda de produtos para cliente premium'
  },
  {
    id: '2',
    data: '14/06/2025',
    tipo: 'despesa' as const,
    descricao: 'Despesas Operacionais',
    valor: -15500,
    empresa: 'Empresa A',
    centroCusto: 'Operações',
    observacoes: 'Custos mensais de operação'
  },
  {
    id: '3',
    data: '13/06/2025',
    tipo: 'marketing' as const,
    descricao: 'Marketing',
    valor: -8200,
    empresa: 'Empresa B',
    centroCusto: 'Marketing',
    observacoes: 'Campanha publicitária digital'
  },
  {
    id: '4',
    data: '12/06/2025',
    tipo: 'receita' as const,
    descricao: 'Receita de Serviços',
    valor: 18000,
    empresa: 'Empresa A',
    centroCusto: 'Serviços',
  },
  {
    id: '5',
    data: '11/06/2025',
    tipo: 'despesa' as const,
    descricao: 'Aluguel',
    valor: -12000,
    empresa: 'Empresa A',
    centroCusto: 'Administração',
  },
  {
    id: '6',
    data: '10/06/2025',
    tipo: 'marketing' as const,
    descricao: 'Google Ads',
    valor: -5500,
    empresa: 'Empresa B',
    centroCusto: 'Marketing',
    observacoes: 'Campanha de aquisição de clientes'
  },
  {
    id: '7',
    data: '09/06/2025',
    tipo: 'receita' as const,
    descricao: 'Receita de Consultoria',
    valor: 32000,
    empresa: 'Empresa A',
    centroCusto: 'Consultoria',
  },
  {
    id: '8',
    data: '08/06/2025',
    tipo: 'despesa' as const,
    descricao: 'Fornecedores',
    valor: -22000,
    empresa: 'Empresa B',
    centroCusto: 'Compras',
  },
  {
    id: '9',
    data: '07/06/2025',
    tipo: 'receita' as const,
    descricao: 'Receita de Licenças',
    valor: 15000,
    empresa: 'Empresa A',
    centroCusto: 'Licenças',
  },
  {
    id: '10',
    data: '06/06/2025',
    tipo: 'despesa' as const,
    descricao: 'Salários',
    valor: -45000,
    empresa: 'Empresa A',
    centroCusto: 'RH',
    observacoes: 'Folha de pagamento mensal'
  }
];

const getIconForType = (tipo: string) => {
  switch (tipo) {
    case 'receita':
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    case 'despesa':
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    case 'marketing':
      return <Megaphone className="h-4 w-4 text-gray-500" />;
    default:
      return <ArrowDown className="h-4 w-4 text-red-600" />;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Math.abs(value));
};

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedLancamento, setSelectedLancamento] = useState<typeof recentTransactions[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const kpiData = getKPIData(selectedPeriod);

  const handleLancamentoClick = (lancamento: typeof recentTransactions[0]) => {
    setSelectedLancamento(lancamento);
    setIsModalOpen(true);
  };

  const handleVerTodos = () => {
    navigate('/lancamentos?sort=data_desc');
  };

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
          <div className="space-y-2">
            {recentTransactions.slice(0, 10).map((transaction) => (
              <div 
                key={transaction.id}
                className="flex justify-between items-center py-3 px-2 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 rounded-sm cursor-pointer transition-colors"
                onClick={() => handleLancamentoClick(transaction)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {getIconForType(transaction.tipo)}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">{transaction.data}</span>
                    <span className="text-sm text-sicofe-gray-dark">{transaction.descricao}</span>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  transaction.tipo === 'receita' 
                    ? 'text-sicofe-green' 
                    : 'text-sicofe-red'
                }`}>
                  {transaction.tipo === 'receita' ? '+' : '-'}{formatCurrency(transaction.valor)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={handleVerTodos}
              className="text-sm text-sicofe-blue hover:text-sicofe-blue-dark font-medium transition-colors"
            >
              Ver todos →
            </button>
          </div>
        </div>
      </div>

      <LancamentoDetalhe
        lancamento={selectedLancamento}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
