import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Server,
  Database,
  Wifi,
  Shield,
  Download,
  RefreshCw
} from "lucide-react";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { useProjects } from "@/hooks/useProjects";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  totalRequests: number;
  successRate: number;
}

interface DatabaseMetrics {
  connections: number;
  queries: number;
  storage: number;
  backups: number;
}

export default function ProductionReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { requests } = useMaintenanceRequests();
  const { projects } = useProjects();
  
  const stats = useMemo(() => ({
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    todayRequests: requests.filter(r => {
      const today = new Date().toDateString();
      return new Date(r.created_at).toDateString() === today;
    }).length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
    totalRequests: requests.length,
    thisMonthRequests: requests.filter(r => {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const requestDate = new Date(r.created_at);
      return requestDate.getMonth() === thisMonth && requestDate.getFullYear() === thisYear;
    }).length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    actualCost: projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0),
    activeProjects: projects.filter(p => p.status === 'planning' || p.status === 'design').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
  }), [requests, projects]);
  
  // System metrics simulation (replace with real metrics from your monitoring)
  const [systemMetrics] = useState<SystemMetrics>({
    uptime: 99.8,
    responseTime: 245,
    errorRate: 0.2,
    activeUsers: 12,
    totalRequests: 1547,
    successRate: 99.8
  });

  const [dbMetrics] = useState<DatabaseMetrics>({
    connections: 8,
    queries: 2341,
    storage: 78.5,
    backups: 5
  });

  // Performance data for charts
  const performanceData = [
    { time: '00:00', requests: 45, errors: 0, responseTime: 200 },
    { time: '04:00', requests: 23, errors: 1, responseTime: 180 },
    { time: '08:00', requests: 89, errors: 0, responseTime: 220 },
    { time: '12:00', requests: 156, errors: 2, responseTime: 250 },
    { time: '16:00', requests: 234, errors: 1, responseTime: 280 },
    { time: '20:00', requests: 198, errors: 0, responseTime: 240 },
  ];

  const statusData = [
    { name: 'نشط', value: stats.pendingRequests, color: '#10b981' },
    { name: 'مكتمل', value: stats.completedRequests, color: '#3b82f6' },
    { name: 'في الانتظار', value: stats.todayRequests, color: '#f59e0b' },
  ];

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const downloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      systemMetrics,
      dbMetrics,
      applicationStats: stats,
      performanceData,
      statusData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">تقرير حالة الإنتاج</h1>
          <p className="text-muted-foreground">
            آخر تحديث: {lastUpdated.toLocaleString('ar-EG')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  تحديث
                </Button>
                <Button 
                  onClick={downloadReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  تحميل التقرير
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="database">قاعدة البيانات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل التشغيل</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{systemMetrics.uptime}%</div>
                <div className="mt-2">
                  <Progress value={systemMetrics.uptime} className="h-2" />
                </div>
                <Badge variant="secondary" className="mt-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  نشط
                </Badge>
              </CardContent>
            </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">زمن الاستجابة</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{systemMetrics.responseTime}ms</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        متوسط آخر 24 ساعة
                      </p>
                      <Badge variant={systemMetrics.responseTime < 300 ? "secondary" : "destructive"} className="mt-2">
                        {systemMetrics.responseTime < 300 ? "جيد" : "بطيء"}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{systemMetrics.activeUsers}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        متصل الآن
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8% من الأمس
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">معدل الأخطاء</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{systemMetrics.errorRate}%</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        آخر 24 ساعة
                      </p>
                      <Badge variant={systemMetrics.errorRate < 1 ? "secondary" : "destructive"} className="mt-2">
                        {systemMetrics.errorRate < 1 ? "منخفض" : "مرتفع"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Application Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">طلبات الصيانة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalRequests}</div>
                      <div className="text-xs text-muted-foreground">إجمالي الطلبات</div>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>معلقة: {stats.pendingRequests}</span>
                          <span>مكتملة: {stats.completedRequests}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeProjects}</div>
                      <div className="text-xs text-muted-foreground">مشروع نشط</div>
                      <div className="mt-2">
                        <Badge variant="outline">
                          {stats.completedProjects} مكتمل
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">الميزانية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalBudget.toLocaleString('ar-EG')} ج.م
                      </div>
                      <div className="text-xs text-muted-foreground">إجمالي الميزانية</div>
                      <div className="mt-2">
                        <div className="text-xs">
                          مُنفق: {stats.actualCost.toLocaleString('ar-EG')} ج.م
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">هذا الشهر</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.thisMonthRequests}</div>
                      <div className="text-xs text-muted-foreground">طلب جديد</div>
                      <div className="mt-2">
                        <Badge variant="secondary">
                          اليوم: {stats.todayRequests}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>توزيع حالة الطلبات</CardTitle>
                    <CardDescription>
                      توزيع طلبات الصيانة حسب الحالة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>أداء النظام خلال 24 ساعة</CardTitle>
                    <CardDescription>
                      مراقبة الطلبات والأخطاء وزمن الاستجابة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="requests" stroke="#3b82f6" name="الطلبات" />
                          <Line type="monotone" dataKey="responseTime" stroke="#10b981" name="زمن الاستجابة (ms)" />
                          <Line type="monotone" dataKey="errors" stroke="#ef4444" name="الأخطاء" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="database" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">الاتصالات النشطة</CardTitle>
                      <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dbMetrics.connections}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        من أصل 100 اتصال
                      </p>
                      <Progress value={(dbMetrics.connections / 100) * 100} className="mt-2 h-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">الاستعلامات</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dbMetrics.queries}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        آخر ساعة
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        متوسط: 39 استعلام/دقيقة
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">التخزين المستخدم</CardTitle>
                      <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dbMetrics.storage}%</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        من المساحة الإجمالية
                      </p>
                      <Progress value={dbMetrics.storage} className="mt-2 h-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">النسخ الاحتياطية</CardTitle>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dbMetrics.backups}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        آخر 7 أيام
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        آخر نسخة: اليوم
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        حالة الأمان
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">شهادة SSL</span>
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          نشطة
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">جدار الحماية</span>
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          نشط
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">التشفير</span>
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          AES-256
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">المصادقة الثنائية</span>
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          متاحة
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wifi className="h-5 w-5" />
                        حالة الشبكة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">زمن الاستجابة</span>
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          جيد
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">سرعة التحميل</span>
                        <Badge variant="secondary">98%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">الاتصال CDN</span>
                        <Badge variant="secondary">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          متصل
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
    </div>
  );
}