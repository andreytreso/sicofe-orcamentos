import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Filter, Search } from "lucide-react";
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
  tipo: string;
  valor: number;
  observacoes: string;
  competencia: string[];
}

export default function Lancamentos() {
  const [showForm, setShowForm] = useState(false);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([
    {
      id: "1",
      data: "15/12/2024",
      empresa: "SICOFE LTDA",
      conta: "1.1.1 - Vendas Produtos",
      descricao: "Vendas dezembro",
      tipo: "Planejado",
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
      tipo: "Realizado",
      valor: -15500.00,
      observacoes: "",
      competencia: ["dez"]
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
    "Examine Loja 7"
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
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

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
    // Remove caracteres não numéricos exceto vírgula e ponto
    const numericValue = value.replace(/[^\d.,-]/g, '');
    
    setFormData(prev => ({ ...prev, valor: numericValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Formatar valor com duas casas decimais
    const valorFormatado = parseFloat(formData.valor.replace(',', '.')) || 0;
    
    // Obter meses selecionados
    const mesesSelecionados = Object.entries(formData.competencia)
      .filter(([_, selected]) => selected)
      .map(([mes, _]) => mes);

    // Criar novo lançamento
    const novoLancamento: Lancamento = {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString('pt-BR'),
      empresa: formData.empresa,
      conta: formData.contaAnalitica,
      descricao: formData.observacoes || `Lançamento ${formData.grupoContas1}`,
      tipo: "Planejado",
      valor: valorFormatado,
      observacoes: formData.observacoes,
      competencia: mesesSelecionados
    };

    // Adicionar ao histórico
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
          <h1 className="text-3xl font-bold text-sicofe-navy">Lançamentos Orçamentários</h1>
          <p className="text-sicofe-gray mt-2">
            Registre e acompanhe os lançamentos do orçamento por conta
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-sicofe-blue hover:bg-sicofe-blue-dark text-white"
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
                  className="pl-10 bg-white border-sicofe-blue focus:border-sicofe-blue focus:ring-sicofe-blue"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter-empresa">Empresa</Label>
              <Select>
                <SelectTrigger className="w-48 bg-white border-sicofe-blue focus:border-sicofe-blue focus:ring-sicofe-blue">
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent className="bg-white border-sicofe-blue z-50">
                  <SelectItem value="all" className="bg-white hover:bg-sicofe-blue hover:text-white focus:bg-sicofe-blue focus:text-white">Todas as empresas</SelectItem>
                  <SelectItem value="empresa1" className="bg-white hover:bg-sicofe-blue hover:text-white focus:bg-sicofe-blue focus:text-white">SICOFE LTDA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-periodo">Período</Label>
              <Select>
                <SelectTrigger className="w-48 bg-white border-sicofe-blue focus:border-sicofe-blue focus:ring-sicofe-blue">
                  <SelectValue placeholder="Selecionar mês" />
                </SelectTrigger>
                <SelectContent className="bg-white border-sicofe-blue z-50">
                  {meses.map((mes, index) => (
                    <SelectItem key={index} value={mes.toLowerCase()} className="bg-white hover:bg-sicofe-blue hover:text-white focus:bg-sicofe-blue focus:text-white">
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="bg-white border-sicofe-blue text-sicofe-blue hover:bg-sicofe-blue hover:text-white">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Lançamentos */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-sicofe-navy">Histórico de Lançamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="text-sicofe-navy">Data</TableHead>
                <TableHead className="text-sicofe-navy">Empresa</TableHead>
                <TableHead className="text-sicofe-navy">Conta</TableHead>
                <TableHead className="text-sicofe-navy">Descrição</TableHead>
                <TableHead className="text-right text-sicofe-navy">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lancamentos.map((lancamento) => (
                <TableRow key={lancamento.id} className="border-b border-gray-300 hover:bg-gray-50">
                  <TableCell className="text-sm">{lancamento.data}</TableCell>
                  <TableCell className="text-sm">{lancamento.empresa}</TableCell>
                  <TableCell className="text-sm">{lancamento.conta}</TableCell>
                  <TableCell className="text-sm">{lancamento.descricao}</TableCell>
                  <TableCell className={`text-sm text-right font-medium ${
                    lancamento.valor >= 0 ? 'text-sicofe-green' : 'text-sicofe-red'
                  }`}>
                    {formatCurrency(lancamento.valor)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Novo Lançamento */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sicofe-navy">Novo Lançamento Orçamentário</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para criar um novo lançamento
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Select value={formData.empresa} onValueChange={(value) => setFormData(prev => ({ ...prev, empresa: value }))}>
                  <SelectTrigger className="bg-white border-sicofe-blue focus:border-sicofe-blue focus:ring-sicofe-blue">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-sicofe-blue z-50">
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa} value={empresa} className="bg-white hover:bg-sicofe-blue hover:text-white focus:bg-sicofe-blue focus:text-white">{empresa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="competencia">Competência *</Label>
                <div className="border border-sicofe-blue rounded-md p-4 bg-white">
                  <div className="grid grid-cols-4 gap-3">
                    {meses.map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={formData.competencia[key as keyof typeof formData.competencia]}
                          onCheckedChange={(checked) => handleCompetenciaChange(key, checked as boolean)}
                          className="border-sicofe-blue data-[state=checked]:bg-sicofe-blue data-[state=checked]:border-sicofe-blue"
                        />
                        <Label htmlFor={key} className="text-sm font-normal cursor-pointer">{label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <Checkbox
                      id="selecionar-todos"
                      checked={Object.values(formData.competencia).every(Boolean)}
                      onCheckedChange={(checked) => handleSelectAllCompetencia(checked as boolean)}
                      className="border-sicofe-blue data-[state=checked]:bg-sicofe-blue data-[state=checked]:border-sicofe-blue"
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
                  <SelectTrigger className="bg-white border-sicofe-blue focus:border-sicofe-blue focus:ring-sicofe-blue">
                    <SelectValue placeholder="Selecione o Grupo S1" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-sicofe-blue z-50">
                    {gruposContas1.map((grupo) => (
                      <SelectItem key={grupo} value={grupo} className="bg-white hover:bg-sicofe-blue hover:text-white focus:bg-sicofe-blue focus:text-white">{grupo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo-contas-2">Grupo de Contas 2º Nível *</Label>
                <Select value={formData.grupoContas2} onValueChange={(value) => setFormData(prev => ({ ...prev, grupoContas2: value }))}>
                  <SelectTrigger className="bg-white border-sicofe-blue focus:border-sicofe-blue focus:ring-sicofe-blue">
                    <SelectValue placeholder="Selecione o Grupo S2" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-sicofe-blue z-50">
                    {gruposContas2.map((grupo) => (
                      <SelectItem key={grupo} value={grupo} className="bg-white hover:bg-sicofe-blue hover:text-white focus:bg-sicofe-blue focus:text-white">{grupo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="conta-analitica">Conta Analítica *</Label>
                <Select value={formData.contaAnalitica} onValueChange={(value) => setFormData(prev => ({ ...prev, contaAnalitica: value }))}>
                  <SelectTrigger className="bg-white border-sicofe-blue focus:border-sicofe-blue focus:ring-sicofe-blue">
                    <SelectValue placeholder="Selecione a conta analítica" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-sicofe-blue z-50">
                    <SelectItem value="1.1.1 - Vendas Produtos" className="bg-white hover:bg-sicofe-blue hover:text-white focus:bg-sicofe-blue focus:text-white">1.1.1 - Vendas Produtos</SelectItem>
                    <SelectItem value="2.1.1 - Salários" className="bg-white hover:bg-sicofe-blue hover:text-white focus:bg-sicofe-blue focus:text-white">2.1.1 - Salários</SelectItem>
                    <SelectItem value="3.1.1 - Outras Receitas" className="bg-white hover:bg-sicofe-blue hover:text-white focus:bg-sicofe-blue focus:text-white">3.1.1 - Outras Receitas</SelectItem>
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
                  className="bg-white border-sicofe-blue focus:border-sicofe-blue focus:ring-sicofe-blue"
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
                className="bg-white border-sicofe-blue focus:border-sicofe-blue focus:ring-sicofe-blue"
              />
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="bg-white border-sicofe-blue text-sicofe-blue hover:bg-sicofe-blue hover:text-white"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-sicofe-blue hover:bg-sicofe-blue-dark text-white"
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
