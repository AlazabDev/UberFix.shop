import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { 
  TrendingUp,
  AlertTriangle, 
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  Users
} from "lucide-react";
import { useMemo } from "react";

export function MaintenanceStats() {
  const { requests, loading } = useMaintenanceRequests();

  const stats = useMemo(() => {
    if (!requests || requests.length === 0) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        highPriority: 0,
        totalCost: 0,
        avgCost: 0,
        thisMonth: 0,
        thisWeek: 0,
        completionRate: 0,
        avgRating: 0
      };
    }

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const pending = requests.filter(r => r.status === 'pending').length;
    const inProgress = requests.filter(r => r.status === 'in_progress').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const cancelled = requests.filter(r => r.status === 'cancelled').length;
    const highPriority = requests.filter(r => r.priority === 'high').length;

    const thisMonthRequests = requests.filter(r => {
      const date = new Date(r.created_at);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).length;

    const thisWeekRequests = requests.filter(r => {
      const date = new Date(r.created_at);
      return date >= oneWeekAgo;
    }).length;

    const totalCost = requests.reduce((sum, r) => sum + (r.actual_cost || r.estimated_cost || 0), 0);
    const avgCost = totalCost / requests.length || 0;

    const completionRate = requests.length > 0 ? (completed / requests.length) * 100 : 0;

    const ratedRequests = requests.filter(r => r.rating && r.rating > 0);
    const avgRating = ratedRequests.length > 0 
      ? ratedRequests.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedRequests.length 
      : 0;

    return {
      total: requests.length,
      pending,
      inProgress,
      completed,
      cancelled,
      highPriority,
      totalCost,
      avgCost,
      thisMonth: thisMonthRequests,
      thisWeek: thisWeekRequests,
      completionRate,
      avgRating
    };
  }, [requests]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-elegant">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.thisWeek} طلبات هذا الأسبوع
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                <p className="text-3xl font-bold text-warning">{stats.pending}</p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  <p className="text-xs text-warning">{stats.highPriority} عالية الأولوية</p>
                </div>
              </div>
              <div className="p-3 bg-warning/10 rounded-full">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مكتملة</p>
                <p className="text-3xl font-bold text-success">{stats.completed}</p>
                <p className="text-xs text-success mt-1">
                  معدل الإنجاز {Math.round(stats.completionRate)}%
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">التكلفة الإجمالية</p>
                <p className="text-2xl font-bold text-secondary">
                  {stats.totalCost.toLocaleString()} ج.م
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  متوسط {Math.round(stats.avgCost)} ج.م
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              معدل الإنجاز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>الطلبات المكتملة</span>
                <span>{Math.round(stats.completionRate)}%</span>
              </div>
              <Progress 
                value={stats.completionRate} 
                className="h-2"
              />
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>مكتمل: {stats.completed}</div>
                <div>إجمالي: {stats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              النشاط الشهري
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">طلبات هذا الشهر</span>
                <Badge variant="secondary">{stats.thisMonth}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>الهدف الشهري</span>
                  <span>50 طلب</span>
                </div>
                <Progress 
                  value={(stats.thisMonth / 50) * 100} 
                  className="h-2"
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {stats.thisMonth >= 50 ? "تم تحقيق الهدف!" : `${50 - stats.thisMonth} طلب متبقي`}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              تقييم الخدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "لا يوجد"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.avgRating > 0 ? "متوسط التقييم" : "تقييمات"}
                </div>
              </div>
              <div className="flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(stats.avgRating)
                        ? "text-warning"
                        : "text-muted"
                    }`}
                  >
                    ⭐
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                من {requests?.filter(r => r.rating && r.rating > 0).length || 0} تقييم
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="text-lg">توزيع حالات الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/10">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <div className="text-sm text-warning">في الانتظار</div>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
              <div className="text-sm text-primary">قيد التنفيذ</div>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg border border-success/10">
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
              <div className="text-sm text-success">مكتملة</div>
            </div>
            <div className="text-center p-4 bg-destructive/5 rounded-lg border border-destructive/10">
              <div className="text-2xl font-bold text-destructive">{stats.cancelled}</div>
              <div className="text-sm text-destructive">ملغاة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}