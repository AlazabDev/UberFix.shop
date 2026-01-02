import { useState, useMemo } from "react";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  FolderOpen
} from "lucide-react";
import { MobileMaintenanceCard } from "./MobileMaintenanceCard";
import { MaintenanceStats } from "./MaintenanceStats";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FILTER_STATUS_OPTIONS, FILTER_PRIORITY_OPTIONS } from "@/constants/maintenanceStatusConstants";

interface MobileMaintenanceListProps {
  onNewRequestClick?: () => void;
}

export function MobileMaintenanceList({ onNewRequestClick }: MobileMaintenanceListProps) {
  const { requests, loading, error, refetch } = useMaintenanceRequests();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    return requests?.filter(request => {
      const matchesSearch = request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // استخدام قيم قاعدة البيانات الفعلية
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    }) || [];
  }, [requests, searchTerm, statusFilter, priorityFilter]);

  const getRequestsByStatus = (status: string) => {
    return filteredRequests.filter(request => request.status === status);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  // حساب الإحصائيات باستخدام قيم قاعدة البيانات
  const stats = useMemo(() => ({
    total: requests?.length || 0,
    open: requests?.filter(r => r.status === 'Open').length || 0,
    inProgress: requests?.filter(r => r.status === 'In Progress').length || 0,
    completed: requests?.filter(r => r.status === 'Completed').length || 0,
    overdue: 0
  }), [requests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-muted-foreground mb-4">{error?.toString()}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* إحصائيات سريعة */}
      <div className="lg:hidden">
        <MaintenanceStats stats={stats} />
      </div>

      {/* رأس القائمة */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">طلبات الصيانة</CardTitle>
            <Button onClick={onNewRequestClick} size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              طلب جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* فلاتر سريعة - استخدام قيم قاعدة البيانات */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_PRIORITY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(statusFilter !== "all" || priorityFilter !== "all" || searchTerm) && (
              <Button variant="outline" onClick={clearFilters} size="sm">
                مسح
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* علامات التبويب للحالات - استخدام قيم قاعدة البيانات */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger value="all" className="text-xs py-2 px-1">
            الكل
            <Badge variant="secondary" className="mr-1 text-[10px] px-1">
              {filteredRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="Open" className="text-xs py-2 px-1">
            <FolderOpen className="h-3 w-3 mr-1" />
            مفتوح
            <Badge variant="secondary" className="mr-1 text-[10px] px-1">
              {getRequestsByStatus('Open').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="In Progress" className="text-xs py-2 px-1">
            <RefreshCw className="h-3 w-3 mr-1" />
            جاري
            <Badge variant="secondary" className="mr-1 text-[10px] px-1">
              {getRequestsByStatus('In Progress').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="Completed" className="text-xs py-2 px-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            مكتمل
            <Badge variant="secondary" className="mr-1 text-[10px] px-1">
              {getRequestsByStatus('Completed').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="Cancelled" className="text-xs py-2 px-1">
            <XCircle className="h-3 w-3 mr-1" />
            ملغي
            <Badge variant="secondary" className="mr-1 text-[10px] px-1">
              {getRequestsByStatus('Cancelled').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
                <p className="text-muted-foreground mb-4">
                  لم يتم العثور على طلبات صيانة مطابقة للفلاتر المحددة
                </p>
                <Button onClick={onNewRequestClick} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء طلب جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <MobileMaintenanceCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        {['Open', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-3 mt-4">
            {getRequestsByStatus(status).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات في هذه الحالة</h3>
                </CardContent>
              </Card>
            ) : (
              getRequestsByStatus(status).map((request) => (
                <MobileMaintenanceCard key={request.id} request={request} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
