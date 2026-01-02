import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusConfig, getWorkflowStageConfig } from "@/constants/maintenanceStatusConstants";

interface RequestStatusBadgeProps {
  status: string | null | undefined;
  workflowStage?: string | null;
  className?: string;
  showWorkflowStage?: boolean;
}

export function RequestStatusBadge({ 
  status, 
  workflowStage,
  className,
  showWorkflowStage = false
}: RequestStatusBadgeProps) {
  // استخدام مرحلة سير العمل إذا كانت متاحة ومطلوبة، وإلا استخدام الحالة
  const config = showWorkflowStage && workflowStage 
    ? getWorkflowStageConfig(workflowStage)
    : getStatusConfig(status);

  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs font-medium",
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
