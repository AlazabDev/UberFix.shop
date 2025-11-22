import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from "recharts";
import { Download, RefreshCw, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export function MaintenanceReportDashboard() {
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [completedRequests, setCompletedRequests] = useState<Array<{ id: string; service_type?: string; actual_cost?: number; created_at?: string; [key: string]: unknown }>>([]);
  const [archiveRequests, setArchiveRequests] = useState<Array<{ id: string; service_type?: string; actual_cost?: number; created_at?: string; [key: string]: unknown }>>([]);
  const [loading, setLoading] = useState(false);
  const _navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch completed requests from maintenance_requests
      const { data: completed, error: completedError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('status', 'Completed')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (completedError) throw completedError;

      // For now, only use completed requests (archived table doesn't exist yet)
      const archived: any[] = [];

      setCompletedRequests(completed || []);
      setArchiveRequests(archived || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const allCompleted = [...completedRequests, ...archiveRequests];
  const totalCompleted = allCompleted.length;
  const totalCost = allCompleted.reduce((sum, r) => sum + (Number(r.actual_cost) || 0), 0);
  const averageCost = totalCompleted > 0 ? totalCost / totalCompleted : 0;

  // Group by service type
  const serviceTypeData = allCompleted.reduce((acc: Array<{ name: string; value: number; totalCost: number }>, req) => {
    const serviceType = (req.service_type as string) || 'غير محدد';
    const existing = acc.find(item => item.name === serviceType);
    if (existing) {
      existing.value++;
      existing.totalCost += (Number(req.actual_cost) || 0);
    } else {
      acc.push({ 
        name: serviceType, 
        value: 1,
        totalCost: (Number(req.actual_cost) || 0)
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; totalCost: number }>);

  // Group by month for timeline
  const monthlyData = allCompleted.reduce((acc: Array<{ month: string; count: number; cost: number }>, req) => {
    const month = req.created_at ? format(new Date(req.created_at as string), 'yyyy-MM') : 'غير محدد';
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.count++;
      existing.cost += (Number(req.actual_cost) || 0);
    } else {
      acc.push({ 
        month, 
        count: 1,
        cost: (Number(req.actual_cost) || 0)
      });
    }
    return acc;
  }, [] as Array<{ month: string; count: number; cost: number }>).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>تقرير الصيانات المنتهية</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">تحليل شامل للصيانات المكتملة والمؤرشفة</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-2" />
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">من تاريخ</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">إلى تاريخ</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={fetchRequests}>
                <Calendar className="h-4 w-4 ml-2" />
                تطبيق
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">إجمالي الصيانات المنتهية</p>
            <p className="text-3xl font-bold text-success">{totalCompleted}</p>
            <p className="text-xs text-muted-foreground mt-1">
              الحالية: {completedRequests.length} | المؤرشفة: {archiveRequests.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">إجمالي التكلفة</p>
            <p className="text-3xl font-bold text-primary">{totalCost.toLocaleString('ar-EG')} جنيه</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">متوسط التكلفة</p>
            <p className="text-3xl font-bold text-primary">{Math.round(averageCost).toLocaleString('ar-EG')} جنيه</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">أنواع الخدمات</p>
            <p className="text-3xl font-bold text-primary">{serviceTypeData.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع الخدمات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>التكلفة حسب نوع الخدمة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Bar 
                  dataKey="totalCost" 
                  fill="hsl(var(--primary))"
                  name="التكلفة الإجمالية"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>الصيانات المنتهية عبر الزمن</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--success))" 
                strokeWidth={3}
                name="عدد الصيانات"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cost" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="التكلفة (جنيه)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Completed Requests Table */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">الكل ({totalCompleted})</TabsTrigger>
          <TabsTrigger value="current">الحالية ({completedRequests.length})</TabsTrigger>
          <TabsTrigger value="archive">المؤرشفة ({archiveRequests.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>جميع الصيانات المنتهية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">العنوان</th>
                      <th className="text-right py-3 px-4">الوصف</th>
                      <th className="text-right py-3 px-4">نوع الخدمة</th>
                      <th className="text-right py-3 px-4">التكلفة الفعلية</th>
                      <th className="text-right py-3 px-4">تاريخ الإنشاء</th>
                      <th className="text-right py-3 px-4">المصدر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCompleted.slice(0, 20).map((request) => (
                      <tr key={request.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{request.title}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                          {request.description}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{request.service_type || 'غير محدد'}</Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold text-success">
                          {request.actual_cost ? `${Number(request.actual_cost).toLocaleString('ar-EG')} جنيه` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(request.created_at), 'yyyy-MM-dd')}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={request.store_id ? 'secondary' : 'default'}>
                            {request.store_id ? 'أرشيف' : 'حالي'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>الصيانات المنتهية الحالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">العنوان</th>
                      <th className="text-right py-3 px-4">الموقع</th>
                      <th className="text-right py-3 px-4">نوع الخدمة</th>
                      <th className="text-right py-3 px-4">التكلفة</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{request.title}</td>
                        <td className="py-3 px-4">{request.location}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{request.service_type}</Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold text-success">
                          {request.actual_cost ? `${Number(request.actual_cost).toLocaleString('ar-EG')} جنيه` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(request.created_at), 'yyyy-MM-dd')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive">
          <Card>
            <CardHeader>
              <CardTitle>الصيانات المؤرشفة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">العنوان</th>
                      <th className="text-right py-3 px-4">الوصف</th>
                      <th className="text-right py-3 px-4">الأولوية</th>
                      <th className="text-right py-3 px-4">التكلفة</th>
                      <th className="text-right py-3 px-4">تاريخ الإكمال</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archiveRequests.map((request) => (
                      <tr key={request.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{request.title}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                          {request.description}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={
                            request.priority === 'high' ? 'destructive' :
                            request.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {request.priority === 'high' ? 'عالية' :
                             request.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold text-success">
                          {request.actual_cost ? `${Number(request.actual_cost).toLocaleString('ar-EG')} جنيه` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {request.completion_date ? format(new Date(request.completion_date), 'yyyy-MM-dd') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
