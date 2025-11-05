import { CheckCircle, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStage {
  id: string;
  label: string;
  description: string;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: "submitted", label: "تم التقديم", description: "تم إرسال الطلب" },
  { id: "acknowledged", label: "تم الاستلام", description: "تم استلام الطلب ومراجعته" },
  { id: "assigned", label: "تم التخصيص", description: "تم تعيين فني للطلب" },
  { id: "in_progress", label: "قيد التنفيذ", description: "جاري العمل على الطلب" },
  { id: "completed", label: "مكتمل", description: "تم إكمال العمل" },
  { id: "closed", label: "مغلق", description: "تم إغلاق الطلب" }
];

interface WorkflowTimelineProps {
  currentStage: string;
  className?: string;
}

export function WorkflowTimeline({ currentStage, className }: WorkflowTimelineProps) {
  const getCurrentStageIndex = () => {
    const index = WORKFLOW_STAGES.findIndex(stage => stage.id === currentStage);
    return index === -1 ? 0 : index;
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="h-5 w-5" />
        مراحل الطلب
      </h3>
      
      <div className="relative">
        {WORKFLOW_STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={stage.id} className="flex gap-4 relative">
              {/* Connector Line */}
              {index < WORKFLOW_STAGES.length - 1 && (
                <div 
                  className={cn(
                    "absolute right-[15px] top-[32px] w-[2px] h-[calc(100%+16px)]",
                    isCompleted ? "bg-green-500" : "bg-border"
                  )}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                {isCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                    <Circle className="h-5 w-5 text-primary-foreground fill-current" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-border bg-background flex items-center justify-center">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={cn(
                "flex-1 pb-8",
                isCurrent && "font-semibold"
              )}>
                <div className={cn(
                  "text-sm",
                  isCompleted && "text-green-600",
                  isCurrent && "text-primary",
                  isPending && "text-muted-foreground"
                )}>
                  {stage.label}
                  {isCurrent && (
                    <span className="mr-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      الحالية
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stage.description}
                </p>
                {isCompleted && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    مكتمل
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">التقدم</span>
          <span className="font-semibold">
            {Math.round((currentIndex / (WORKFLOW_STAGES.length - 1)) * 100)}%
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500 rounded-full"
            style={{ width: `${(currentIndex / (WORKFLOW_STAGES.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
