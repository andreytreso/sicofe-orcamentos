
import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PeriodType = 'month' | 'quarter' | 'year' | 'ytd';

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
  className?: string;
}

const periodOptions = [
  { value: 'month' as const, label: 'Mês' },
  { value: 'quarter' as const, label: 'Trimestre' },
  { value: 'year' as const, label: 'Ano' },
  { value: 'ytd' as const, label: 'YTD' },
];

export function PeriodSelector({ value, onChange, className = "" }: PeriodSelectorProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Desktop version */}
      <div className="hidden sm:block">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-36 h-9 text-sm border-gray-300 bg-white">
            <SelectValue />
            <ChevronDown className="h-4 w-4 opacity-50" />
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

      {/* Mobile version - collapsed to calendar icon */}
      <div className="sm:hidden">
        <Select value={value} onValueChange={onChange}>
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
  );
}
