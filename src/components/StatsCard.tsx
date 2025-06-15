
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { KPITooltip } from "./KPITooltip";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  tooltip?: string;
  trend?: {
    value: string;
    absoluteValue?: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, tooltip, trend, className = "" }: StatsCardProps) {
  const formatTrendText = () => {
    if (!trend) return null;
    
    if (trend.absoluteValue === "0" || trend.value === "0%") {
      return (
        <span className="text-sicofe-gray">
          0% em relação ao período anterior
        </span>
      );
    }
    
    const sign = trend.isPositive ? "+" : "-";
    const colorClass = trend.isPositive ? 'text-sicofe-green' : 'text-sicofe-red';
    
    return (
      <>
        {trend.absoluteValue && (
          <>
            <span className={colorClass}>{sign}{trend.absoluteValue}</span>
            <span className="text-sicofe-gray">  </span>
          </>
        )}
        <span className={colorClass}>({sign}{trend.value})</span>
        <span className="text-sicofe-gray"> em relação ao período anterior</span>
      </>
    );
  };

  return (
    <Card className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center">
          <CardTitle className="text-sm font-medium text-sicofe-gray">{title}</CardTitle>
          {tooltip && <KPITooltip content={tooltip} />}
        </div>
        <Icon className="h-5 w-5 text-sicofe-blue" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-sicofe-navy">{value}</div>
        {trend && (
          <p className="text-xs mt-1">
            {formatTrendText()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
