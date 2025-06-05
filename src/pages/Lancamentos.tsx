
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

export default function Lancamentos() {
  const [showForm, setShowForm] = useState(false);
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
    { key: "jan", label: "Jan" },
    { key: "fev", label: "Fev" },
    { key: "mar", label: "Mar" },
    { key: "abr", label: "Abr" },
    { key: "mai", label: "Mai" },
    { key: "jun", label: "Jun" },
    { key: "jul", label: "Jul" },
    { key: "ago", label: "Ago" },
    { key: "set", label: "Set" },
    { key: "out", label: "Out" },
    { key: "nov", label: "Nov" },
    { key: "dez", label: "Dez" }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Lançamento salvo!", formData);
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
    <div className="space-y-6">
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
                  className="pl-10 bg-white border border-gray-300"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter-empresa">Empresa</Label>
              <Select>
                <SelectTrigger className="w-48 bg-white border border-gray-300">
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todas as empresas</SelectItem>
                  <SelectItem value="empresa1">SICOFE LTDA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-periodo">Período</Label>
              <Select>
                <SelectTrigger className="w-48 bg-white border border-gray-300">
                  <SelectValue placeholder="Selecionar período" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="mes">Este mês</SelectItem>
                  <SelectItem value="trimestre">Este trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="bg-white border border-gray-300 hover:bg-gray-50">
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sicofe-navy">Data</th>
                  <th className="text-left p-3 text-sicofe-navy">Empresa</th>
                  <th className="text-left p-3 text-sicofe-navy">Conta</th>
                  <th className="text-left p-3 text-sicofe-navy">Descrição</th>
                  <th className="text-left p-3 text-sicofe-navy">Tipo</th>
                  <th className="text-right p-3 text-sicofe-navy">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">15/12/2024</td>
                  <td className="p-3 text-sm">SICOFE LTDA</td>
                  <td className="p-3 text-sm">1.1.1 - Vendas Produtos</td>
                  <td className="p-3 text-sm">Vendas dezembro</td>
                  <td className="p-3 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      Planejado
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right font-medium text-sicofe-green">
                    R$ 25.000,00
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">14/12/2024</td>
                  <td className="p-3 text-sm">SICOFE LTDA</td>
                  <td className="p-3 text-sm">2.1.1 - Salários</td>
                  <td className="p-3 text-sm">Folha de pagamento</td>
                  <td className="p-3 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Realizado
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right font-medium text-sicofe-red">
                    -R$ 15.500,00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="competencia">Competência *</Label>
                <div className="border border-gray-300 rounded-md p-3 bg-white">
                  <div className="flex flex-wrap gap-4 items-center">
                    {meses.map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={formData.competencia[key as keyof typeof formData.competencia]}
                          onCheckedChange={(checked) => handleCompetenciaChange(key, checked as boolean)}
                        />
                        <Label htmlFor={key} className="text-sm font-normal">{label}</Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2 ml-4">
                      <Checkbox
                        id="selecionar-todos"
                        checked={Object.values(formData.competencia).every(Boolean)}
                        onCheckedChange={(checked) => handleSelectAllCompetencia(checked as boolean)}
                      />
                      <Label htmlFor="selecionar-todos" className="text-sm font-medium">Selecionar Todos</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="grupo-contas-1">Grupo de Contas 1º Nível *</Label>
                <Select value={formData.grupoContas1} onValueChange={(value) => setFormData(prev => ({ ...prev, grupoContas1: value }))}>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione o Grupo S1" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {gruposContas1.map((grupo) => (
                      <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo-contas-2">Grupo de Contas 2º Nível *</Label>
                <Select value={formData.grupoContas2} onValueChange={(value) => setFormData(prev => ({ ...prev, grupoContas2: value }))}>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione o Grupo S2" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {gruposContas2.map((grupo) => (
                      <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="conta-analitica">Conta Analítica *</Label>
                <Select value={formData.contaAnalitica} onValueChange={(value) => setFormData(prev => ({ ...prev, contaAnalitica: value }))}>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione a conta analítica" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="conta1">1.1.1 - Vendas Produtos</SelectItem>
                    <SelectItem value="conta2">2.1.1 - Salários</SelectItem>
                    <SelectItem value="conta3">3.1.1 - Outras Receitas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                <Input 
                  id="valor"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                  required
                  className="bg-white border border-gray-300"
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
                className="bg-white border border-gray-300"
              />
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowForm(false)}
                className="bg-white border border-gray-300 hover:bg-gray-50"
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
