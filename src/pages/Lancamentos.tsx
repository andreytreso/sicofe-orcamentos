
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Filter, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Lancamento {
  id: string;
  data: string;
  empresa: string;
  conta: string;
  descricao: string;
  valor: number;
  observacoes: string;
  competencia: string[];
}

export default function Lancamentos() {
  const [showForm, setShowForm] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([
    {
      id: "1",
      data: "15/12/2024",
      empresa: "SICOFE LTDA",
      conta: "1.1.1 - Vendas Produtos",
      descricao: "Vendas dezembro",
      valor: 25000.00,
      observacoes: "",
      competencia: ["dez"]
    },
    {
      id: "2",
      data: "14/12/2024",
      empresa: "SICOFE LTDA",
      conta: "2.1.1 - Salários",
      descricao: "Folha de pagamento",
      valor: -15500.00,
      observacoes: "",
      competencia: ["dez"]
    }
  ]);
  
  const [allLancamentos] = useState<Lancamento[]>([
    {
      id: "1",
      data: "15/12/2024",
      empresa: "SICOFE LTDA",
      conta: "1.1.1 - Vendas Produtos",
      descricao: "Vendas dezembro",
      valor: 25000.00,
      observacoes: "",
      competencia: ["dez"]
    },
    {
      id: "2",
      data: "14/12/2024",
      empresa: "SICOFE LTDA",
      conta: "2.1.1 - Salários",
      descricao: "Folha de pagamento",
      valor: -15500.00,
      observacoes: "",
      competencia: ["dez"]
    },
    {
      id: "3",
      data: "13/11/2024",
      empresa: "Examine Loja 1",
      conta: "1.1.1 - Vendas Produtos",
      descricao: "Vendas novembro",
      valor: 18000.00,
      observacoes: "",
      competencia: ["nov"]
    }
  ]);
  
  const [formData, setFormData] = useState({
    empresa: "",
    grupoContas1: "",
    grupoContas2: "",
    contaAnalitica: "",
    valor: "",
    observacoes: "",
    competencia: {
      jan: false,
      fev: false,
      mar: false,
      abr: false,
      mai: false,
      jun: false,
      jul: false,
      ago: false,
      set: false,
      out: false,
      nov: false,
      dez: false,
    }
  });

  const empresas = [
    "Examine Loja 1",
    "Examine Loja 2", 
    "Examine Loja 3",
    "Examine Loja 4",
    "Examine Loja 6",
    "Examine Loja 7",
    "SICOFE LTDA"
  ];

  const gruposContas1 = [
    "Receita Bruta",
    "Deduções Sobre as Vendas",
    "Resultado Não Operacional",
    "Custo das Mercadorias para Revenda",
    "SG&A"
  ];

  const gruposContas2 = [
    "Impostos Indiretos",
    "Cancelamentos e Devoluções",
    "Outras Receitas",
    "Outras Receitas/ (Despesas) Não Operacionais",
    "Custo das Mercadorias para Revenda",
    "Utilidades",
    "Folha de Pagamentos",
    "Outras Despesas",
    "Ocupação",
    "Aluguel de Equipamentos",
    "Marketing",
    "Contratação de Terceiros",
    "TI/Software",
    "Despesas de Veículos",
    "Manutenção",
    "Material de Uso e Consumo",
    "Deságio de Cartões",
    "Impostos e Taxas"
  ];

  const meses = [
    { key: "jan", label: "Janeiro" },
    { key: "fev", label: "Fevereiro" },
    { key: "mar", label: "Março" },
    { key: "abr", label: "Abril" },
    { key: "mai", label: "Maio" },
    { key: "jun", label: "Junho" },
    { key: "jul", label: "Julho" },
    { key: "ago", label: "Agosto" },
    { key: "set", label: "Setembro" },
    { key: "out", label: "Outubro" },
    { key: "nov", label: "Novembro" },
    { key: "dez", label: "Dezembro" }
  ];

  const fetchTransactions = async (filters: { companyId?: string; period?: string; search?: string }) => {
    setIsLoadingFilters(true);
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...allLancamentos];
    
    if (filters.companyId && filters.companyId !== "all") {
      filtered = filtered.filter(lancamento => lancamento.empresa === filters.companyId);
    }
    
    if (filters.period && filters.period !== "all") {
      filtered = filtered.filter(lancamento => lancamento.competencia.includes(filters.period));
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(lancamento => 
        lancamento.descricao.toLowerCase().includes(searchLower) ||
        lancamento.conta.toLowerCase().includes(searchLower) ||
        lancamento.empresa.toLowerCase().includes(searchLower)
      );
    }
    
    setLancamentos(filtered);
    setIsLoadingFilters(false);
  };

  const handleFilter = () => {
    const filters: { companyId?: string; period?: string; search?: string } = {};
    
    if (selectedEmpresa && selectedEmpresa !== "all") {
      filters.companyId = selectedEmpresa;
    }
    
    if (selectedPeriodo && selectedPeriodo !== "all") {
      filters.period = selectedPeriodo;
    }
    
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    
    fetchTransactions(filters);
  };

  const handleCompetenciaChange = (mes: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      competencia: {
        ...prev.competencia,
        [mes]: checked
      }
    }));
  };

  const handleSelectAllCompetencia = (checked: boolean) => {
    const newCompetencia = Object.keys(formData.competencia).reduce((acc, mes) => {
      acc[mes] = checked;
      return acc;
    }, {} as typeof formData.competencia);
    
    setFormData(prev => ({
      ...prev,
      competencia: newCompetencia
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^\d.,-]/g, '');
    
    setFormData(prev => ({ ...prev, valor: numericValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const valorFormatado = parseFloat(formData.valor.replace(',', '.')) || 0;
    
    const mesesSelecionados = Object.entries(formData.competencia)
      .filter(([_, selected]) => selected)
      .map(([mes, _]) => mes);

    const novoLancamento: Lancamento = {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString('pt-BR'),
      empresa: formData.empresa,
      conta: formData.contaAnalitica,
      descricao: formData.observacoes || `Lançamento ${formData.grupoContas1}`,
      valor: parseFloat(valorFormatado.toFixed(2)),
      observacoes: formData.observacoes,
      competencia: mesesSelecionados
    };

    setLancamentos(prev => [novoLancamento, ...prev]);
    
    console.log("Lançamento salvo!", novoLancamento);
    setShowForm(false);
    
    // Reset form
    setFormData({
      empresa: "",
      grupoContas1: "",
      grupoContas2: "",
      contaAnalitica: "",
      valor: "",
      observacoes: "",
      competencia: {
        jan: false,
        fev: false,
        mar: false,
        abr: false,
        mai: false,
        jun: false,
        jul: false,
        ago: false,
        set: false,
        out: false,
        nov: false,
        dez: false,
      }
    });
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#1F2937' }}>Lançamentos Orçamentários</h1>
          <p className="text-gray-500 mt-2">
            Registre e acompanhe os lançamentos do orçamento por conta
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="text-white"
          style={{ backgroundColor: '#0047FF' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  id="search"
                  placeholder="Buscar por descrição, conta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-300 placeholder:text-gray-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter-empresa">Empresa</Label>
              <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                <SelectTrigger className="w-48 bg-white border-gray-300">
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 z-50">
                  <SelectItem value="all" className="bg-white hover:bg-gray-100">Todas as empresas</SelectItem>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa} value={empresa} className="bg-white hover:bg-gray-100">
                      {empresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-periodo">Período</Label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger className="w-48 bg-white border-gray-300">
                  <SelectValue placeholder="Buscar por mês" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 z-50">
                  <SelectItem value="all" className="bg-white hover:bg-gray-100">Buscar por mês</SelectItem>
                  {meses.map((mes) => (
                    <SelectItem key={mes.key} value={mes.key} className="bg-white hover:bg-gray-100">
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={handleFilter}
              disabled={isLoadingFilters}
            >
              {isLoadingFilters ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Filter className="h-4 w-4 mr-2" />
              )}
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Lançamentos */}
      <Card className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader style={{ backgroundColor: '#E6F0FF' }}>
          <CardTitle className="text-lg font-semibold" style={{ color: '#1F2937' }}>Histórico de Lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          {isLoadingFilters ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#0047FF' }} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-300" style={{ backgroundColor: '#E6F0FF' }}>
                  <TableHead style={{ color: '#1F2937' }}>Data</TableHead>
                  <TableHead style={{ color: '#1F2937' }}>Empresa</TableHead>
                  <TableHead style={{ color: '#1F2937' }}>Conta</TableHead>
                  <TableHead style={{ color: '#1F2937' }}>Descrição</TableHead>
                  <TableHead className="text-right" style={{ color: '#1F2937' }}>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {lancamentos.map((lancamento) => (
                  <TableRow key={lancamento.id} className="border-b border-gray-300 hover:bg-gray-50 bg-white">
                    <TableCell className="text-sm">{lancamento.data}</TableCell>
                    <TableCell className="text-sm">{lancamento.empresa}</TableCell>
                    <TableCell className="text-sm">{lancamento.conta}</TableCell>
                    <TableCell className="text-sm">{lancamento.descricao}</TableCell>
                    <TableCell className={`text-sm text-right font-medium ${
                      lancamento.valor >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(lancamento.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Novo Lançamento */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#1F2937' }}>Novo Lançamento Orçamentário</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para criar um novo lançamento
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Select value={formData.empresa} onValueChange={(value) => setFormData(prev => ({ ...prev, empresa: value }))}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 z-50">
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa} value={empresa} className="bg-white hover:bg-gray-100">{empresa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="competencia">Competência *</Label>
                <div className="border border-gray-300 rounded-md p-4 bg-white">
                  <div className="grid grid-cols-4 gap-3">
                    {meses.map((mes) => (
                      <div key={mes.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={mes.key}
                          checked={formData.competencia[mes.key as keyof typeof formData.competencia]}
                          onCheckedChange={(checked) => handleCompetenciaChange(mes.key, checked as boolean)}
                          className="border-gray-400"
                        />
                        <Label htmlFor={mes.key} className="text-sm font-normal cursor-pointer">{mes.label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <Checkbox
                      id="selecionar-todos"
                      checked={Object.values(formData.competencia).every(Boolean)}
                      onCheckedChange={(checked) => handleSelectAllCompetencia(checked as boolean)}
                      className="border-gray-400"
                    />
                    <Label htmlFor="selecionar-todos" className="text-sm font-medium cursor-pointer">Selecionar Todos</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="grupo-contas-1">Grupo de Contas 1º Nível *</Label>
                <Select value={formData.grupoContas1} onValueChange={(value) => setFormData(prev => ({ ...prev, grupoContas1: value }))}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400">
                    <SelectValue placeholder="Selecione o Grupo S1" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 z-50">
                    {gruposContas1.map((grupo) => (
                      <SelectItem key={grupo} value={grupo} className="bg-white hover:bg-gray-100">{grupo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo-contas-2">Grupo de Contas 2º Nível *</Label>
                <Select value={formData.grupoContas2} onValueChange={(value) => setFormData(prev => ({ ...prev, grupoContas2: value }))}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400">
                    <SelectValue placeholder="Selecione o Grupo S2" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 z-50">
                    {gruposContas2.map((grupo) => (
                      <SelectItem key={grupo} value={grupo} className="bg-white hover:bg-gray-100">{grupo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="conta-analitica">Conta Analítica *</Label>
                <Select value={formData.contaAnalitica} onValueChange={(value) => setFormData(prev => ({ ...prev, contaAnalitica: value }))}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400">
                    <SelectValue placeholder="Selecione a conta analítica" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 z-50">
                    <SelectItem value="1.1.1 - Vendas Produtos" className="bg-white hover:bg-gray-100">1.1.1 - Vendas Produtos</SelectItem>
                    <SelectItem value="2.1.1 - Salários" className="bg-white hover:bg-gray-100">2.1.1 - Salários</SelectItem>
                    <SelectItem value="3.1.1 - Outras Receitas" className="bg-white hover:bg-gray-100">3.1.1 - Outras Receitas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                <Input 
                  id="valor"
                  type="text"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={handleValueChange}
                  required
                  className="bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes"
                placeholder="Observações adicionais..."
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                className="bg-white border-gray-300 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="text-white"
                style={{ backgroundColor: '#0047FF' }}
              >
                Salvar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
