
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApprovalItem } from "@/types/approval";
import { Check, X, Clock, ChevronRight, ChevronDown } from "lucide-react";

interface ApprovalTableProps {
  approvals: ApprovalItem[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onRowClick: (approval: ApprovalItem) => void;
}

export function ApprovalTable({ 
  approvals, 
  selectedIds, 
  onSelectChange, 
  onRowClick 
}: ApprovalTableProps) {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectChange(approvals.map(item => item.id));
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      onSelectChange([...selectedIds, id]);
    } else {
      onSelectChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Check className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'REPROVADO':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><X className="w-3 h-3 mr-1" />Reprovado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const isAllSelected = approvals.length > 0 && selectedIds.length === approvals.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < approvals.length;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200">
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                className={isPartiallySelected ? "data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-blue-100" : ""}
              />
            </TableHead>
            <TableHead className="w-8"></TableHead>
            <TableHead className="text-gray-700 font-medium">Data</TableHead>
            <TableHead className="text-gray-700 font-medium">Grupo 1º Nível</TableHead>
            <TableHead className="text-gray-700 font-medium">Grupo 2º Nível</TableHead>
            <TableHead className="text-gray-700 font-medium">Conta Analítica</TableHead>
            <TableHead className="text-gray-700 font-medium">Centro de Custo</TableHead>
            <TableHead className="text-right text-gray-700 font-medium">Valor</TableHead>
            <TableHead className="text-gray-700 font-medium">Solicitante</TableHead>
            <TableHead className="text-gray-700 font-medium">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                Nenhum item encontrado
              </TableCell>
            </TableRow>
          ) : (
            approvals.map((approval) => (
              <TableRow 
                key={approval.id}
                className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                onClick={() => onRowClick(approval)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(approval.id)}
                    onCheckedChange={(checked) => handleSelectItem(approval.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {approval.children && approval.children.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(approval.id)}
                      className="p-0 h-6 w-6 hover:bg-gray-100"
                    >
                      {expandedRows.includes(approval.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </TableCell>
                <TableCell className="font-medium text-gray-900">{approval.data}</TableCell>
                <TableCell className="text-gray-700">{approval.grupo1Nivel}</TableCell>
                <TableCell className="text-gray-700">{approval.grupo2Nivel}</TableCell>
                <TableCell className="text-gray-700">{approval.contaAnalitica}</TableCell>
                <TableCell className="text-gray-700 text-sm">
                  {approval.allCostCenters ? 'Todos' : (approval.costCenterNames || '-')}
                </TableCell>
                <TableCell className="text-right font-medium text-gray-900">
                  {approval.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="text-gray-700">{approval.solicitante}</TableCell>
                <TableCell>{getStatusBadge(approval.status)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
