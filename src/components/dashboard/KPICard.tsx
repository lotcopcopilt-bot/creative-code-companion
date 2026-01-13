import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tooltip?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  suffix?: string;
  prefix?: string;
}

const KPICard = ({ icon, label, value, tooltip, trend, suffix, prefix }: KPICardProps) => {
  const formatValue = () => {
    if (typeof value === "number") {
      return value.toLocaleString("fr-FR");
    }
    return value;
  };

  return (
    <Card className="bg-card border-border hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold text-foreground">
            {prefix}
            {formatValue()}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </div>

          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                trend.direction === "up" && "bg-green-500/10 text-green-600",
                trend.direction === "down" && "bg-red-500/10 text-red-600",
                trend.direction === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
              {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
              {trend.direction === "neutral" && <Minus className="h-3 w-3" />}
              <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
