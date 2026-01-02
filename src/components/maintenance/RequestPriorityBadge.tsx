import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPriorityConfig } from "@/constants/maintenanceStatusConstants";

interface RequestPriorityBadgeProps {
  priority: string | null | undefined;
  className?: string;
  showIcon?: boolean;
}

const PRIORITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  low: Info,
  medium: AlertTriangle,
  high: AlertCircle,
  urgent: Zap,
};

export function RequestPriorityBadge({ 
  priority, 
  className,
  showIcon = true
}: RequestPriorityBadgeProps) {
  const config = getPriorityConfig(priority);
  const Icon = PRIORITY_ICONS[priority || 'medium'] || AlertTriangle;

  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs font-medium gap-1",
        config.bgColor,
        config.color,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
