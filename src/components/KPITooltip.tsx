
import React from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPITooltipProps {
  content: string;
}

export function KPITooltip({ content }: KPITooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className="ml-1 p-0.5 rounded-full hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-sicofe-blue focus:ring-opacity-50 transition-colors"
            aria-label="Informações sobre este indicador"
          >
            <Info className="h-3.5 w-3.5 text-sicofe-gray hover:text-sicofe-blue transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs bg-white border border-gray-200 shadow-lg text-sm text-sicofe-gray-dark p-3"
          sideOffset={8}
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
