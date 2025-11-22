import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ClipboardCheck, 
  CheckCircle, 
  Wrench, 
  Database,
  BarChart3,
  FileSpreadsheet,
  Calculator,
  Package
} from "lucide-react";

interface WorkflowDiagramProps {
  currentStage?: string;
  requestData?: any;
}

export function WorkflowDiagram({ currentStage, requestData }: WorkflowDiagramProps) {
  const stages = [
    { key: 'submitted', label: 'تسجيل الطلب', icon: FileText, color: 'bg-blue-500' },
    { key: 'acknowledged', label: 'مراجعة الطلب', icon: ClipboardCheck, color: 'bg-purple-500' },
    { key: 'approved', label: 'الموافقة والتحديد', icon: CheckCircle, color: 'bg-green-500' },
    { key: 'preparation', label: 'إعداد التجهيز', icon: Package, color: 'bg-orange-500' },
    { key: 'in_progress', label: 'إجراء العمل', icon: Wrench, color: 'bg-yellow-500' },
    { key: 'inspection', label: 'فحص وتقييم', icon: Database, color: 'bg-teal-500' },
    { key: 'analysis', label: 'تحليل البيانات', icon: BarChart3, color: 'bg-indigo-500' },
    { key: 'reporting', label: 'إعداد التقرير', icon: FileSpreadsheet, color: 'bg-pink-500' },
    { key: 'billed', label: 'الفوترة', icon: Calculator, color: 'bg-red-500' },
    { key: 'completed', label: 'مكتمل', icon: CheckCircle, color: 'bg-emerald-500' }
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.key === currentStage);
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          مخطط سير العمل
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Workflow Stages */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isPending = index > currentIndex;

              return (
                <div
                  key={stage.key}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'border-success bg-success/10'
                      : isCurrent
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-muted bg-muted/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`p-3 rounded-full ${
                        isCompleted
                          ? 'bg-success text-success-foreground'
                          : isCurrent
                          ? stage.color + ' text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{stage.label}</p>
                      {isCurrent && (
                        <Badge variant="default" className="mt-1">
                          المرحلة الحالية
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Connection Line */}
                  {index < stages.length - 1 && (
                    <div
                      className={`hidden lg:block absolute top-1/2 left-full w-4 h-0.5 ${
                        isCompleted ? 'bg-success' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Stage Info */}
          {currentStage && (
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2">معلومات المرحلة الحالية</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">الحالة:</span>
                  <span className="font-medium mr-2">{stages[currentIndex]?.label}</span>
                </div>
                {requestData?.updated_at && (
                  <div>
                    <span className="text-muted-foreground">آخر تحديث:</span>
                    <span className="font-medium mr-2">
                      {new Date(requestData.updated_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
