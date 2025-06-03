
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, ChevronRight, Edit, Trash2, Filter } from "lucide-react";
import { useState } from "react";

const contasData = [
  {
    cod_conta_resultado_s1: "1",
    nome_conta_resultado_s1: "RECEITAS",
    cod_conta_resultado_s2: "1.1",
    nome_conta_resultado_s2: "Receitas Operacionais",
    cod_conta_resultado_a1: "1.1.01",
    nome_conta_resultado_a1: "Vendas de Produtos",
    cod_conta_contabil: "3.1.1.01.001",
    ativo: true
  },
  {
    cod_conta_resultado_s1: "1",
    nome_conta_resultado_s1: "RECEITAS",
    cod_conta_resultado_s2: "1.1",
    nome_conta_resultado_s2: "Receitas Operacionais",
    cod_conta_resultado_a1: "1.1.02",
    nome_conta_resultado_a1: "Prestação de Serviços",
    cod_conta_contabil: "3.1.1.02.001",
    ativo: true
  },
  {
    cod_conta_resultado_s1: "2",
    nome_conta_resultado_s1: "DESPESAS",
    cod_conta_resultado_s2: "2.1",
    nome_conta_resultado_s2: "Despesas Operacionais",
    cod_conta_resultado_a1: "2.1.01",
    nome_conta_resultado_a1: "Despesas com Pessoal",
    cod_conta_contabil: "3.2.1.01.001",
    ativo: true
  },
  {
    cod_conta_resultado_s1: "2",
    nome_conta_resultado_s1: "DESPESAS",
    cod_conta_resultado_s2: "2.1",
    nome_conta_resultado_s2: "Despesas Operacionais",
    cod_conta_resultado_a1: "2.1.02",
    nome_conta_resultado_a1: "Despesas Administrativas",
    cod_conta_contabil: "3.2.1.02.001",
    ativo: true
  },
  {
    cod_conta_resultado_s1: "2",
    nome_conta_resultado_s1: "DESPESAS",
    cod_conta_resultado_s2: "2.2",
    nome_conta_resultado_s2: "Despesas Comerciais",
    cod_conta_resultado_a1: "2.2.01",
    nome_conta_resultado_a1: "Marketing e Publicidade",
    cod_conta_contabil: "3.2.2.01.001",
    ativo: true
  }
];

export default function PlanoContas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["1", "2"]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const filteredContas = contasData.filter(conta =>
    conta.nome_conta_resultado_a1.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conta.cod_conta_contabil.includes(searchTerm)
  );

  // Group accounts by level 1
  const groupedContas = filteredContas.reduce((acc, conta) => {
    const key = conta.cod_conta_resultado_s1;
    if (!acc[key]) {
      acc[key] = {
        info: {
          cod: conta.cod_conta_resultado_s1,
          nome: conta.nome_conta_resultado_s1
        },
        contas: []
      };
    }
    acc[key].contas.push(conta);
    return acc;
  }, {} as Record<string, { info: { cod: string; nome: string }; contas: typeof contasData }>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sicofe-navy">Plano de Contas</h1>
          <p className="text-sicofe-gray mt-1">Estrutura contábil para controle orçamentário</p>
        </div>
        <Button className="sicofe-gradient hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="sicofe-card-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-sicofe-gray" />
              <Input
                placeholder="Buscar por nome da conta ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart of Accounts */}
      <Card className="sicofe-card-shadow">
        <CardHeader>
          <CardTitle className="text-sicofe-navy">Estrutura de Contas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedContas).map(([groupId, group]) => (
              <div key={groupId} className="border border-gray-200 rounded-lg">
                {/* Group Header */}
                <div
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleGroup(groupId)}
                >
                  <div className="flex items-center space-x-3">
                    <ChevronRight
                      className={`h-5 w-5 text-sicofe-gray transition-transform ${
                        expandedGroups.includes(groupId) ? 'rotate-90' : ''
                      }`}
                    />
                    <div className="w-8 h-8 sicofe-gradient rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sicofe-navy">
                        {group.info.cod} - {group.info.nome}
                      </h3>
                      <p className="text-sm text-sicofe-gray">
                        {group.contas.length} contas
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-sicofe-blue/10 text-sicofe-blue border-sicofe-blue">
                    Nível 1
                  </Badge>
                </div>

                {/* Group Content */}
                {expandedGroups.includes(groupId) && (
                  <div className="p-4 space-y-3">
                    {group.contas.map((conta, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-mono text-sicofe-blue font-medium">
                              {conta.cod_conta_contabil}
                            </span>
                            <Badge 
                              variant={conta.ativo ? "default" : "secondary"}
                              className={conta.ativo ? "bg-sicofe-green hover:bg-sicofe-green" : ""}
                            >
                              {conta.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sicofe-navy">
                            {conta.nome_conta_resultado_a1}
                          </h4>
                          <p className="text-sm text-sicofe-gray">
                            {conta.cod_conta_resultado_s2} - {conta.nome_conta_resultado_s2}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
