
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApprovalFilters } from "@/components/ApprovalFilters";
import { ApprovalTable } from "@/components/ApprovalTable";
import { ApprovalDetailModal } from "@/components/ApprovalDetailModal";
import { useApprovals } from "@/hooks/useApprovals";
import { ApprovalFilter, ApprovalItem } from "@/types/approval";
import { Check, X, Users } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Aprovacoes() {
  const [filters, setFilters] = useState<ApprovalFilter>({
    empresaId: '',
    periodo: '',
    status: 'TODOS'
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'APROVAR' | 'REPROVAR';
    count: number;
    total: number;
  }>({
    isOpen: false,
    action: 'APROVAR',
    count: 0,
    total: 0
  });

  const { approvals, isLoading, executeAction, isExecuting } = useApprovals(filters);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === 'a' || event.key === 'A') {
        event.preventDefault();
        handleBulkAction('APROVAR');
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        handleBulkAction('REPROVAR');
      } else if (event.key === 'Escape') {
        setIsModalOpen(false);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  const handleSearch = () => {
    console.log('Searching with filters:', filters);
  };

  const handleSelectChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleRowClick = (approval: ApprovalItem) => {
    setSelectedApproval(approval);
    setIsModalOpen(true);
  };

  const calculateSelectedTotal = () => {
    return approvals
      .filter(approval => selectedIds.includes(approval.id))
      .reduce((total, approval) => total + approval.valor, 0);
  };

  const handleBulkAction = (action: 'APROVAR' | 'REPROVAR') => {
    if (selectedIds.length === 0) return;

    const total = calculateSelectedTotal();
    setConfirmDialog({
      isOpen: true,
      action,
      count: selectedIds.length,
      total
    });
  };

  const confirmBulkAction = () => {
    executeAction({
      ids: selectedIds,
      acao: confirmDialog.action,
      comentario: `Ação em lote: ${confirmDialog.action.toLowerCase()}`
    });

    setSelectedIds([]);
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleSingleAction = (id: string, action: 'APROVAR' | 'REPROVAR', comment: string) => {
    executeAction({
      ids: [id],
      acao: action,
      comentario: comment || `Ação individual: ${action.toLowerCase()}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aprovações</h1>
          <p className="text-gray-600">Gerencie aprovações de orçamentos pendentes</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>Atalhos: A (Aprovar) | R (Reprovar) | Esc (Fechar)</span>
        </div>
      </div>

      {/* Filtros */}
      <ApprovalFilters
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
      />

      {/* Ações em lote */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Itens para Aprovação
              {approvals.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({approvals.length} {approvals.length === 1 ? 'item' : 'itens'})
                </span>
              )}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedIds.length === 0 || isExecuting}
                onClick={() => handleBulkAction('REPROVAR')}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Reprovar Selecionados ({selectedIds.length})
              </Button>
              <Button
                size="sm"
                disabled={selectedIds.length === 0 || isExecuting}
                onClick={() => handleBulkAction('APROVAR')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Aprovar Selecionados ({selectedIds.length})
              </Button>
            </div>
          </div>
          {selectedIds.length > 0 && (
            <p className="text-sm text-gray-600">
              Total selecionado: {calculateSelectedTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sicofe-blue"></div>
            </div>
          ) : (
            <ApprovalTable
              approvals={approvals}
              selectedIds={selectedIds}
              onSelectChange={handleSelectChange}
              onRowClick={handleRowClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <ApprovalDetailModal
        approval={selectedApproval}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={(id, comment) => handleSingleAction(id, 'APROVAR', comment)}
        onReject={(id, comment) => handleSingleAction(id, 'REPROVAR', comment)}
      />

      {/* Dialog de confirmação */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar {confirmDialog.action === 'APROVAR' ? 'Aprovação' : 'Reprovação'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a {confirmDialog.action.toLowerCase()} {confirmDialog.count} {confirmDialog.count === 1 ? 'item' : 'itens'} 
              no valor total de {confirmDialog.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.
              <br /><br />
              Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkAction}
              className={confirmDialog.action === 'APROVAR' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {confirmDialog.action === 'APROVAR' ? 'Aprovar' : 'Reprovar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
