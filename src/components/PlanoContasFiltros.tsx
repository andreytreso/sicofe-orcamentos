import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { useLevel1Options, useLevel2Options, useAnalyticalAccountOptions } from "@/hooks/useAccountHierarchy";

interface Filters {
  level_1?: string;
  level_2?: string;
  analytical_account?: string;
}

interface PlanoContasFiltrosProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function PlanoContasFiltros({ filters, onFiltersChange }: PlanoContasFiltrosProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  
  const level1Options = useLevel1Options();
  const level2Options = useLevel2Options(localFilters.level_1);
  const analyticalOptions = useAnalyticalAccountOptions(localFilters.level_1, localFilters.level_2);

  const handleFilterChange = (key: keyof Filters, value?: string) => {
    const newFilters = { ...localFilters };
    
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }

    // Clear dependent filters when parent changes
    if (key === 'level_1') {
      delete newFilters.level_2;
      delete newFilters.analytical_account;
    } else if (key === 'level_2') {
      delete newFilters.analytical_account;
    }

    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nível 1 (Grupo)</label>
            <Select 
              value={localFilters.level_1 || "all"} 
              onValueChange={(value) => handleFilterChange('level_1', value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os grupos</SelectItem>
                {level1Options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nível 2 (Subgrupo)</label>
            <Select 
              value={localFilters.level_2 || "all"} 
              onValueChange={(value) => handleFilterChange('level_2', value === "all" ? undefined : value)}
              disabled={!localFilters.level_1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar subgrupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os subgrupos</SelectItem>
                {level2Options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Conta Analítica</label>
            <Select 
              value={localFilters.analytical_account || "all"} 
              onValueChange={(value) => handleFilterChange('analytical_account', value === "all" ? undefined : value)}
              disabled={!localFilters.level_2}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {analyticalOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-wrap gap-2">
            {filters.level_1 && (
              <Badge variant="secondary" className="text-xs">
                Grupo: {filters.level_1}
                <button 
                  onClick={() => handleFilterChange('level_1')}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.level_2 && (
              <Badge variant="secondary" className="text-xs">
                Subgrupo: {filters.level_2}
                <button 
                  onClick={() => handleFilterChange('level_2')}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.analytical_account && (
              <Badge variant="secondary" className="text-xs">
                Conta: {filters.analytical_account}
                <button 
                  onClick={() => handleFilterChange('analytical_account')}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          
          <Button onClick={applyFilters} size="sm">
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}