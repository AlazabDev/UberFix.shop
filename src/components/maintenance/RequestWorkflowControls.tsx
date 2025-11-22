import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  FileCheck,
  DollarSign,
  XCircle,
  Pause,
} from "lucide-react";
import { MaintenanceRequest, WorkflowStage } from "@/hooks/useMaintenanceRequests";

interface RequestWorkflowControlsProps {
  request: MaintenanceRequest;
  onUpdate?: () => void;
}

const workflowStages: { value: WorkflowStage; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'submitted', label: 'تم الإرسال', icon: Clock, color: 'bg-blue-500' },
  { value: 'acknowledged', label: 'تم الاستلام', icon: CheckCircle2, color: 'bg-cyan-500' },
  { value: 'assigned', label: 'تم التعيين', icon: UserCheck, color: 'bg-purple-500' },
  { value: 'scheduled', label: 'تم الجدولة', icon: Clock, color: 'bg-indigo-500' },
  { value: 'in_progress', label: 'قيد التنفيذ', icon: Wrench, color: 'bg-yellow-500' },
  { value: 'inspection', label: 'قيد الفحص', icon: FileCheck, color: 'bg-orange-500' },
  { value: 'completed', label: 'مكتمل', icon: CheckCircle2, color: 'bg-green-500' },
  { value: 'billed', label: 'تم الفوترة', icon: DollarSign, color: 'bg-emerald-500' },
  { value: 'closed', label: 'مغلق', icon: CheckCircle2, color: 'bg-gray-500' },
  { value: 'cancelled', label: 'ملغي', icon: XCircle, color: 'bg-red-500' },
  { value: 'on_hold', label: 'معلق', icon: Pause, color: 'bg-amber-500' },
];

export function RequestWorkflowControls({ request, onUpdate }: RequestWorkflowControlsProps) {
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<WorkflowStage>(
    (request.workflow_stage as WorkflowStage) || 'submitted'
  );
  const { toast } = useToast();

  const currentStage = workflowStages.find(s => s.value === selectedStage);

  const updateWorkflowStage = async (newStage: WorkflowStage) => {
    setLoading(true);
    try {
      const updates: Record<string, string | number> = {
        workflow_stage: newStage,
      };

      // تحديث الحالة التقليدية أيضاً
      if (newStage === 'completed' || newStage === 'closed') {
        updates.status = 'completed';
        updates.actual_completion = new Date().toISOString();
      } else if (newStage === 'in_progress') {
        updates.status = 'in_progress';
      } else if (newStage === 'cancelled') {
        updates.status = 'cancelled';
      } else if (newStage === 'on_hold') {
        updates.status = 'on_hold';
      }

      const { error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "✓ تم التحديث",
        description: `تم تحديث مرحلة الطلب إلى: ${workflowStages.find(s => s.value === newStage)?.label}`,
      });

      if (onUpdate) {
      onUpdate();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "فشل في تحديث المرحلة";
      console.error('Error updating workflow:', error);
      toast({
        title: "خطأ",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = (value: string) => {
    const newStage = value as WorkflowStage;
    setSelectedStage(newStage);
    updateWorkflowStage(newStage);
  };

  const quickActions = [
    {
      label: 'بدء العمل',
      stage: 'in_progress' as WorkflowStage,
      variant: 'default' as const,
      show: selectedStage === 'scheduled' || selectedStage === 'assigned',
    },
    {
      label: 'إكمال',
      stage: 'completed' as WorkflowStage,
      variant: 'default' as const,
      show: selectedStage === 'in_progress' || selectedStage === 'inspection',
    },
    {
      label: 'إغلاق',
      stage: 'closed' as WorkflowStage,
      variant: 'secondary' as const,
      show: selectedStage === 'completed' || selectedStage === 'billed',
    },
    {
      label: 'تعليق',
      stage: 'on_hold' as WorkflowStage,
      variant: 'outline' as const,
      show: selectedStage === 'in_progress' || selectedStage === 'scheduled',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          التحكم في سير العمل
        </CardTitle>
        <CardDescription>
          إدارة مراحل تنفيذ طلب الصيانة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* المرحلة الحالية */}
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
          {currentStage && (
            <>
              <div className={`p-2 rounded-full ${currentStage.color}`}>
                <currentStage.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">المرحلة الحالية</p>
                <p className="font-semibold">{currentStage.label}</p>
              </div>
              <Badge variant="outline">{selectedStage}</Badge>
            </>
          )}
        </div>

        {/* تغيير المرحلة */}
        <div className="space-y-2">
          <label className="text-sm font-medium">تغيير المرحلة</label>
          <Select
            value={selectedStage}
            onValueChange={handleStageChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المرحلة" />
            </SelectTrigger>
            <SelectContent>
              {workflowStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  <div className="flex items-center gap-2">
                    <stage.icon className="h-4 w-4" />
                    {stage.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* إجراءات سريعة */}
        <div className="space-y-2">
          <label className="text-sm font-medium">إجراءات سريعة</label>
          <div className="flex flex-wrap gap-2">
            {quickActions
              .filter(action => action.show)
              .map((action) => (
                <Button
                  key={action.stage}
                  variant={action.variant}
                  size="sm"
                  onClick={() => {
                    setSelectedStage(action.stage);
                    updateWorkflowStage(action.stage);
                  }}
                  disabled={loading}
                >
                  {action.label}
                </Button>
              ))}
          </div>
        </div>

        {/* مؤشر SLA */}
        {request.sla_due_date && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="font-medium">موعد SLA:</span>
              <span>{new Date(request.sla_due_date).toLocaleString('ar-EG')}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
