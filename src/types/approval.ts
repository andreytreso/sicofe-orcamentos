
export interface ApprovalItem {
  id: string;
  data: string;
  grupo1Nivel: string;
  grupo2Nivel: string;
  contaAnalitica: string;
  valor: number;
  solicitante: string;
  status: 'PENDENTE' | 'APROVADO' | 'REPROVADO';
  empresaId: string;
  periodo: string;
  children?: ApprovalItem[];
  isExpanded?: boolean;
  level: 1 | 2 | 3; // 1: grupo 1º nível, 2: grupo 2º nível, 3: conta analítica
}

export interface ApprovalFilter {
  empresaId: string;
  periodo: string;
  status: 'TODOS' | 'PENDENTE' | 'APROVADO' | 'REPROVADO';
}

export interface ApprovalAction {
  ids: string[];
  acao: 'APROVAR' | 'REPROVAR';
  comentario: string;
}

export interface ApprovalHistoryItem {
  id: string;
  data: string;
  usuario: string;
  acao: string;
  comentario: string;
}
