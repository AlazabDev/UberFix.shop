import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Activity, 
  TrendingUp, 
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { BarChart, DonutChart, LineChart } from "@tremor/react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ErrorLog {
  id: string;
  message: string;
  level: string;
  url: string | null;
  created_at: string | null;
  resolved_at: string | null;
  stack: string | null;
  count: number | null;
}

interface PerformanceMetric {
  metric_name: string;
  value: number;
  created_at: string;
}

interface AnalyticsEvent {
  event_name: string;
  event_category: string | null;
  created_at: string;
}

export default function MonitoringDashboard() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch error logs
      const { data: errorData } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Note: performance_metrics and analytics_events tables don't exist yet
      // Using mock data for now
      setErrors((errorData || []) as ErrorLog[]);
      setMetrics([]);
      setEvents([]);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate statistics
  const totalErrors = errors.length;
  const criticalErrors = errors.filter(e => e.level === 'critical').length;
  const resolvedErrors = errors.filter(e => e.resolved_at !== null).length;
  const unresolvedErrors = totalErrors - resolvedErrors;

  // Error severity distribution
  const severityData = [
    { name: 'معلوماتية', value: errors.filter(e => e.level === 'info').length, color: 'hsl(var(--info))' },
    { name: 'تحذير', value: errors.filter(e => e.level === 'warning').length, color: 'hsl(var(--warning))' },
    { name: 'خطأ', value: errors.filter(e => e.level === 'error').length, color: 'hsl(var(--destructive))' },
    { name: 'حرج', value: errors.filter(e => e.level === 'critical').length, color: 'hsl(220, 90%, 30%)' }
  ];

  // Performance metrics over time (mock data for now)
  const performanceData = [
    { hour: '08:00', LCP: 2500, FCP: 1200 },
    { hour: '10:00', LCP: 2300, FCP: 1100 },
    { hour: '12:00', LCP: 2700, FCP: 1300 },
    { hour: '14:00', LCP: 2400, FCP: 1150 },
    { hour: '16:00', LCP: 2600, FCP: 1250 },
  ];

  // Top events (mock data for now)
  const topEvents = [
    { name: 'عرض الصفحة الرئيسية', count: 1250 },
    { name: 'تسجيل دخول', count: 890 },
    { name: 'إنشاء طلب', count: 650 },
    { name: 'تحديث حالة', count: 430 },
    { name: 'تحميل ملف', count: 320 },
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info': return <Info className="h-4 w-4 text-info" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      critical: 'destructive',
      error: 'destructive',
      warning: 'default',
      info: 'secondary'
    };
    return <Badge variant={variants[severity] || 'default'}>{severity}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة مراقبة النظام</h1>
          <p className="text-muted-foreground">تتبع الأخطاء والأداء والتحليلات</p>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأخطاء</p>
                <p className="text-3xl font-bold">{totalErrors}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">أخطاء حرجة</p>
                <p className="text-3xl font-bold text-destructive">{criticalErrors}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تم الحل</p>
                <p className="text-3xl font-bold text-success">{resolvedErrors}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد المعالجة</p>
                <p className="text-3xl font-bold text-warning">{unresolvedErrors}</p>
              </div>
              <Activity className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع الأخطاء حسب الخطورة</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              className="h-[300px]"
              data={severityData}
              index="name"
              category="value"
              valueFormatter={(value) => value.toString()}
              colors={["cyan", "amber", "rose", "indigo"]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الأداء عبر الوقت</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              className="h-[300px]"
              data={performanceData}
              index="hour"
              categories={["LCP", "FCP"]}
              colors={["indigo", "emerald"]}
              valueFormatter={(value) => `${value} ms`}
              yAxisWidth={40}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>أهم الأحداث</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              className="h-[300px]"
              data={topEvents}
              index="name"
              categories={["count"]}
              colors={["indigo"]}
              valueFormatter={(value) => value.toString()}
              yAxisWidth={40}
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Tabs defaultValue="errors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="errors">
            <AlertCircle className="ml-2 h-4 w-4" />
            الأخطاء ({totalErrors})
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="ml-2 h-4 w-4" />
            الأداء ({metrics.length})
          </TabsTrigger>
          <TabsTrigger value="events">
            <Users className="ml-2 h-4 w-4" />
            الأحداث ({events.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="errors">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {errors.slice(0, 20).map((error) => (
                  <div 
                    key={error.id} 
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50"
                  >
                    {getSeverityIcon(error.level)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{error.message}</p>
                        {getSeverityBadge(error.level)}
                        {error.resolved_at && (
                          <Badge variant="outline" className="text-success">
                            <CheckCircle className="ml-1 h-3 w-3" />
                            تم الحل
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{error.stack || 'لا توجد تفاصيل'}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{error.url || 'غير محدد'}</span>
                        <span>{error.created_at ? format(new Date(error.created_at), 'yyyy-MM-dd HH:mm') : '-'}</span>
                        {error.count && error.count > 1 && (
                          <Badge variant="secondary">تكرر {error.count} مرة</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">المقياس</th>
                      <th className="text-right py-3 px-4">القيمة</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.length > 0 ? metrics.slice(0, 20).map((metric, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{metric.metric_name}</td>
                        <td className="py-3 px-4">
                          {metric.value.toFixed(2)} ms
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {format(new Date(metric.created_at), 'yyyy-MM-dd HH:mm')}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          لا توجد مقاييس أداء بعد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">الحدث</th>
                      <th className="text-right py-3 px-4">الفئة</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length > 0 ? events.map((event, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{event.event_name}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{event.event_category || 'عام'}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {format(new Date(event.created_at), 'yyyy-MM-dd HH:mm')}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          لا توجد أحداث بعد
                        </td>
                      </tr>
                    )}
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
