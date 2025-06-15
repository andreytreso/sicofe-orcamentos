
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
      return "0%";
    }
    
    const sign = trend.isPositive ? "+" : "";
    const absolutePart = trend.absoluteValue ? `${sign}${trend.absoluteValue}  ` : "";
    const percentagePart = `(${sign}${trend.value})`;
    
    return `${absolutePart}${percentagePart} em relação ao período anterior`;
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
          <p className={`text-xs mt-1 ${trend.isPositive ? 'text-sicofe-green' : 'text-sicofe-red'}`}>
            {formatTrendText()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
