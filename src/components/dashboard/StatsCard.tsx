import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  className,
  iconColor = "text-primary"
}: StatsCardProps) => {
  return (
    <Card className={cn("card-elegant", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("h-5 w-5", iconColor)} />
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  trend.isPositive 
                    ? "bg-success/10 text-success" 
                    : "bg-destructive/10 text-destructive"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}
                </span>
              </div>
            )}
          </div>

          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            iconColor === "text-primary" && "bg-primary/10",
            iconColor === "text-secondary" && "bg-secondary/10", 
            iconColor === "text-success" && "bg-success/10",
            iconColor === "text-warning" && "bg-warning/10"
          )}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
