
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica de salvamento
    console.log("Lançamento salvo!");
    setShowForm(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Select>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="empresa1">SICOFE LTDA</SelectItem>
                    <SelectItem value="empresa2">Consultoria ABC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orcamento">Orçamento *</Label>
                <Select>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione o orçamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="orcamento1">Orçamento 2024</SelectItem>
                    <SelectItem value="orcamento2">Orçamento Q1 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_lancamento">Data do Lançamento *</Label>
                <Input 
                  id="data_lancamento"
                  type="date"
                  required
                  className="bg-white border border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conta_s1">Conta Resultado S1 *</Label>
                <Select>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione a conta S1" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">1 - Receitas</SelectItem>
                    <SelectItem value="2">2 - Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conta_s2">Conta Resultado S2 *</Label>
                <Select>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione a conta S2" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="11">1.1 - Receita de Vendas</SelectItem>
                    <SelectItem value="21">2.1 - Despesas Operacionais</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="conta_a1">Conta Análise A1 *</Label>
                <Select>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione a conta A1" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="111">1.1.1 - Vendas Produtos</SelectItem>
                    <SelectItem value="211">2.1.1 - Salários</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conta_contabil">Código Contábil *</Label>
                <Input 
                  id="conta_contabil"
                  placeholder="Ex: 3.01.01.001"
                  required
                  className="bg-white border border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_lancamento">Tipo de Lançamento *</Label>
                <Select>
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="planejado">Valor Planejado</SelectItem>
                    <SelectItem value="realizado">Valor Realizado</SelectItem>
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
                  required
                  className="bg-white border border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao"
                placeholder="Descrição detalhada do lançamento..."
                rows={3}
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
