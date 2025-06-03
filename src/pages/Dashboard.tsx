
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, AlertTriangle, Building2, Plus, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { month: 'Jan', planejado: 45000, realizado: 42000 },
  { month: 'Fev', planejado: 52000, realizado: 48000 },
  { month: 'Mar', planejado: 48000, realizado: 51000 },
  { month: 'Abr', planejado: 61000, realizado: 58000 },
  { month: 'Mai', planejado: 55000, realizado: 59000 },
  { month: 'Jun', planejado: 67000, realizado: 0 },
];

const expenseData = [
  { name: 'Pessoal', value: 35000, color: '#2563eb' },
  { name: 'Marketing', value: 12000, color: '#3b82f6' },
  { name: 'Operacional', value: 8000, color: '#60a5fa' },
  { name: 'Outros', value: 5000, color: '#93c5fd' },
];

const recentActivity = [
  { id: 1, action: 'Orçamento Q2 2024 criado', time: '2 horas atrás', type: 'success' },
  { id: 2, action: 'Meta de receita ultrapassada em Marketing', time: '4 horas atrás', type: 'warning' },
  { id: 3, action: 'Relatório mensal gerado', time: '1 dia atrás', type: 'info' },
  { id: 4, action: 'Nova empresa "Tech Solutions" adicionada', time: '2 dias atrás', type: 'success' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sicofe-navy">Dashboard</h1>
          <p className="text-sicofe-gray mt-1">Visão geral do seu controle orçamentário</p>
        </div>
        <div className="flex space-x-3">
          <Button className="sicofe-gradient hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Receita Total"
          value="R$ 258.000"
          icon={DollarSign}
          trend={{ value: "12,5%", isPositive: true }}
        />
        <StatsCard
          title="Despesas"
          value="R$ 182.000"
          icon={TrendingUp}
          trend={{ value: "3,2%", isPositive: false }}
        />
        <StatsCard
          title="Empresas Ativas"
          value="8"
          icon={Building2}
          trend={{ value: "2", isPositive: true }}
        />
        <StatsCard
          title="Alertas"
          value="3"
          icon={AlertTriangle}
          className="border-l-4 border-l-sicofe-orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="sicofe-card-shadow">
          <CardHeader>
            <CardTitle className="text-sicofe-navy">Receitas: Planejado vs Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']} />
                <Bar dataKey="planejado" fill="#64748b" name="Planejado" />
                <Bar dataKey="realizado" fill="#2563eb" name="Realizado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Pie Chart */}
        <Card className="sicofe-card-shadow">
          <CardHeader>
            <CardTitle className="text-sicofe-navy">Distribuição de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 sicofe-card-shadow">
          <CardHeader>
            <CardTitle className="text-sicofe-navy">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'success' ? 'bg-sicofe-green' :
                    activity.type === 'warning' ? 'bg-sicofe-orange' : 'bg-sicofe-blue'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-sicofe-navy">{activity.action}</p>
                    <p className="text-xs text-sicofe-gray">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="sicofe-card-shadow">
          <CardHeader>
            <CardTitle className="text-sicofe-navy">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Criar Orçamento
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Building2 className="h-4 w-4 mr-2" />
              Adicionar Empresa
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
