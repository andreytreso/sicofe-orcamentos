import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calculator, Calendar, TrendingUp, TrendingDown, Eye, MoreVertical, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useBudgetsTable } from '@/hooks/useSupabaseTable';
import { NovoOrcamentoModal } from '@/components/NovoOrcamentoModal';
import { format } from 'date-fns';

// Removed mock data - now using real data from Supabase

interface Budget {
  id: string;
  name: string;
  planned_amount: number;
  actual_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  companies?: { name: string };
}

export default function Orcamentos() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: budgets = [], isLoading } = useBudgetsTable();
  
  const budgetData = budgets as Budget[];
  const activeBudgets = budgetData.filter(budget => budget.status === 'ativo');
  const totalPlanned = budgetData.reduce((sum, budget) => sum + (budget.planned_amount || 0), 0);
  const totalRealized = budgetData.reduce((sum, budget) => sum + (budget.actual_amount || 0), 0);
  const variation = totalPlanned > 0 ? (totalRealized - totalPlanned) / totalPlanned * 100 : 0;
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };
  const formatPeriod = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startMonth = startDate.toLocaleDateString('pt-BR', {
      month: 'short'
    });
    const endMonth = endDate.toLocaleDateString('pt-BR', {
      month: 'short'
    });
    const year = startDate.getFullYear();
    return `${startMonth} - ${endMonth} ${year}`;
  };
  if (isLoading) {
    return <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-sicofe-blue" />
        </div>
      </div>;
  }
  return <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sicofe-navy">Orçamentos</h1>
          <p className="text-sicofe-gray mt-1">Gerencie todos os orçamentos das suas empresas</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Total Planejado</p>
                <p className="text-2xl font-bold text-sicofe-navy">{formatCurrency(totalPlanned)}</p>
              </div>
              <Calculator className="h-8 w-8 text-sicofe-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Total Realizado</p>
                <p className="text-2xl font-bold text-sicofe-navy">{formatCurrency(totalRealized)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-sicofe-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Variação</p>
                <p className={`text-2xl font-bold ${variation >= 0 ? 'text-sicofe-green' : 'text-sicofe-red'}`}>
                  {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-sicofe-red" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Orçamentos Ativos</p>
                <p className="text-2xl font-bold text-sicofe-navy">{activeBudgets.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-sicofe-blue" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budgets List */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-sicofe-navy">Lista de Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum orçamento encontrado – Crie seu primeiro orçamento</p>
            </div>
          ) : (
            <div className="space-y-6">
              {budgetData.map(budget => (
                <div key={budget.id} className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{budget.name}</h3>
                      <p className="text-sm text-muted-foreground">{budget.companies?.name || 'Empresa não informada'}</p>
                      <p className="text-sm text-muted-foreground">
                        {budget.start_date && budget.end_date
                          ? `${format(new Date(budget.start_date), 'dd/MM/yyyy')} - ${format(new Date(budget.end_date), 'dd/MM/yyyy')}`
                          : 'Período não definido'
                        }
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        className={
                          budget.status === 'ativo' 
                            ? 'bg-accent text-accent-foreground' 
                            : budget.status === 'fechado'
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }
                      >
                        {budget.status === 'ativo' ? 'Ativo' : budget.status === 'fechado' ? 'Fechado' : 'Rascunho'}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Planejado</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(budget.planned_amount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Realizado</p>
                      <p className="text-xl font-bold text-accent">
                        {formatCurrency(budget.actual_amount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NovoOrcamentoModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>;
}