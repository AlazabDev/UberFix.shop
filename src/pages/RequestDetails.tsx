import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, FileText, Settings, Package, CheckSquare, FileBarChart, Archive, AlertCircle } from "lucide-react";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { MaintenanceRequestDetails } from "@/components/maintenance/MaintenanceRequestDetails";
import { RequestLifecycleTracker } from "@/components/maintenance/RequestLifecycleTracker";
import { RequestWorkflowControls } from "@/components/maintenance/RequestWorkflowControls";
import { WorkflowDiagram } from "@/components/workflow/WorkflowDiagram";
import { WorkflowTimeline } from "@/components/requests/WorkflowTimeline";
import { ApprovalManager } from "@/components/workflow/ApprovalManager";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, loading, updateRequest } = useMaintenanceRequests();
  const [request, setRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id && requests.length > 0) {
      const found = requests.find(r => r.id === id);
      if (found) {
        setRequest(found);
      }
    }
  }, [id, requests]);

  const handleArchive = async () => {
    if (!request) return;
    
    try {
      await updateRequest(request.id, {
        archived_at: new Date().toISOString(),
        workflow_stage: 'closed'
      });
      
      toast.success('تم أرشفة الطلب بنجاح');
      navigate('/requests');
    } catch (error) {
      toast.error('فشل في أرشفة الطلب');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">لم يتم العثور على الطلب</p>
          <Button onClick={() => navigate('/requests')} className="mt-4">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة إلى الطلبات
          </Button>
        </Card>
      </div>
    );
  }

  const isArchived = !!request.archived_at;
  const canArchive = ['completed', 'cancelled', 'closed'].includes(request.workflow_stage || request.status);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header with Back Button and Archive */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/requests')}
          className="gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للطلبات
        </Button>
        
        <div className="flex items-center gap-2">
          {isArchived && (
            <Badge variant="secondary" className="gap-1">
              <Archive className="h-3 w-3" />
              مؤرشف
            </Badge>
          )}
          {canArchive && !isArchived && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleArchive}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              أرشفة الطلب
            </Button>
          )}
        </div>
      </div>

      {/* Archived Alert */}
      {isArchived && (
        <Alert>
          <Archive className="h-4 w-4" />
          <AlertDescription>
            تم أرشفة هذا الطلب في {new Date(request.archived_at).toLocaleDateString('ar-SA')}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 gap-1">
          <TabsTrigger value="overview" className="gap-1 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger value="lifecycle" className="gap-1 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">دورة الحياة</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="gap-1 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">سير العمل</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-1 text-xs sm:text-sm">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">المواد</span>
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-1 text-xs sm:text-sm">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">الموافقات</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1 text-xs sm:text-sm">
            <FileBarChart className="h-4 w-4" />
            <span className="hidden sm:inline">التقارير</span>
          </TabsTrigger>
          <TabsTrigger value="controls" className="gap-1 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">التحكم</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <MaintenanceRequestDetails request={request} />
            </div>
            <div>
              <Card className="p-6">
                <WorkflowTimeline 
                  currentStage={request.workflow_stage || 'submitted'} 
                />
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Lifecycle Tab */}
        <TabsContent value="lifecycle" className="space-y-4">
          <RequestLifecycleTracker 
            requestId={request.id}
            requestStatus={request.workflow_stage || request.status}
            requestTitle={request.title}
          />
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <WorkflowDiagram 
                currentStage={request.workflow_stage || request.status}
                requestData={request}
              />
            </div>
            <div>
              <RequestWorkflowControls request={request} />
            </div>
          </div>
        </TabsContent>

        {/* Materials Tab - Coming Soon */}
        <TabsContent value="materials" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">إدارة المواد</h3>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                نظام طلبات المواد قيد التطوير حالياً
              </AlertDescription>
            </Alert>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ApprovalManager 
              requestId={request.id}
              approvalType="request"
            />
            <ApprovalManager 
              requestId={request.id}
              approvalType="materials"
            />
            <ApprovalManager 
              requestId={request.id}
              approvalType="completion"
            />
            <ApprovalManager 
              requestId={request.id}
              approvalType="billing"
            />
          </div>
        </TabsContent>

        {/* Reports Tab - Coming Soon */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">التقارير</h3>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                نظام إنشاء التقارير قيد التطوير حالياً
              </AlertDescription>
            </Alert>
          </Card>
        </TabsContent>

        {/* Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RequestWorkflowControls request={request} />
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">إجراءات إضافية</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  طباعة التقرير
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Package className="h-4 w-4" />
                  تصدير البيانات
                </Button>
                {canArchive && !isArchived && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={handleArchive}
                  >
                    <Archive className="h-4 w-4" />
                    أرشفة الطلب
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
