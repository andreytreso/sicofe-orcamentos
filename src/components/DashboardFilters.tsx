import React from 'react';
import { Calendar, Building2, Building } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PeriodType } from './PeriodSelector';
import { useCompanyGroups } from '@/hooks/useCompanyGroups';
import { useUserCompanies } from '@/hooks/useCompanies';

export interface DashboardFilters {
  period: PeriodType;
  groupId: string | null;
  companyId: string | null;
}

interface DashboardFiltersProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  className?: string;
}

const periodOptions = [
  { value: 'month' as const, label: 'Mês' },
  { value: 'quarter' as const, label: 'Trimestre' },
  { value: 'year' as const, label: 'Ano' },
  { value: 'ytd' as const, label: 'YTD' },
];

export function DashboardFilters({ filters, onChange, className = "" }: DashboardFiltersProps) {
  const { data: companyGroups = [] } = useCompanyGroups();
  const { data: companies = [] } = useUserCompanies();

  // Filter companies by selected group if any
  const filteredCompanies = filters.groupId 
    ? companies.filter(company => company.group_id === filters.groupId)
    : companies;

  const handlePeriodChange = (period: PeriodType) => {
    onChange({ ...filters, period });
  };

  const handleGroupChange = (groupId: string) => {
    const newGroupId = groupId === 'all' ? null : groupId;
    onChange({ 
      ...filters, 
      groupId: newGroupId,
      companyId: null // Reset company selection when group changes
    });
  };

  const handleCompanyChange = (companyId: string) => {
    const newCompanyId = companyId === 'all' ? null : companyId;
    onChange({ ...filters, companyId: newCompanyId });
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      {/* Period Selector */}
      <div className="flex items-center">
        <div className="hidden sm:block">
          <Select value={filters.period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-36 h-9 text-sm border-gray-300 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              {periodOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-sicofe-gray hover:bg-blue-50 hover:text-sicofe-blue cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="sm:hidden">
          <Select value={filters.period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-10 h-9 p-0 border-gray-300 bg-white flex items-center justify-center">
              <Calendar className="h-4 w-4 text-sicofe-gray" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              {periodOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-sicofe-gray hover:bg-blue-50 hover:text-sicofe-blue cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Group Selector */}
      {companyGroups.length > 0 && (
        <div className="flex items-center">
          <Select 
            value={filters.groupId || 'all'} 
            onValueChange={handleGroupChange}
          >
            <SelectTrigger className="w-40 h-9 text-sm border-gray-300 bg-white">
              <Building2 className="h-4 w-4 text-sicofe-gray mr-2" />
              <SelectValue placeholder="Todos os grupos" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem 
                value="all"
                className="text-sicofe-gray hover:bg-blue-50 hover:text-sicofe-blue cursor-pointer"
              >
                Todos os grupos
              </SelectItem>
              {companyGroups.map((group) => (
                <SelectItem 
                  key={group.id} 
                  value={group.id}
                  className="text-sicofe-gray hover:bg-blue-50 hover:text-sicofe-blue cursor-pointer"
                >
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Company Selector */}
      <div className="flex items-center">
        <Select 
          value={filters.companyId || 'all'} 
          onValueChange={handleCompanyChange}
        >
          <SelectTrigger className="w-40 h-9 text-sm border-gray-300 bg-white">
            <Building className="h-4 w-4 text-sicofe-gray mr-2" />
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            <SelectItem 
              value="all"
              className="text-sicofe-gray hover:bg-blue-50 hover:text-sicofe-blue cursor-pointer"
            >
              Todas as empresas
            </SelectItem>
            {filteredCompanies.map((company) => (
              <SelectItem 
                key={company.id} 
                value={company.id!}
                className="text-sicofe-gray hover:bg-blue-50 hover:text-sicofe-blue cursor-pointer"
              >
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}