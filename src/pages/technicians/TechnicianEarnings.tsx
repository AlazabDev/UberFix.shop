import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Calendar, Award } from 'lucide-react';
import { AreaChart } from '@tremor/react';

interface DailyStats {
  date: string;
  total_earnings: number;
  visits_completed: number;
  average_rating: number;
}

interface MonthlyBonus {
  month: string;
  commitment_bonus: number;
  quality_bonus: number;
  time_bonus: number;
  top_rated_bonus: number;
  super_pro_bonus: number;
  total_bonus: number;
  visits_completed: number;
  average_rating: number;
  status: string;
}

export default function TechnicianEarnings() {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [monthlyBonuses, setMonthlyBonuses] = useState<MonthlyBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarningsThisMonth, setTotalEarningsThisMonth] = useState(0);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get technician ID
      const { data: techData } = await supabase
        .from('technicians')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!techData) return;

      // Fetch daily stats (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: statsData } = await supabase
        .from('technician_daily_stats')
        .select('*')
        .eq('technician_id', techData.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      setDailyStats(statsData || []);

      // Calculate total earnings this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);

      const thisMonthStats = (statsData || []).filter(
        (stat) => new Date(stat.date) >= firstDayOfMonth
      );

      const total = thisMonthStats.reduce((sum, stat) => sum + parseFloat(stat.total_earnings.toString()), 0);
      setTotalEarningsThisMonth(total);

      // Fetch monthly bonuses
      const { data: bonusesData } = await supabase
        .from('technician_monthly_bonuses')
        .select('*')
        .eq('technician_id', techData.id)
        .order('month', { ascending: false })
        .limit(6);

      setMonthlyBonuses(bonusesData || []);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">الأرباح والإحصائيات</h1>
        <p className="text-muted-foreground">تتبع أرباحك ومكافآتك</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">أرباح هذا الشهر</span>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {totalEarningsThisMonth.toFixed(2)} جنيه
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">متوسط الأرباح اليومية</span>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {dailyStats.length > 0
              ? (totalEarningsThisMonth / dailyStats.length).toFixed(2)
              : '0.00'}{' '}
            جنيه
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">إجمالي الزيارات</span>
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {dailyStats.reduce((sum, stat) => sum + stat.visits_completed, 0)}
          </p>
        </Card>
      </div>

      {/* Earnings Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">تطور الأرباح (آخر 30 يوم)</h2>
        <AreaChart
          className="h-[300px]"
          data={dailyStats}
          index="date"
          categories={["total_earnings"]}
          colors={["emerald"]}
          valueFormatter={(value) => `${Number(value).toFixed(2)} جنيه`}
          yAxisWidth={40}
          customTooltip={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const [item] = payload;
            const date = new Date(item.payload.date).toLocaleDateString('ar-EG');

            return (
              <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
                <p className="font-medium">{date}</p>
                <p className="text-green-600">
                  الأرباح: {Number(item.value).toFixed(2)} جنيه
                </p>
                <p className="text-sm text-muted-foreground">
                  الزيارات: {item.payload.visits_completed}
                </p>
              </div>
            );
          }}
          dateFormatter={(value) => new Date(value).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
        />
      </Card>

      {/* Monthly Bonuses */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          المكافآت الشهرية
        </h2>

        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current">الشهر الحالي</TabsTrigger>
            <TabsTrigger value="history">السجل</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {monthlyBonuses.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">مكافأة الالتزام</p>
                    <p className="text-2xl font-bold text-green-600">
                      {monthlyBonuses[0].commitment_bonus.toFixed(2)} جنيه
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {monthlyBonuses[0].visits_completed} / 25 زيارة
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">مكافأة الجودة</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {monthlyBonuses[0].quality_bonus.toFixed(2)} جنيه
                    </p>
                    <p className="text-xs text-muted-foreground">
                      تقييم: {monthlyBonuses[0].average_rating.toFixed(1)} ⭐
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">مكافأة الوقت</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {monthlyBonuses[0].time_bonus.toFixed(2)} جنيه
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Top Rated</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {monthlyBonuses[0].top_rated_bonus.toFixed(2)} جنيه
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Super Pro</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {monthlyBonuses[0].super_pro_bonus.toFixed(2)} جنيه
                    </p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">الإجمالي</p>
                    <p className="text-2xl font-bold text-primary">
                      {monthlyBonuses[0].total_bonus.toFixed(2)} جنيه
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">الحالة:</span>{' '}
                    {monthlyBonuses[0].status === 'paid' ? (
                      <span className="text-green-600">مدفوعة ✓</span>
                    ) : monthlyBonuses[0].status === 'approved' ? (
                      <span className="text-blue-600">معتمدة</span>
                    ) : (
                      <span className="text-orange-600">قيد الحساب</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-3">
              {monthlyBonuses.slice(1).map((bonus) => (
                <div key={bonus.month} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(bonus.month).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bonus.visits_completed} زيارة • تقييم {bonus.average_rating.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-primary">{bonus.total_bonus.toFixed(2)} جنيه</p>
                    <p className="text-xs text-muted-foreground">
                      {bonus.status === 'paid' ? 'مدفوعة' : 'معتمدة'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
