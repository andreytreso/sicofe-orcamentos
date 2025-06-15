
import { StatsCard } from "@/components/StatsCard";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-sicofe-navy">Dashboard</h1>
        <p className="text-sicofe-gray mt-2">
          Visão geral do controle orçamentário
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          title="Orçamento Total"
          value="R$ 150.000,00"
          icon={DollarSign}
          trend={{
            value: "12%",
            isPositive: true,
          }}
        />
        <StatsCard
          title="Realizado"
          value="R$ 87.500,00"
          icon={TrendingUp}
          trend={{
            value: "8%",
            isPositive: true,
          }}
        />
        <StatsCard
          title="Disponível"
          value="R$ 62.500,00"
          icon={PieChart}
          trend={{
            value: "5%",
            isPositive: false,
          }}
        />
        <StatsCard
          title="Variação"
          value="58,3%"
          icon={TrendingDown}
          trend={{
            value: "3%",
            isPositive: true,
          }}
        />
      </div>

      {/* Charts and Additional Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-sicofe-navy mb-4">
            Receitas vs Despesas
          </h3>
          <div className="h-64 flex items-center justify-center text-sicofe-gray">
            Gráfico será implementado aqui
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-sicofe-navy mb-4">
            Últimos Lançamentos
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-sicofe-gray-dark">Receita de Vendas</span>
              <span className="text-sm font-medium text-sicofe-green">+R$ 25.000,00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
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
