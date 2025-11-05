import { useState } from "react";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, Calendar, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const AllRequests = () => {
  const { requests, loading } = useMaintenanceRequests();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const statusConfig: Record<string, { label: string; className: string }> = {
    Open: { label: "مفتوح", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    "In Progress": { label: "قيد التنفيذ", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    Completed: { label: "مكتمل", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    Cancelled: { label: "ملغي", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  };

  const priorityConfig: Record<string, { label: string; className: string }> = {
    low: { label: "منخفض", className: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
    medium: { label: "متوسط", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    high: { label: "عالي", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    urgent: { label: "عاجل", className: "bg-red-500/10 text-red-500 border-red-500/20" },
  };

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">كل طلبات الصيانة</h1>
          <p className="text-muted-foreground mt-2">
            متابعة ومراقبة جميع طلبات الصيانة في النظام
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2 w-fit">
          إجمالي الطلبات: {requests.length}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            تصفية وبحث
          </CardTitle>
          <CardDescription>
            استخدم الفلاتر للبحث عن طلبات محددة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن طلب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="Open">مفتوح</SelectItem>
                <SelectItem value="In Progress">قيد التنفيذ</SelectItem>
                <SelectItem value="Completed">مكتمل</SelectItem>
                <SelectItem value="Cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأولويات</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="urgent">عاجل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات ({filteredRequests.length})</CardTitle>
          <CardDescription>
            جميع طلبات الصيانة المسجلة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              جاري تحميل الطلبات...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد طلبات تطابق معايير البحث
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الأولوية</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {request.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {request.client_name || "غير محدد"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {request.location || "غير محدد"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusConfig[request.status]?.className || ""}
                        >
                          {statusConfig[request.status]?.label || request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.priority && (
                          <Badge
                            variant="outline"
                            className={priorityConfig[request.priority]?.className || ""}
                          >
                            {priorityConfig[request.priority]?.label || request.priority}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ar })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/requests/${request.id}`)}
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllRequests;
