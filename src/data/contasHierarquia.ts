
export interface ContaHierarquia {
  nivel1: string;
  nivel2: string;
  analitica: string;
}

export const contasHierarquia: ContaHierarquia[] = [
  // Receita Bruta
  { nivel1: "Receita Bruta", nivel2: "Mercadorias para Revenda", analitica: "Receitas com Visa Crédito" },
  { nivel1: "Receita Bruta", nivel2: "Mercadorias para Revenda", analitica: "Receitas com Mastercard Crédito" },
  { nivel1: "Receita Bruta", nivel2: "Mercadorias para Revenda", analitica: "Receitas com Elo Crédito" },
  { nivel1: "Receita Bruta", nivel2: "Mercadorias para Revenda", analitica: "Receitas com Visa Débito" },
  { nivel1: "Receita Bruta", nivel2: "Mercadorias para Revenda", analitica: "Receitas com Mastercard Débito" },
  { nivel1: "Receita Bruta", nivel2: "Mercadorias para Revenda", analitica: "Receitas com Elo Débito" },
  { nivel1: "Receita Bruta", nivel2: "Mercadorias para Revenda", analitica: "Receitas com PIX" },
  { nivel1: "Receita Bruta", nivel2: "Mercadorias para Revenda", analitica: "Receitas em Dinheiro" },
  { nivel1: "Receita Bruta", nivel2: "Mercadorias para Revenda", analitica: "Receitas com Cheque" },

  // Deduções Sobre as Vendas
  { nivel1: "Deduções Sobre as Vendas", nivel2: "Impostos Indiretos", analitica: "ICMS sobre Vendas" },
  { nivel1: "Deduções Sobre as Vendas", nivel2: "Impostos Indiretos", analitica: "PIS sobre Vendas" },
  { nivel1: "Deduções Sobre as Vendas", nivel2: "Impostos Indiretos", analitica: "COFINS sobre Vendas" },
  { nivel1: "Deduções Sobre as Vendas", nivel2: "Cancelamentos e Devoluções", analitica: "Cancelamentos de Vendas" },
  { nivel1: "Deduções Sobre as Vendas", nivel2: "Cancelamentos e Devoluções", analitica: "Devoluções de Vendas" },

  // Resultado Não Operacional
  { nivel1: "Resultado Não Operacional", nivel2: "Outras Receitas", analitica: "Receitas Financeiras" },
  { nivel1: "Resultado Não Operacional", nivel2: "Outras Receitas", analitica: "Descontos Obtidos" },
  { nivel1: "Resultado Não Operacional", nivel2: "Outras Receitas/ (Despesas) Não Operacionais", analitica: "Multas e Juros Recebidos" },
  { nivel1: "Resultado Não Operacional", nivel2: "Outras Receitas/ (Despesas) Não Operacionais", analitica: "Outras Receitas Diversas" },

  // Custo das Mercadorias para Revenda
  { nivel1: "Custo das Mercadorias para Revenda", nivel2: "Custo das Mercadorias para Revenda", analitica: "Custo de Produtos Vendidos" },
  { nivel1: "Custo das Mercadorias para Revenda", nivel2: "Custo das Mercadorias para Revenda", analitica: "Fretes sobre Compras" },
  { nivel1: "Custo das Mercadorias para Revenda", nivel2: "Custo das Mercadorias para Revenda", analitica: "Seguros sobre Compras" },

  // SG&A
  { nivel1: "SG&A", nivel2: "Utilidades", analitica: "Energia Elétrica" },
  { nivel1: "SG&A", nivel2: "Utilidades", analitica: "Água e Esgoto" },
  { nivel1: "SG&A", nivel2: "Utilidades", analitica: "Telefone" },
  { nivel1: "SG&A", nivel2: "Utilidades", analitica: "Internet" },
  { nivel1: "SG&A", nivel2: "Folha de Pagamentos", analitica: "Salários e Ordenados" },
  { nivel1: "SG&A", nivel2: "Folha de Pagamentos", analitica: "Encargos Sociais" },
  { nivel1: "SG&A", nivel2: "Folha de Pagamentos", analitica: "FGTS" },
  { nivel1: "SG&A", nivel2: "Folha de Pagamentos", analitica: "Férias e 13º Salário" },
  { nivel1: "SG&A", nivel2: "Outras Despesas", analitica: "Material de Escritório" },
  { nivel1: "SG&A", nivel2: "Outras Despesas", analitica: "Material de Limpeza" },
  { nivel1: "SG&A", nivel2: "Outras Despesas", analitica: "Despesas Bancárias" },
  { nivel1: "SG&A", nivel2: "Ocupação", analitica: "Aluguel do Imóvel" },
  { nivel1: "SG&A", nivel2: "Ocupação", analitica: "Condomínio" },
  { nivel1: "SG&A", nivel2: "Ocupação", analitica: "IPTU" },
  { nivel1: "SG&A", nivel2: "Aluguel de Equipamentos", analitica: "Aluguel de Equipamentos de TI" },
  { nivel1: "SG&A", nivel2: "Aluguel de Equipamentos", analitica: "Aluguel de Máquinas" },
  { nivel1: "SG&A", nivel2: "Marketing", analitica: "Publicidade e Propaganda" },
  { nivel1: "SG&A", nivel2: "Marketing", analitica: "Marketing Digital" },
  { nivel1: "SG&A", nivel2: "Contratação de Terceiros", analitica: "Serviços Contábeis" },
  { nivel1: "SG&A", nivel2: "Contratação de Terceiros", analitica: "Serviços Jurídicos" },
  { nivel1: "SG&A", nivel2: "Contratação de Terceiros", analitica: "Consultoria" },
  { nivel1: "SG&A", nivel2: "TI/Software", analitica: "Licenças de Software" },
  { nivel1: "SG&A", nivel2: "TI/Software", analitica: "Manutenção de Sistemas" },
  { nivel1: "SG&A", nivel2: "Despesas de Veículos", analitica: "Combustível" },
  { nivel1: "SG&A", nivel2: "Despesas de Veículos", analitica: "Manutenção de Veículos" },
  { nivel1: "SG&A", nivel2: "Manutenção", analitica: "Manutenção de Equipamentos" },
  { nivel1: "SG&A", nivel2: "Manutenção", analitica: "Manutenção Predial" },
  { nivel1: "SG&A", nivel2: "Material de Uso e Consumo", analitica: "Material de Expediente" },
  { nivel1: "SG&A", nivel2: "Material de Uso e Consumo", analitica: "Produtos de Limpeza" },
  { nivel1: "SG&A", nivel2: "Deságio de Cartões", analitica: "Taxa Visa Crédito" },
  { nivel1: "SG&A", nivel2: "Deságio de Cartões", analitica: "Taxa Mastercard Crédito" },
  { nivel1: "SG&A", nivel2: "Deságio de Cartões", analitica: "Taxa Elo Crédito" },
  { nivel1: "SG&A", nivel2: "Deságio de Cartões", analitica: "Taxa PIX" },
  { nivel1: "SG&A", nivel2: "Impostos e Taxas", analitica: "Simples Nacional" },
  { nivel1: "SG&A", nivel2: "Impostos e Taxas", analitica: "Taxas Diversas" }
];
