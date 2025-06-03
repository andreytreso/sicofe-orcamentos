
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calculator, Calendar, TrendingUp, TrendingDown, Eye, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const orcamentosData = [
  {
    id: 1,
    nome: "Orçamento Q2 2024",
    empresa: "Tech Solutions LTDA",
    periodo: "Abr - Jun 2024",
    planejado: 180000,
    realizado: 165000,
    status: "ativo",
    progresso: 91.7
  },
  {
    id: 2,
    nome: "Plano Anual 2024",
    empresa: "Marketing Digital S/A",
    periodo: "Jan - Dez 2024",
    planejado: 720000,
    realizado: 320000,
    status: "ativo",
    progresso: 44.4
  },
  {
    id: 3,
    nome: "Expansão Filial",
    empresa: "E-commerce Brasil",
    periodo: "Mar - Ago 2024",
    planejado: 450000,
    realizado: 380000,
    status: "ativo",
    progresso: 84.4
  },
  {
    id: 4,
    nome: "Orçamento Q1 2024",
    empresa: "Consultoria Financeira",
    periodo: "Jan - Mar 2024",
    planejado: 120000,
    realizado: 118000,
    status: "concluido",
    progresso: 98.3
  }
];

export default function Orcamentos() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sicofe-navy">Orçamentos</h1>
          <p className="text-sicofe-gray mt-1">Gerencie todos os orçamentos das suas empresas</p>
        </div>
        <Button className="sicofe-gradient hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="sicofe-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Total Planejado</p>
                <p className="text-2xl font-bold text-sicofe-navy">R$ 1.47M</p>
              </div>
              <Calculator className="h-8 w-8 text-sicofe-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="sicofe-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Total Realizado</p>
                <p className="text-2xl font-bold text-sicofe-navy">R$ 983K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-sicofe-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="sicofe-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Variação</p>
                <p className="text-2xl font-bold text-sicofe-red">-33.1%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-sicofe-red" />
            </div>
          </CardContent>
        </Card>

        <Card className="sicofe-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Orçamentos Ativos</p>
                <p className="text-2xl font-bold text-sicofe-navy">3</p>
              </div>
              <Calendar className="h-8 w-8 text-sicofe-orange" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budgets List */}
      <Card className="sicofe-card-shadow">
        <CardHeader>
          <CardTitle className="text-sicofe-navy">Lista de Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {orcamentosData.map((orcamento) => (
              <div
                key={orcamento.id}
                className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-sicofe-navy">{orcamento.nome}</h3>
                    <p className="text-sm text-sicofe-gray">{orcamento.empresa}</p>
                    <p className="text-sm text-sicofe-gray">{orcamento.periodo}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={orcamento.status === 'ativo' ? 'default' : 'secondary'}
                      className={orcamento.status === 'ativo' ? 'bg-sicofe-green hover:bg-sicofe-green' : ''}
                    >
                      {orcamento.status === 'ativo' ? 'Ativo' : 'Concluído'}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-sicofe-gray">Planejado</p>
                    <p className="text-xl font-bold text-sicofe-navy">
                      R$ {orcamento.planejado.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sicofe-gray">Realizado</p>
                    <p className="text-xl font-bold text-sicofe-green">
                      R$ {orcamento.realizado.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sicofe-gray">Progresso</p>
                    <p className="text-xl font-bold text-sicofe-blue">{orcamento.progresso}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-sicofe-gray">Execução do orçamento</span>
                    <span className="text-sicofe-navy font-medium">{orcamento.progresso}%</span>
                  </div>
                  <Progress value={orcamento.progresso} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
