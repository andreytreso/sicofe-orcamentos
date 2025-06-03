
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className = "" }: StatsCardProps) {
  return (
    <Card className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-sicofe-gray">{title}</CardTitle>
        <Icon className="h-5 w-5 text-sicofe-blue" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-sicofe-navy">{value}</div>
        {trend && (
          <p className={`text-xs mt-1 ${trend.isPositive ? 'text-sicofe-green' : 'text-sicofe-red'}`}>
            {trend.isPositive ? '+' : ''}{trend.value} em relação ao mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}
