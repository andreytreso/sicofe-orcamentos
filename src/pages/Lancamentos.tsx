
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Save, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Lancamentos() {
  const [formData, setFormData] = useState({
    empresa_key: "",
    orcamento_id: "",
    cod_conta_contabil: "",
    tipo_lancamento: "", // 'planejado' ou 'realizado'
    valor: "",
    data_lancamento: "",
    descricao: "",
    categoria: "" // receita ou despesa
  });

  const empresas = [
    { id: "emp1", nome: "Empresa ABC Ltda" },
    { id: "emp2", nome: "Comercial XYZ S/A" },
    { id: "emp3", nome: "Indústria 123 Ltda" }
  ];

  const orcamentos = [
    { id: "orc1", nome: "Orçamento 2024 - Q1" },
    { id: "orc2", nome: "Orçamento 2024 - Q2" },
    { id: "orc3", nome: "Orçamento Anual 2024" }
  ];

  const contasContabeis = [
    { codigo: "1001", nome: "Receita de Vendas" },
    { codigo: "1002", nome: "Receita de Serviços" },
    { codigo: "2001", nome: "Despesas Operacionais" },
    { codigo: "2002", nome: "Despesas Administrativas" },
    { codigo: "2003", nome: "Marketing e Publicidade" },
    { codigo: "2004", nome: "Custos de Produção" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    const requiredFields = [
      'empresa_key', 'orcamento_id', 'cod_conta_contabil', 
      'tipo_lancamento', 'valor', 'data_lancamento', 'categoria'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Validação do valor
    const valor = parseFloat(formData.valor.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      toast.error("Por favor, insira um valor válido.");
      return;
    }

    // Aqui seria feita a integração com o backend
    console.log("Dados do lançamento:", {
      ...formData,
      valor: valor
    });

    toast.success("Lançamento salvo com sucesso!");
    
    // Reset do formulário
    setFormData({
      empresa_key: "",
      orcamento_id: "",
      cod_conta_contabil: "",
      tipo_lancamento: "",
      valor: "",
      data_lancamento: "",
      descricao: "",
      categoria: ""
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sicofe-navy">Lançamentos Orçamentários</h1>
        <p className="text-sicofe-gray mt-2">
          Registre valores planejados e realizados por conta contábil
        </p>
      </div>

      <Card className="sicofe-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sicofe-navy">
            <Plus className="h-5 w-5" />
            Novo Lançamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Empresa */}
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-sicofe-navy font-medium">
                  Empresa *
                </Label>
                <Select value={formData.empresa_key} onValueChange={(value) => handleInputChange('empresa_key', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Orçamento */}
              <div className="space-y-2">
                <Label htmlFor="orcamento" className="text-sicofe-navy font-medium">
                  Orçamento *
                </Label>
                <Select value={formData.orcamento_id} onValueChange={(value) => handleInputChange('orcamento_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o orçamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {orcamentos.map((orcamento) => (
                      <SelectItem key={orcamento.id} value={orcamento.id}>
                        {orcamento.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Conta Contábil */}
              <div className="space-y-2">
                <Label htmlFor="conta" className="text-sicofe-navy font-medium">
                  Conta Contábil *
                </Label>
                <Select value={formData.cod_conta_contabil} onValueChange={(value) => handleInputChange('cod_conta_contabil', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {contasContabeis.map((conta) => (
                      <SelectItem key={conta.codigo} value={conta.codigo}>
                        {conta.codigo} - {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sicofe-navy font-medium">
                  Categoria *
                </Label>
                <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de Lançamento */}
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-sicofe-navy font-medium">
                  Tipo de Lançamento *
                </Label>
                <Select value={formData.tipo_lancamento} onValueChange={(value) => handleInputChange('tipo_lancamento', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejado">Planejado</SelectItem>
                    <SelectItem value="realizado">Realizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="valor" className="text-sicofe-navy font-medium">
                  Valor (R$) *
                </Label>
                <Input
                  id="valor"
                  type="text"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => handleInputChange('valor', e.target.value)}
                  className="text-right"
                />
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="data" className="text-sicofe-navy font-medium">
                  Data do Lançamento *
                </Label>
                <div className="relative">
                  <Input
                    id="data"
                    type="date"
                    value={formData.data_lancamento}
                    onChange={(e) => handleInputChange('data_lancamento', e.target.value)}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sicofe-gray pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sicofe-navy font-medium">
                Descrição
              </Label>
              <Textarea
                id="descricao"
                placeholder="Descrição adicional do lançamento (opcional)"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="sicofe-gradient text-white hover:opacity-90 flex items-center gap-2">
                <Save className="h-4 w-4" />
                Salvar Lançamento
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormData({
                  empresa_key: "",
                  orcamento_id: "",
                  cod_conta_contabil: "",
                  tipo_lancamento: "",
                  valor: "",
                  data_lancamento: "",
                  descricao: "",
                  categoria: ""
                })}
              >
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Lançamentos Recentes */}
      <Card className="sicofe-card-shadow">
        <CardHeader>
          <CardTitle className="text-sicofe-navy">Lançamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-sicofe-gray border-b pb-2">
              <span>Data</span>
              <span>Conta</span>
              <span>Tipo</span>
              <span>Categoria</span>
              <span>Valor</span>
              <span>Status</span>
            </div>
            
            <div className="grid grid-cols-6 gap-4 text-sm py-2 border-b">
              <span className="text-sicofe-gray-dark">15/03/2024</span>
              <span className="text-sicofe-gray-dark">1001 - Receita Vendas</span>
              <span className="text-sicofe-blue">Realizado</span>
              <span className="text-sicofe-green">Receita</span>
              <span className="text-sicofe-green font-medium">R$ 25.000,00</span>
              <span className="text-xs bg-sicofe-green text-white px-2 py-1 rounded">Confirmado</span>
            </div>
            
            <div className="grid grid-cols-6 gap-4 text-sm py-2 border-b">
              <span className="text-sicofe-gray-dark">14/03/2024</span>
              <span className="text-sicofe-gray-dark">2001 - Desp. Operacionais</span>
              <span className="text-sicofe-orange">Planejado</span>
              <span className="text-sicofe-red">Despesa</span>
              <span className="text-sicofe-red font-medium">R$ 15.500,00</span>
              <span className="text-xs bg-sicofe-orange text-white px-2 py-1 rounded">Pendente</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
