
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalFilter } from "@/types/approval";

interface ApprovalFiltersProps {
  filters: ApprovalFilter;
  onFiltersChange: (filters: ApprovalFilter) => void;
  onSearch: () => void;
}

export function ApprovalFilters({ filters, onFiltersChange, onSearch }: ApprovalFiltersProps) {
  const handleFilterChange = (key: keyof ApprovalFilter, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Empresa</label>
            <Select
              value={filters.empresaId}
              onValueChange={(value) => handleFilterChange('empresaId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Empresa A</SelectItem>
                <SelectItem value="2">Empresa B</SelectItem>
                <SelectItem value="3">Empresa C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Período</label>
            <Select
              value={filters.periodo}
              onValueChange={(value) => handleFilterChange('periodo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-06">Junho 2024</SelectItem>
                <SelectItem value="2024-05">Maio 2024</SelectItem>
                <SelectItem value="2024-04">Abril 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value as ApprovalFilter['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="APROVADO">Aprovado</SelectItem>
                <SelectItem value="REPROVADO">Reprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={onSearch} className="w-full bg-sicofe-blue hover:bg-sicofe-blue-dark">
              Buscar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
