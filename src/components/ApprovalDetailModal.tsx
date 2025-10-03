
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { ApprovalItem } from "@/types/approval";
import { useApprovalHistory } from "@/hooks/useApprovals";
import { Check, X, Clock } from "lucide-react";

interface ApprovalDetailModalProps {
  approval: ApprovalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, comment: string) => void;
  onReject: (id: string, comment: string) => void;
}

export function ApprovalDetailModal({ 
  approval, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject 
}: ApprovalDetailModalProps) {
  const [comment, setComment] = useState('');
  const { data: history = [] } = useApprovalHistory(approval?.id || '');

  const handleApprove = () => {
    if (approval) {
      onApprove(approval.id, comment);
      setComment('');
      onClose();
    }
  };

  const handleReject = () => {
    if (approval) {
      onReject(approval.id, comment);
      setComment('');
      onClose();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'REPROVADO':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Reprovado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  if (!approval) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Detalhes da Aprovação
            {getStatusBadge(approval.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações principais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Data</label>
              <p className="font-medium">{approval.data}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Solicitante</label>
              <p className="font-medium">{approval.solicitante}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Grupo 1º Nível</label>
              <p className="font-medium">{approval.grupo1Nivel}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Grupo 2º Nível</label>
              <p className="font-medium">{approval.grupo2Nivel}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Conta Analítica</label>
              <p className="font-medium">{approval.contaAnalitica}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Valor</label>
              <p className="font-medium text-lg text-sicofe-blue">
                {approval.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          {approval.observacoes && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-600">Observações</label>
                <p className="font-medium text-gray-900">{approval.observacoes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Histórico */}
          <div>
            <h3 className="font-medium mb-3">Histórico de Alterações</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{item.acao}</span>
                    <span className="text-gray-500">{item.data}</span>
                  </div>
                  <p className="text-gray-600">Por: {item.usuario}</p>
                  {item.comentario && <p className="mt-1">{item.comentario}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Ações (apenas para status pendente) */}
          {approval.status === 'PENDENTE' && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Comentário (opcional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Adicione um comentário sobre sua decisão..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reprovar
                </Button>
                <Button 
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
