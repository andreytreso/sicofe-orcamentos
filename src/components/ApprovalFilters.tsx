
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ApprovalFilter } from "@/types/approval";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface ApprovalFiltersProps {
  filters: ApprovalFilter;
  onFiltersChange: (filters: ApprovalFilter) => void;
  onSearch: () => void;
  isSearching?: boolean;
}

import { useUserCompanies } from '@/hooks/useCompanies';

export function ApprovalFilters({ filters, onFiltersChange, onSearch, isSearching = false }: ApprovalFiltersProps) {
  const { data: companies = [], isLoading: isLoadingEmpresas } = useUserCompanies();
  
  const empresas = [
    { id: 'all', nome: 'Todas as empresas' },
    ...companies.map(company => ({ id: company.id, nome: company.name }))
  ];

  const handleFilterChange = (key: keyof ApprovalFilter, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const isSearchDisabled = !filters.empresaId || isSearching || isLoadingEmpresas;

  return (
    <Card className="mb-6 bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Empresa *</label>
            <Select
              value={filters.empresaId}
              onValueChange={(value) => handleFilterChange('empresaId', value)}
              disabled={isLoadingEmpresas}
            >
              <SelectTrigger className="h-10 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm">
                <SelectValue placeholder={isLoadingEmpresas ? "Carregando..." : "Selecione a empresa"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {empresas.map((empresa) => (
                  <SelectItem 
                    key={empresa.id} 
                    value={empresa.id}
                    className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900"
                  >
                    {empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Período</label>
            <Select
              value={filters.periodo}
              onValueChange={(value) => handleFilterChange('periodo', value)}
            >
              <SelectTrigger className="h-10 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <SelectItem value="2024-12" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Dezembro 2024</SelectItem>
                <SelectItem value="2024-11" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Novembro 2024</SelectItem>
                <SelectItem value="2024-10" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Outubro 2024</SelectItem>
                <SelectItem value="2024-09" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Setembro 2024</SelectItem>
                <SelectItem value="2024-Q4" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">4º Trimestre 2024</SelectItem>
                <SelectItem value="2024-Q3" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">3º Trimestre 2024</SelectItem>
                <SelectItem value="2024" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Ano 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value as ApprovalFilter['status'])}
            >
              <SelectTrigger className="h-10 bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <SelectItem value="TODOS" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Todos</SelectItem>
                <SelectItem value="PENDENTE" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Pendente</SelectItem>
                <SelectItem value="APROVADO" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Aprovado</SelectItem>
                <SelectItem value="REPROVADO" className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer px-3 py-2 text-gray-900">Reprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={onSearch} 
              className="w-full bg-sicofe-blue hover:bg-sicofe-blue-dark"
              disabled={isSearchDisabled}
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
        </div>
        {!filters.empresaId && (
          <p className="text-sm text-red-600 mt-2">* Selecione uma empresa para habilitar a busca</p>
        )}
      </CardContent>
    </Card>
  );
}
