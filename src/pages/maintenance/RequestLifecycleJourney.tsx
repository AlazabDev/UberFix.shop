import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppFooter } from "@/components/shared/AppFooter";
import { ArrowRight } from "lucide-react";
import { 
  WORKFLOW_STAGES, 
  HAPPY_PATH_STAGES, 
  getAllStagesArray,
  type WorkflowStage 
} from "@/constants/workflowStages";
import { cn } from "@/lib/utils";

export default function RequestLifecycleJourney() {
  const allStages = getAllStagesArray();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          دورة حياة طلب الصيانة الكاملة
        </h1>
        <p className="text-muted-foreground">
          نظرة شاملة على جميع المراحل التي يمر بها طلب الصيانة من الإرسال حتى الإغلاق
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allStages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <Card key={stage.key} className="relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 right-0 h-1", stage.bgColor)} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg text-white", stage.bgColor)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{stage.label}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {stage.key}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {stage.description}
                </p>

                {stage.actions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2">
                      الإجراءات المتاحة:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {stage.actions.map((action) => (
                        <Badge key={action} variant="secondary" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {stage.nextStages.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      المراحل التالية المحتملة:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {stage.nextStages.map((nextStageKey) => {
                        const next = WORKFLOW_STAGES[nextStageKey];
                        return (
                          <Badge 
                            key={nextStageKey} 
                            className={cn("text-xs text-white border-0", next?.bgColor)}
                          >
                            {next?.label || nextStageKey}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    الحالة في DB: <code className="bg-muted px-1 rounded">{stage.status}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>مفتاح الألوان</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted" />
              <span className="text-sm">مسودة / تحضير</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-sm">قيد المعالجة</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span className="text-sm">في انتظار إجراء</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-sm">موافقة / نجاح</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-sm">جاري التنفيذ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-sm">ملغي / مرفوض</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-500" />
              <span className="text-sm">مجدول</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-500" />
              <span className="text-sm">مغلق / مؤرشف</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المسار الطبيعي للطلب (Happy Path)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {HAPPY_PATH_STAGES.map((stageKey, index, arr) => {
              const stageInfo = WORKFLOW_STAGES[stageKey];
              const Icon = stageInfo?.icon;
              return (
                <div key={stageKey} className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs",
                    stageInfo?.bgColor
                  )}>
                    {Icon && <Icon className="h-3 w-3" />}
                    {stageInfo?.label}
                  </div>
                  {index < arr.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AppFooter />
    </div>
  );
}
