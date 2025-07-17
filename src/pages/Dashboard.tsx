
import { useState } from 'react';
import { StatsCard } from "@/components/StatsCard";
import { PeriodSelector, PeriodType } from "@/components/PeriodSelector";
import { LancamentoDetalhe } from "@/components/LancamentoDetalhe";
import { ReceitasDespesasChart } from "@/components/ReceitasDespesasChart";
import { TrendingUp, TrendingDown, DollarSign, PieChart, ArrowUp, ArrowDown, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useDashboardTransactions, DashboardTransaction } from "@/hooks/useDashboardTransactions";

// Helper functions for real transactions
const getIconForType = (level1Group?: string) => {
  if (level1Group === "Receita Bruta") {
    return <ArrowUp className="h-4 w-4 text-green-600" />;
  } else if (level1Group === "Marketing") {
    return <Megaphone className="h-4 w-4 text-gray-500" />;
  } else {
    return <ArrowDown className="h-4 w-4 text-red-600" />;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Math.abs(value));
};

const formatTransactionDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const getDisplayValue = (transaction: DashboardTransaction) => {
  const isReceitaBruta = transaction.level_1_group === "Receita Bruta";
  const absoluteValue = Math.abs(Number(transaction.amount));
  
  if (isReceitaBruta) {
    return {
      value: absoluteValue,
      isPositive: true,
      colorClass: "text-sicofe-green"
    };
  } else {
    return {
      value: -absoluteValue,
      isPositive: false,
      colorClass: "text-sicofe-red"
    };
  }
};

const tooltips = {
  budget: "Valor planejado para o período selecionado.",
  realized: "Despesas liquidadas até hoje.",
  available: "Orçamento Total – Realizado.",
  variation: "Realizado ÷ Orçamento Total."
};

// Interface for LancamentoDetalhe component
interface LancamentoDetalheType {
  id: string;
  data: string;
  tipo: 'receita' | 'marketing' | 'despesa';
  descricao: string;
  valor: number;
  empresa: string;
  centroCusto: string;
  observacoes: string;
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedLancamento, setSelectedLancamento] = useState<LancamentoDetalheType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Usar hooks para dados do Supabase
  const { data: kpiData, isLoading: kpiLoading } = useDashboardKPIs(selectedPeriod);
  const { data: transactions = [], isLoading: transactionsLoading } = useDashboardTransactions(10);

  const handleLancamentoClick = (transaction: DashboardTransaction) => {
    // Convert to the format expected by LancamentoDetalhe
    const lancamentoForModal: LancamentoDetalheType = {
      id: transaction.id,
      data: formatTransactionDate(transaction.transaction_date),
      tipo: transaction.level_1_group === "Receita Bruta" ? 'receita' as const : 
            transaction.level_1_group === "Marketing" ? 'marketing' as const : 'despesa' as const,
      descricao: transaction.description || 'Sem descrição',
      valor: Number(transaction.amount),
      empresa: transaction.companies?.name || 'Empresa não encontrada',
      centroCusto: transaction.analytical_account,
      observacoes: transaction.observations || ''
    };
    
    setSelectedLancamento(lancamentoForModal);
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
        {kpiLoading ? (
          // Loading skeleton for KPIs
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-5 w-5 bg-gray-300 rounded"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
          ))
        ) : kpiData && kpiData.budget && kpiData.realized && kpiData.available && kpiData.variation ? (
          <>
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
          </>
        ) : (
          // Error state or no data
          <div className="col-span-4 text-center py-8">
            <span className="text-sicofe-gray">Nenhum dado disponível para o período selecionado</span>
          </div>
        )}
      </div>

      {/* Charts and Additional Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <ReceitasDespesasChart selectedPeriod={selectedPeriod} />

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-sicofe-navy mb-4">
            Últimos Lançamentos
          </h3>
          <div className="space-y-2">
            {transactionsLoading ? (
              <div className="text-center py-4">
                <span className="text-sicofe-gray">Carregando...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-4">
                <span className="text-sicofe-gray">Nenhum lançamento encontrado</span>
              </div>
            ) : (
              transactions.map((transaction) => {
                const displayValue = getDisplayValue(transaction);
                return (
                  <div 
                    key={transaction.id}
                    className="flex justify-between items-center py-3 px-2 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 rounded-sm cursor-pointer transition-colors"
                    onClick={() => handleLancamentoClick(transaction)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getIconForType(transaction.level_1_group)}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium">
                          {formatTransactionDate(transaction.transaction_date)}
                        </span>
                        <span className="text-sm text-sicofe-gray-dark">
                          {transaction.description || 'Sem descrição'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${displayValue.colorClass}`}>
                      {displayValue.isPositive ? '+' : '-'}{formatCurrency(displayValue.value)}
                    </span>
                  </div>
                );
              })
            )}
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
