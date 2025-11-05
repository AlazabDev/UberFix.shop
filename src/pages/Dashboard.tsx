import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentRequests } from "@/components/dashboard/RecentRequests";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MaintenanceChart } from "@/components/dashboard/MaintenanceChart";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { useProjects } from "@/hooks/useProjects";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useMemo } from "react";
import { 
  Wrench, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp
} from "lucide-react";

const Dashboard = () => {
  const { requests } = useMaintenanceRequests();
  const { projects } = useProjects();
  const isMobile = useMediaQuery("(max-width: 768px)");

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
    activeVendors: 5,
  }), [requests, projects]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2 text-center sm:text-right">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          مرحباً بك في لوحة التحكم 📊
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          نظرة عامة على الميزانية الشهرية وإحصائيات طلبات الصيانة
        </p>
      </div>

      {/* Stats Grid - مُحسنة للهواتف */}
      <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        <StatsCard
          title="الطلبات المعلقة"
          value={stats.pendingRequests.toString()}
          icon={Clock}
          iconColor="text-warning"
        />
        
        <StatsCard
          title="الطلبات المضافة اليوم"
          value={stats.todayRequests.toString()}
          subtitle="طلبات جديدة"
          icon={Wrench}
          iconColor="text-primary"
        />
        
        <StatsCard
          title="الطلبات المكتملة"
          value={stats.completedRequests.toString()}
          subtitle={`${stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}%`}
          icon={CheckCircle}
          iconColor="text-success"
        />
        
        <StatsCard
          title="إجمالي طلبات الصيانة"
          value={stats.totalRequests.toString()}
          icon={TrendingUp}
          iconColor="text-secondary"
        />
      </div>

      {/* Monthly Budget Overview - مُحسنة للهواتف */}
      <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
        <StatsCard
          title="الطلبات هذا الشهر"
          value={stats.thisMonthRequests.toString()}
          subtitle="طلبات الشهر الحالي"
          icon={Wrench}
          iconColor="text-primary"
          className="lg:col-span-1"
        />
        
        <StatsCard
          title="الميزانية المتبقية"
          value={`EGP ${(stats.totalBudget - stats.actualCost).toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-success"
          className="lg:col-span-1"
        />
        
        <StatsCard
          title="المبلغ المدفوع"
          value={`EGP ${stats.actualCost.toLocaleString()}`}
          icon={CheckCircle}
          iconColor="text-secondary"
          className="lg:col-span-1"
        />
        
        <StatsCard
          title="إجمالي الميزانية"
          value={`EGP ${stats.totalBudget.toLocaleString()}`}
          subtitle={`استخدام ${stats.totalBudget > 0 ? Math.round((stats.actualCost / stats.totalBudget) * 100) : 0}%`}
          icon={TrendingUp}
          iconColor="text-primary"
          className="lg:col-span-1"
        />
      </div>

      {/* Charts */}
      <MaintenanceChart />

      {/* Recent Activity & Quick Actions - مُحسنة للهواتف */}
      <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1 space-y-2' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <RecentRequests />
        <QuickActions />
      </div>

      {/* Performance Stats - مُحسنة للهواتف */}
      <div className={`grid gap-3 sm:gap-4 lg:gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
        <div className="text-center p-6 bg-card rounded-lg border card-elegant">
          <div className="text-3xl font-bold text-primary">{stats.activeVendors}</div>
          <div className="text-sm text-muted-foreground">الموردون النشطون</div>
        </div>
        
        <div className="text-center p-6 bg-card rounded-lg border card-elegant">
          <div className="text-3xl font-bold text-muted-foreground">
            {stats.totalRequests > 0 ? Math.round((stats.totalRequests - stats.completedRequests - stats.pendingRequests) / stats.totalRequests * 100) : 0}%
          </div>
          <div className="text-sm text-muted-foreground">نسبة الطلبات الملغاة</div>
        </div>
        
        <div className="text-center p-6 bg-card rounded-lg border card-elegant">
          <div className="text-3xl font-bold text-primary">
            {stats.totalRequests > 0 ? Math.round((stats.totalRequests - stats.completedRequests - stats.pendingRequests) / stats.totalRequests * 100) : 0}%
          </div>
          <div className="text-sm text-muted-foreground">نسبة الطلبات قيد التنفيذ</div>
        </div>
        
        <div className="text-center p-6 bg-card rounded-lg border card-elegant">
          <div className="text-3xl font-bold text-success">
            {stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}%
          </div>
          <div className="text-sm text-muted-foreground">نسبة الطلبات المكتملة</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;