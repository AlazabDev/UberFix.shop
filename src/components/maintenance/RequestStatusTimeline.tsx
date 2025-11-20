import { CheckCircle, Circle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatusTimelineProps {
  currentStatus: string;
  workflowStage?: string;
  createdAt: string;
  updatedAt?: string;
}

export function RequestStatusTimeline({ 
  currentStatus, 
  workflowStage, 
  createdAt, 
  updatedAt 
}: StatusTimelineProps) {
  const stages = [
    { key: 'submitted', label: 'تم التقديم', stage: 'submitted' },
    { key: 'acknowledged', label: 'تم الاستلام', stage: 'acknowledged' },
    { key: 'assigned', label: 'تم التخصيص', stage: 'assigned' },
    { key: 'in_progress', label: 'قيد التنفيذ', stage: 'in_progress' },
    { key: 'completed', label: 'مكتمل', stage: 'completed' },
    { key: 'closed', label: 'مغلق', stage: 'closed' }
  ];

  const getCurrentStageIndex = () => {
    const index = stages.findIndex(s => s.stage === (workflowStage || currentStatus));
    return index !== -1 ? index : 0;
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          مراحل الطلب
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute top-5 left-5 bottom-5 w-0.5 bg-border" />
          <div className="space-y-6">
            {stages.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const _isPending = index > currentIndex;

              return (
                <div key={stage.key} className="relative flex items-start gap-4">
                  <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted 
                      ? 'bg-success border-success' 
                      : isCurrent 
                        ? 'bg-primary border-primary animate-pulse' 
                        : 'bg-background border-muted'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-success-foreground" />
                    ) : isCurrent ? (
                      <Circle className="h-5 w-5 text-primary-foreground fill-current" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${
                        isCompleted 
                          ? 'text-success' 
                          : isCurrent 
                            ? 'text-primary' 
                            : 'text-muted-foreground'
                      }`}>
                        {stage.label}
                      </h4>
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs">الحالية</Badge>
                      )}
                    </div>
                    {isCurrent && updatedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        آخر تحديث: {new Date(updatedAt).toLocaleString('ar-SA')}
                      </p>
                    )}
                    {index === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(createdAt).toLocaleString('ar-SA')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
