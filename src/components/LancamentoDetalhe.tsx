
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowUp, ArrowDown, Megaphone } from "lucide-react";

interface Lancamento {
  id: string;
  data: string;
  tipo: 'receita' | 'despesa' | 'marketing';
  descricao: string;
  valor: number;
  empresa: string;
  centroCusto: string;
  observacoes?: string;
}

interface LancamentoDetalheProps {
  lancamento: Lancamento | null;
  isOpen: boolean;
  onClose: () => void;
}

const getIconForType = (tipo: string) => {
  switch (tipo) {
    case 'receita':
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    case 'despesa':
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    case 'marketing':
      return <Megaphone className="h-4 w-4 text-gray-500" />;
    default:
      return <ArrowDown className="h-4 w-4 text-red-600" />;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function LancamentoDetalhe({ lancamento, isOpen, onClose }: LancamentoDetalheProps) {
  if (!lancamento) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIconForType(lancamento.tipo)}
            Detalhes do Lançamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Data</label>
              <p className="text-gray-900">{lancamento.data}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Valor</label>
              <p className={`font-medium ${
                lancamento.tipo === 'receita' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {lancamento.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(lancamento.valor))}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <p className="text-gray-900">{lancamento.descricao}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Empresa</label>
              <p className="text-gray-900">{lancamento.empresa}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Centro de Custo</label>
              <p className="text-gray-900">{lancamento.centroCusto}</p>
            </div>
          </div>

          {lancamento.observacoes && (
            <div>
              <label className="text-sm font-medium text-gray-700">Observações</label>
              <p className="text-gray-900">{lancamento.observacoes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
