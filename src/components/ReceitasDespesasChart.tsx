import React, { useState } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, ReferenceLine, Cell } from "recharts";
import { PeriodType } from "./PeriodSelector";
import { useNavigate } from "react-router-dom";
import { useChartData } from "@/hooks/useChartData";
import { Loader2 } from "lucide-react";
interface ChartDataPoint {
  month: string;
  receitas: number;
  despesas: number;
  meta: number;
  monthKey: string;
  receitasAcum?: number;
  despesasAcum?: number;
  metaAcum?: number;
}
interface ReceitasDespesasChartProps {
  selectedPeriod: PeriodType;
}
const chartConfig = {
  receitas: {
    label: "Receitas",
    color: "#3B82F6"
  },
  despesas: {
    label: "Despesas",
    color: "#EF4444"
  },
  meta: {
    label: "Meta",
    color: "#6B7280"
  }
};

// Removed mock data - now using real data from Supabase
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`;
  }
  return `R$ ${value.toLocaleString('pt-BR')}`;
};
const CustomTooltip = ({
  active,
  payload,
  label
}: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm">
        <p className="font-medium text-sicofe-navy mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-blue-600">
            Receitas: {formatCurrency(data.receitas)}
          </p>
          <p className="text-red-600">
            Despesas: {formatCurrency(data.despesas)}
          </p>
          <p className="text-gray-600">
            Meta: {formatCurrency(data.meta)}
          </p>
        </div>
      </div>;
  }
  return null;
};
export function ReceitasDespesasChart({
  selectedPeriod
}: ReceitasDespesasChartProps) {
  const [viewMode, setViewMode] = useState<'monthly' | 'ytd'>('monthly');
  const navigate = useNavigate();
  const { data: chartData = [], isLoading } = useChartData(selectedPeriod);
  const handleBarClick = (data: ChartDataPoint) => {
    navigate(`/analise-detalhada?mes=${data.monthKey}`);
  };
  const renderMonthlyChart = () => <BarChart data={chartData} onClick={data => data && handleBarClick(data.activePayload?.[0]?.payload)} style={{
    background: 'transparent'
  }}>
      <XAxis dataKey="month" tick={{
      fill: '#334155',
      fontSize: 12,
      fontWeight: 500
    }} axisLine={{
      stroke: '#334155'
    }} />
      <YAxis tick={{
      fill: '#334155',
      fontSize: 12,
      fontWeight: 500
    }} axisLine={{
      stroke: '#334155'
    }} tickFormatter={formatCurrency} />
      <ChartTooltip content={<CustomTooltip />} />
      <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
      <Bar dataKey="receitas" fill="var(--color-receitas)" style={{
      cursor: 'pointer'
    }} radius={[2, 2, 0, 0]}>
        {chartData.map((entry, index) => <Cell key={`cell-receitas-${index}`} />)}
      </Bar>
      <Bar dataKey="despesas" fill="var(--color-despesas)" style={{
      cursor: 'pointer'
    }} radius={[2, 2, 0, 0]}>
        {chartData.map((entry, index) => <Cell key={`cell-despesas-${index}`} stroke={entry.despesas > entry.meta ? "#F97316" : "transparent"} strokeWidth={entry.despesas > entry.meta ? 2 : 0} />)}
      </Bar>
      <Line type="monotone" dataKey="meta" stroke="var(--color-meta)" strokeWidth={2} dot={{
      fill: 'var(--color-meta)',
      strokeWidth: 2,
      r: 4
    }} activeDot={{
      r: 6,
      stroke: 'var(--color-meta)',
      strokeWidth: 2
    }} />
    </BarChart>;
  const renderYTDChart = () => <LineChart data={chartData} onClick={data => data && handleBarClick(data.activePayload?.[0]?.payload)} style={{
    background: 'transparent'
  }}>
      <XAxis dataKey="month" tick={{
      fill: '#334155',
      fontSize: 12,
      fontWeight: 500
    }} axisLine={{
      stroke: '#334155'
    }} />
      <YAxis tick={{
      fill: '#334155',
      fontSize: 12,
      fontWeight: 500
    }} axisLine={{
      stroke: '#334155'
    }} tickFormatter={formatCurrency} />
      <ChartTooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="receitasAcum" stroke="var(--color-receitas)" strokeWidth={3} dot={{
      fill: 'var(--color-receitas)',
      strokeWidth: 2,
      r: 4
    }} activeDot={{
      r: 6,
      stroke: 'var(--color-receitas)',
      strokeWidth: 2
    }} style={{
      cursor: 'pointer'
    }} />
      <Line type="monotone" dataKey="despesasAcum" stroke="var(--color-despesas)" strokeWidth={3} dot={{
      fill: 'var(--color-despesas)',
      strokeWidth: 2,
      r: 4
    }} activeDot={{
      r: 6,
      stroke: 'var(--color-despesas)',
      strokeWidth: 2
    }} style={{
      cursor: 'pointer'
    }} />
      <Line type="monotone" dataKey="metaAcum" stroke="var(--color-meta)" strokeWidth={2} strokeDasharray="5 5" dot={{
      fill: 'var(--color-meta)',
      strokeWidth: 2,
      r: 4
    }} activeDot={{
      r: 6,
      stroke: 'var(--color-meta)',
      strokeWidth: 2
    }} style={{
      cursor: 'pointer'
    }} />
    </LineChart>;
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center h-80">
        <Loader2 className="h-6 w-6 animate-spin text-sicofe-blue" />
      </div>
    );
  }

  return <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Estilos CSS customizados para remover fundo amarelo */}
      <style dangerouslySetInnerHTML={{
      __html: `
          .recharts-active-bar,
          .recharts-bar:hover,
          .recharts-active-dot,
          .recharts-dot:hover,
          .recharts-tooltip-cursor {
            fill: transparent !important;
            background: transparent !important;
            background-color: transparent !important;
          }
          
          .recharts-cartesian-grid-horizontal line,
          .recharts-cartesian-grid-vertical line {
            stroke: #e5e7eb !important;
          }
          
          .recharts-surface {
            background: transparent !important;
          }
          
          .recharts-wrapper {
            background: transparent !important;
          }
          
          .recharts-rectangle.recharts-tooltip-cursor {
            fill: rgba(59, 130, 246, 0.1) !important;
            stroke: transparent !important;
          }
        `
    }} />
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-sicofe-navy">
          Receitas vs Despesas
        </h3>
        <ToggleGroup type="single" value={viewMode} onValueChange={value => value && setViewMode(value as 'monthly' | 'ytd')} className="border border-gray-200 rounded-md">
          <ToggleGroupItem value="monthly" className="text-xs py-1 data-[state=on]:bg-sicofe-blue data-[state=on]:text-white px-[25px]">
            Mês a Mês
          </ToggleGroupItem>
          <ToggleGroupItem value="ytd" className="text-xs py-1 data-[state=on]:bg-sicofe-blue data-[state=on]:text-white px-[12px]">
            Acumulado YTD
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <ChartContainer config={chartConfig} className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'monthly' ? renderMonthlyChart() : renderYTDChart()}
        </ResponsiveContainer>
      </ChartContainer>
      
      <div className="mt-3 text-xs text-gray-500">
        💡 Clique em uma coluna ou ponto para ver análise detalhada
      </div>
    </div>;
}