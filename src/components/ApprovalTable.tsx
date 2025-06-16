
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
        return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'REPROVADO':
        return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Reprovado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const isAllSelected = approvals.length > 0 && selectedIds.length === approvals.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < approvals.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                ref={(ref) => {
                  if (ref) ref.indeterminate = isPartiallySelected;
                }}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-8"></TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Grupo 1º Nível</TableHead>
            <TableHead>Grupo 2º Nível</TableHead>
            <TableHead>Conta Analítica</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                Nenhuma aprovação encontrada
              </TableCell>
            </TableRow>
          ) : (
            approvals.map((approval) => (
              <TableRow 
                key={approval.id}
                className="hover:bg-gray-50 cursor-pointer"
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
                      className="p-0 h-6 w-6"
                    >
                      {expandedRows.includes(approval.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </TableCell>
                <TableCell className="font-medium">{approval.data}</TableCell>
                <TableCell>{approval.grupo1Nivel}</TableCell>
                <TableCell>{approval.grupo2Nivel}</TableCell>
                <TableCell>{approval.contaAnalitica}</TableCell>
                <TableCell className="text-right font-medium">
                  {approval.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell>{approval.solicitante}</TableCell>
                <TableCell>{getStatusBadge(approval.status)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
