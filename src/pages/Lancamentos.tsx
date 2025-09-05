import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Filter, Search, Loader2, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCompanies } from '@/hooks/useCompanies';
import { useLevel1Options, useLevel2Options, useAnalyticalAccountOptions } from '@/hooks/useAccountHierarchy';
import { useTransactions, TransactionFilters } from '@/hooks/useTransactions';
import { useCostCenters } from '@/hooks/useCostCenters';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
interface Lancamento {
  id: string;
  data: string;
  empresa: string;
  conta: string;
  descricao: string;
  valor: number;
  observacoes: string;
  competencia: string[];
  grupoContas1?: string;
}
export default function Lancamentos() {
  const {
    toast
  } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpresa, setSelectedEmpresa] = useState("all");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [lancamentoToDelete, setLancamentoToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    empresa: "",
    ano: new Date().getFullYear().toString(),
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
      dez: false
    }
  });

  const {
    data: companies = []
  } = useCompanies();
  const { data: costCenters = [], isLoading: isLoadingCostCenters } = useCostCenters(formData.empresa);
  const level1Options = useLevel1Options();
  const level2Options = useLevel2Options(formData.grupoContas1);
  const analyticalOptions = useAnalyticalAccountOptions(formData.grupoContas1, formData.grupoContas2);
  
  // Centros de custo (multi seleção)
  const [allCostCenters, setAllCostCenters] = useState(true);
  const [selectedCostCenters, setSelectedCostCenters] = useState<string[]>([]);

  useEffect(() => {
    // Ao trocar empresa, reset seleção de centros de custo
    setAllCostCenters(true);
    setSelectedCostCenters([]);
  }, [formData.empresa]);
  const filters: TransactionFilters = {
    companyId: selectedEmpresa || undefined,
    period: selectedPeriodo || undefined,
    search: searchTerm || undefined
  };
  const {
    transactions,
    isLoading: isLoadingTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating,
    isUpdating,
    isDeleting
  } = useTransactions(filters);

  // Generate year options: current year + 5 years ahead
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({
    length: 6
  }, (_, i) => currentYear + i);

  // Transform companies for compatibility
  const companyOptions = companies.map(company => ({ id: company.id, name: company.name }));
  const meses = [{
    key: "jan",
    label: "Janeiro"
  }, {
    key: "fev",
    label: "Fevereiro"
  }, {
    key: "mar",
    label: "Março"
  }, {
    key: "abr",
    label: "Abril"
  }, {
    key: "mai",
    label: "Maio"
  }, {
    key: "jun",
    label: "Junho"
  }, {
    key: "jul",
    label: "Julho"
  }, {
    key: "ago",
    label: "Agosto"
  }, {
    key: "set",
    label: "Setembro"
  }, {
    key: "out",
    label: "Outubro"
  }, {
    key: "nov",
    label: "Novembro"
  }, {
    key: "dez",
    label: "Dezembro"
  }];

  // Função para limpar campos dependentes quando muda o nível superior
  const handleNivel1Change = (value: string) => {
    setFormData(prev => ({
      ...prev,
      grupoContas1: value,
      grupoContas2: "",
      // limpa nível 2
      contaAnalitica: "" // limpa conta analítica
    }));
  };
  const handleNivel2Change = (value: string) => {
    setFormData(prev => ({
      ...prev,
      grupoContas2: value,
      contaAnalitica: "" // limpa conta analítica
    }));
  };

  // Remove unused functions since we're using the hook
  const handleFilter = () => {
    // Data is already filtered by the useTransactions hook
    // This function is kept for button compatibility but doesn't do anything
  };
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedEmpresa("all");
    setSelectedPeriodo("");
  };
  const handleEdit = (transaction: any) => {
    setEditingLancamento(transaction);
    setShowForm(true);
  };
  const handleDelete = (id: string) => {
    setLancamentoToDelete(id);
    setShowDeleteDialog(true);
  };
  const confirmDelete = () => {
    if (lancamentoToDelete) {
      deleteTransaction(lancamentoToDelete);
    }
    setShowDeleteDialog(false);
    setLancamentoToDelete(null);
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
      (acc as any)[mes] = checked;
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
    }).format(Math.abs(value));
  };
  const formatValueWithThousandSeparator = (value: string) => {
    // Remove tudo exceto números, vírgula e ponto
    let numericValue = value.replace(/[^\d.,-]/g, '');

    // Substitui vírgula por ponto para processamento
    numericValue = numericValue.replace(',', '.');

    // Remove pontos extras (manter apenas o último como decimal)
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    }

    // Se tem parte decimal, limita a 2 casas
    if (numericValue.includes('.')) {
      const [integerPart, decimalPart] = numericValue.split('.');
      numericValue = integerPart + '.' + decimalPart.slice(0, 2);
    }

    // Converte para número para formatação
    const numberValue = parseFloat(numericValue);
    if (isNaN(numberValue)) {
      return '';
    }

    // Formata com separador de milhares
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberValue);
  };
  const getDisplayValue = (lancamento: Lancamento) => {
    const isReceitaBruta = lancamento.grupoContas1 === "Receita Bruta";
    const absoluteValue = Math.abs(lancamento.valor);
    if (isReceitaBruta) {
      return {
        value: absoluteValue,
        isPositive: true,
        colorClass: "text-green-600"
      };
    } else {
      return {
        value: -absoluteValue,
        isPositive: false,
        colorClass: "text-red-600"
      };
    }
  };
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remove tudo exceto números, vírgula e ponto
    let numericValue = value.replace(/[^\d.,-]/g, '');

    // Substitui vírgula por ponto para processamento interno
    numericValue = numericValue.replace(',', '.');

    // Remove pontos extras (manter apenas o último como decimal)
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    }

    // Se tem parte decimal, limita a 2 casas
    if (numericValue.includes('.')) {
      const [integerPart, decimalPart] = numericValue.split('.');
      numericValue = integerPart + '.' + decimalPart.slice(0, 2);
    }
    setFormData(prev => ({
      ...prev,
      valor: numericValue
    }));
  };
  const handleValueBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && value !== '') {
      const numericValue = parseFloat(value.replace(',', '.'));
      if (!isNaN(numericValue)) {
        const formattedValue = formatValueWithThousandSeparator(numericValue.toString());
        setFormData(prev => ({
          ...prev,
          valor: formattedValue
        }));
      }
    }
  };
  const handleValueFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      // Remove formatação para edição (manter apenas números, vírgula e ponto)
      const unformattedValue = value.replace(/\./g, '').replace(',', '.');
      const numberValue = parseFloat(unformattedValue);
      if (!isNaN(numberValue)) {
        const editableValue = numberValue.toFixed(2).replace('.', ',');
        setFormData(prev => ({
          ...prev,
          valor: editableValue
        }));
      }
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação dos campos obrigatórios
    if (!formData.empresa || !formData.grupoContas1 || !formData.grupoContas2 || !formData.contaAnalitica || !formData.valor) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Remove formatação do valor para conversão
    const valorLimpo = formData.valor.replace(/\./g, '').replace(',', '.');
    const valorFormatado = parseFloat(valorLimpo) || 0;
    const mesesSelecionados = Object.entries(formData.competencia).filter(([_, selected]) => selected).map(([mes, _]) => mes);
    if (mesesSelecionados.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um mês de competência.",
        variant: "destructive"
      });
      return;
    }
    const monthMap: {
      [key: string]: string;
    } = {
      jan: '01',
      fev: '02',
      mar: '03',
      abr: '04',
      mai: '05',
      jun: '06',
      jul: '07',
      ago: '08',
      set: '09',
      out: '10',
      nov: '11',
      dez: '12'
    };

    // Find the selected company ID
    const selectedCompany = companies.find(c => c.id === formData.empresa);
    if (!selectedCompany) {
      toast({
        title: "Erro",
        description: "Empresa não encontrada.",
        variant: "destructive"
      });
      return;
    }

    // Centros de custo: exigir seleção quando não for "Todos"
    if (!allCostCenters && selectedCostCenters.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um centro de custo ou marque 'Todos os centros'.",
        variant: "destructive"
      });
      return;
    }

    // Create transaction data for each selected month
    mesesSelecionados.forEach(mes => {
      const transactionData = {
        company_id: selectedCompany.id,
        year: parseInt(formData.ano),
        level_1_group: formData.grupoContas1,
        level_2_group: formData.grupoContas2,
        analytical_account: formData.contaAnalitica,
        amount: valorFormatado,
        observations: formData.observacoes,
        competency_months: [mes],
        transaction_date: `${formData.ano}-${monthMap[mes]}-01`,
        all_cost_centers: allCostCenters,
        cost_center_ids: allCostCenters ? [] : selectedCostCenters,
      };
      if (editingLancamento) {
        updateTransaction(editingLancamento.id, transactionData);
      } else {
        createTransaction(transactionData);
      }
    });
    setShowForm(false);
    setEditingLancamento(null);

    // Reset form
    setFormData({
      empresa: "",
      ano: new Date().getFullYear().toString(),
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
        dez: false
      }
    });
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLancamento(null);
    // Reset form
    setFormData({
      empresa: "",
      ano: new Date().getFullYear().toString(),
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
        dez: false
      }
    });
  };
  return <div className="space-y-6 bg-white min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{
          color: '#1F2937'
        }}>Lançamentos Orçamentários</h1>
          <p className="text-gray-500 mt-2">
            Registre e acompanhe os lançamentos do orçamento por conta
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="text-white" style={{
        backgroundColor: '#0047FF'
      }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search" className="text-gray-700">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input id="search" placeholder="Buscar por descrição, conta..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white border-gray-300 placeholder:text-gray-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
            </div>
            <div>
              <Label htmlFor="filter-empresa" className="text-gray-700">Empresa</Label>
              <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                <SelectTrigger className="w-48 bg-white border-gray-300 focus:ring-blue-300">
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 z-50">
                  <SelectItem value="all" className="bg-white hover:bg-blue-100 focus:bg-blue-100 focus:text-blue-900 text-gray-500">Todas as empresas</SelectItem>
                  {companyOptions.map(c => (
                    <SelectItem key={c.id} value={c.id} className="bg-white hover:bg-blue-100 focus:bg-blue-100 focus:text-blue-900 text-black">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-periodo" className="text-gray-700">Período</Label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger className="w-48 bg-white border-gray-300 focus:ring-blue-300">
                  <SelectValue placeholder="Todos os Meses" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 z-50">
                  <SelectItem value="all" className="bg-white hover:bg-blue-100 focus:bg-blue-100 focus:text-blue-900 text-gray-500">Todos os Meses</SelectItem>
                  {meses.map(mes => <SelectItem key={mes.key} value={mes.key} className="bg-white hover:bg-blue-100 focus:bg-blue-100 focus:text-blue-900 text-black">
                      {mes.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900" onClick={handleFilter} disabled={isLoadingTransactions}>
              {isLoadingTransactions ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Filter className="h-4 w-4 mr-2" />}
              Filtrar
            </Button>
            <Button 
              variant="outline" 
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={handleClearFilters}
              disabled={isLoadingTransactions}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Lançamentos */}
      <Card className="bg-white border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-white">
          <CardTitle className="text-lg font-semibold" style={{
          color: '#1F2937'
        }}>Histórico de Lançamentos</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          {isLoadingTransactions ? <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" style={{
            color: '#0047FF'
          }} />
            </div> : <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-300 bg-white hover:bg-white">
                  <TableHead className="text-gray-700">Data</TableHead>
                  <TableHead className="text-gray-700">Empresa</TableHead>
                  <TableHead className="text-gray-700">Conta</TableHead>
                  <TableHead className="text-gray-700">Descrição</TableHead>
                  <TableHead className="text-right text-gray-700">Valor</TableHead>
                  <TableHead className="text-center text-gray-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {transactions.map(transaction => {
              const companyName = transaction.companies?.name || 'N/A';
              const isPositive = transaction.level_1_group === "Receita Bruta";
              const colorClass = isPositive ? "text-green-600" : "text-red-600";
              const value = Math.abs(transaction.amount);
              return <TableRow key={transaction.id} className="border-b border-gray-300 hover:bg-gray-50 bg-white">
                      <TableCell className="text-sm">{new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-sm">{companyName}</TableCell>
                      <TableCell className="text-sm">{transaction.analytical_account}</TableCell>
                      <TableCell className="text-sm">{transaction.description}</TableCell>
                      <TableCell className={`text-sm text-right font-medium ${colorClass}`}>
                        {isPositive ? '' : '-'}{formatCurrency(value)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)} className="h-8 w-8 p-0 hover:bg-blue-100">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction.id)} className="h-8 w-8 p-0 hover:bg-red-100">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>;
            })}
              </TableBody>
            </Table>}
        </CardContent>
      </Card>

      {/* Modal de Novo/Editar Lançamento */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="bg-white max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-700">
              {editingLancamento ? 'Editar Lançamento Orçamentário' : 'Novo Lançamento Orçamentário'}
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              {editingLancamento ? 'Altere os dados abaixo para atualizar o lançamento' : 'Preencha os dados abaixo para criar um novo lançamento'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Primeira linha - Empresa */}
            <div className="grid grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-gray-700 font-medium">Empresa *</Label>
                <Select value={formData.empresa} onValueChange={value => setFormData(prev => ({
                ...prev,
                empresa: value
              }))}>
                  <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-300 h-11">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 z-50">
                    {companyOptions.map(c => (
                      <SelectItem key={c.id} value={c.id} className="bg-white hover:bg-blue-100 focus:bg-blue-100 focus:text-blue-900">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Centros de Custo (dependente da empresa) */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Centros de Custo</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="cc-all"
                    checked={allCostCenters}
                    disabled={!formData.empresa}
                    onCheckedChange={(checked) => {
                      setAllCostCenters(!!checked);
                      if (checked) setSelectedCostCenters([]);
                    }}
                  />
                  <Label htmlFor="cc-all" className="text-sm text-gray-700">Todos os centros</Label>
                </div>
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={!formData.empresa || allCostCenters}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        {isLoadingCostCenters
                          ? 'Carregando...'
                          : selectedCostCenters.length > 0
                            ? `${selectedCostCenters.length} selecionado(s)`
                            : 'Selecionar centros'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72">
                      <DropdownMenuLabel>
                        {isLoadingCostCenters ? 'Carregando...' : 'Selecione centros'}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {!isLoadingCostCenters && costCenters.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-gray-600">Nenhum centro de custo para esta empresa</div>
                      )}
                      {costCenters.map((cc) => (
                        <DropdownMenuCheckboxItem
                          key={cc.id}
                          checked={selectedCostCenters.includes(cc.id)}
                          onCheckedChange={(checked) => {
                            setSelectedCostCenters((prev) => {
                              if (checked) return Array.from(new Set([...prev, cc.id]));
                              return prev.filter((id) => id !== cc.id);
                            });
                          }}
                          disabled={allCostCenters}
                        >
                          {cc.code ? `${cc.code} - ${cc.name}` : cc.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {!allCostCenters && selectedCostCenters.length > 0 && (
                    <span className="text-xs text-gray-600">
                      {selectedCostCenters.length} selecionado(s)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Segunda linha - Ano */}
            <div className="space-y-2">
              <Label htmlFor="ano" className="text-gray-700 font-medium">Ano *</Label>
              <Select value={formData.ano} onValueChange={value => setFormData(prev => ({
              ...prev,
              ano: value
            }))}>
                <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-300 h-11">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 z-50">
                  {yearOptions.map(year => <SelectItem key={year} value={year.toString()} className="bg-white hover:bg-blue-100 focus:bg-blue-100 focus:text-blue-900">
                      {year}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Terceira linha - Competência */}
            <div className="space-y-3">
              <Label htmlFor="competencia" className="text-gray-700 font-medium">Competência *</Label>
              <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {meses.map(mes => <div key={mes.key} className="flex items-center space-x-2">
                      <Checkbox id={mes.key} checked={formData.competencia[mes.key as keyof typeof formData.competencia]} onCheckedChange={checked => handleCompetenciaChange(mes.key, checked as boolean)} className="border-gray-400" />
                      <Label htmlFor={mes.key} className="text-sm font-normal cursor-pointer text-gray-700">{mes.label}</Label>
                    </div>)}
                </div>
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-300">
                  <Checkbox id="selecionar-todos" checked={Object.values(formData.competencia).every(Boolean)} onCheckedChange={checked => handleSelectAllCompetencia(checked as boolean)} className="border-gray-400" />
                  <Label htmlFor="selecionar-todos" className="text-sm font-medium cursor-pointer text-gray-700">Selecionar Todos</Label>
                </div>
              </div>
            </div>

            {/* Quarta linha - Grupos de Contas em Cascata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="grupo-contas-1" className="text-gray-700 font-medium">Grupo de Contas 1º Nível *</Label>
                <Select value={formData.grupoContas1} onValueChange={handleNivel1Change}>
                  <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-300 h-11">
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 z-50">
                     {level1Options.map((grupo, i) => (
                       <SelectItem
                         key={`l1-${i}`}
                         value={grupo || ""}
                         className="bg-white hover:bg-blue-100 focus:bg-blue-100 focus:text-blue-900"
                       >
                         {grupo}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo-contas-2" className="text-gray-700 font-medium">Grupo de Contas 2º Nível *</Label>
                <Select value={formData.grupoContas2} onValueChange={handleNivel2Change} disabled={!formData.grupoContas1}>
                  <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-300 h-11">
                    <SelectValue placeholder={formData.grupoContas1 ? "Selecione o grupo" : "Primeiro selecione o 1º nível"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 z-50">
                     {level2Options.length > 0
                       ? level2Options.map((grupo, i) => (
                           <SelectItem
                             key={`l2-${i}`}
                             value={grupo || ""}
                             className="bg-white hover:bg-blue-100 focus:bg-blue-100 focus:text-blue-900"
                           >
                             {grupo}
                           </SelectItem>
                         ))
                       : null}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Quinta linha - Conta Analítica e Valor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="conta-analitica" className="text-gray-700 font-medium">Conta Analítica *</Label>
                <Select value={formData.contaAnalitica} onValueChange={value => setFormData(prev => ({
                ...prev,
                contaAnalitica: value
              }))} disabled={!formData.grupoContas2}>
                  <SelectTrigger className="bg-white border-gray-300 focus:ring-blue-300 h-11">
                    <SelectValue placeholder={formData.grupoContas2 ? "Selecione a conta analítica" : "Primeiro selecione o 2º nível"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 z-50">
                     {analyticalOptions.length > 0
                       ? analyticalOptions.map((conta, i) => (
                           <SelectItem
                             key={`a-${i}`}
                             value={conta || ""}
                             className="bg-white hover:bg-blue-100 focus:bg-blue-100 focus:text-blue-900"
                           >
                             {conta}
                           </SelectItem>
                         ))
                       : null}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor" className="text-gray-700 font-medium">Valor *</Label>
                <Input id="valor" type="text" placeholder="0,00" value={formData.valor} onChange={handleValueChange} onBlur={handleValueBlur} onFocus={handleValueFocus} required className="bg-white border-gray-300 focus:ring-blue-300 h-11" />
              </div>
            </div>

            {/* Sexta linha - Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-gray-700 font-medium">Observações</Label>
              <Textarea id="observacoes" placeholder="Observações adicionais..." rows={4} value={formData.observacoes} onChange={e => setFormData(prev => ({
              ...prev,
              observacoes: e.target.value
            }))} className="bg-white border-gray-300 focus:ring-blue-300" />
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={handleCloseForm} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                Cancelar
              </Button>
              <Button type="submit" className="text-white" style={{
              backgroundColor: '#0047FF'
            }}>
                {editingLancamento ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-700">Excluir Lançamento</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}
