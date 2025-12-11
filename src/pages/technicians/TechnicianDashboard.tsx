import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TechnicianPerformance, TechnicianLevelData, TechnicianBadge, TechnicianTask } from "@/types/technician";
import { Trophy, Star, Award, CheckCircle, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { getTechnicianLevelInfo } from "@/constants/technicianConstants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TechnicianDashboard() {
  const [technicianId, setTechnicianId] = useState<string | null>(null);
  const [technicianStatus, setTechnicianStatus] = useState<string | null>(null);
  const [performance, setPerformance] = useState<TechnicianPerformance | null>(null);
  const [level, setLevel] = useState<TechnicianLevelData | null>(null);
  const [badges, setBadges] = useState<TechnicianBadge[]>([]);
  const [tasks, setTasks] = useState<TechnicianTask[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTechnicianId();
  }, []);

  // جلب technician_id الصحيح من خلال technician_profiles
  const fetchTechnicianId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // أولاً: البحث عن technician_profile للمستخدم
      const { data: profile, error: profileError } = await supabase
        .from('technician_profiles')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        // لا يوجد ملف تسجيل - توجيه للتسجيل
        setTechnicianStatus('not_registered');
        setLoading(false);
        return;
      }

      if (profile.status !== 'approved') {
        // الطلب لم تتم الموافقة عليه بعد
        setTechnicianStatus(profile.status);
        setLoading(false);
        return;
      }

      // ثانياً: جلب technician_id من جدول technicians
      const { data: technician, error: techError } = await supabase
        .from('technicians')
        .select('id')
        .eq('technician_profile_id', profile.id)
        .maybeSingle();

      if (techError) throw techError;

      if (!technician) {
        setTechnicianStatus('pending_activation');
        setLoading(false);
        return;
      }

      setTechnicianId(technician.id);
      setTechnicianStatus('active');
      
      // الآن جلب بيانات Dashboard
      await fetchDashboardData(technician.id);
    } catch (error) {
      console.error("Error fetching technician ID:", error);
      setLoading(false);
    }
  };

  const fetchDashboardData = async (techId: string) => {
    try {
      // Fetch performance
      const { data: perfData } = await supabase
        .from("technician_performance")
        .select("*")
        .eq("technician_id", techId)
        .maybeSingle();

      setPerformance(perfData);

      // Fetch level
      const { data: levelData } = await supabase
        .from("technician_levels")
        .select("*")
        .eq("technician_id", techId)
        .maybeSingle();

      setLevel(levelData as any);

      // Fetch badges
      const { data: badgesData } = await supabase
        .from("technician_badges")
        .select("*")
        .eq("technician_id", techId)
        .order("awarded_at", { ascending: false });

      setBadges(badgesData as any || []);

      // Fetch recent tasks
      const { data: tasksData } = await supabase
        .from("technician_tasks")
        .select("*")
        .eq("technician_id", techId)
        .order("created_at", { ascending: false })
        .limit(10);

      setTasks(tasksData as any || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const levelInfo = getTechnicianLevelInfo(level?.current_level || 'technician');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // عرض رسائل حسب حالة الفني
  if (technicianStatus === 'not_registered') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-2">لم يتم التسجيل بعد</h2>
            <p className="text-muted-foreground mb-6">
              يجب التسجيل كفني أولاً للوصول إلى لوحة التحكم
            </p>
            <Button onClick={() => navigate("/technicians/registration/wizard")} size="lg" className="w-full">
              التسجيل الآن
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (technicianStatus === 'draft') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold mb-2">استكمل التسجيل</h2>
            <p className="text-muted-foreground mb-6">
              طلب التسجيل محفوظ كمسودة. يرجى استكمال التسجيل وإرساله للمراجعة.
            </p>
            <Button onClick={() => navigate("/technicians/registration/wizard")} size="lg" className="w-full">
              استكمال التسجيل
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (technicianStatus === 'pending_review') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-yellow-500">
          <CardContent className="pt-8 pb-6 text-center">
            <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-500 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">قيد المراجعة</h2>
            <p className="text-muted-foreground mb-4">
              طلب التسجيل قيد المراجعة من قبل فريقنا. سيتم إشعارك عند الموافقة.
            </p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>الخطوة التالية</AlertTitle>
              <AlertDescription>
                يمكنك التحقق من هويتك الآن لتسريع عملية الموافقة
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/technicians/verification")} variant="outline" size="lg" className="w-full mt-4">
              التحقق من الهوية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (technicianStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500">
          <CardContent className="pt-8 pb-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2">تم رفض الطلب</h2>
            <p className="text-muted-foreground mb-6">
              للأسف، تم رفض طلب التسجيل. يمكنك التواصل مع الدعم لمعرفة السبب.
            </p>
            <Button onClick={() => navigate("/support")} variant="outline" size="lg" className="w-full">
              التواصل مع الدعم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">لوحة تحكم الفني</h1>
          <p className="text-muted-foreground">مرحباً بك في رحلتك المهنية</p>
        </div>

        {/* Level Card */}
        <Card className={`mb-8 border-2 bg-gradient-to-r ${levelInfo.color} text-white`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">
                  {levelInfo.icon} {levelInfo.label}
                </CardTitle>
                <CardDescription className="text-white/80">
                  المستوى الحالي
                </CardDescription>
              </div>
              <div className="text-6xl">{performance?.total_points || 0}</div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المهام المكتملة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{performance?.completed_tasks || 0}</div>
              <p className="text-xs text-muted-foreground">
                من أصل {performance?.total_tasks || 0} مهمة
              </p>
              <Progress 
                value={(performance?.completed_tasks || 0) / (performance?.total_tasks || 1) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">التقييم</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{performance?.average_rating?.toFixed(1) || "0.0"}</div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= (performance?.average_rating || 0)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">النقاط</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{performance?.total_points || 0}</div>
              <p className="text-xs text-muted-foreground">
                عدد مرات التميز: {performance?.excellence_count || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                الشارات والإنجازات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {badges.map((badge) => (
                  <Badge key={badge.id} className="p-3 text-base" variant="outline">
                    {badge.badge_type === "crown_annual" && "👑"}
                    {badge.badge_type === "gold_monthly" && "🏆"}
                    {badge.badge_type === "legacy" && "⭐"}
                    {" "}
                    {badge.badge_title}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">المهام الحالية</TabsTrigger>
            <TabsTrigger value="completed">المهام المكتملة</TabsTrigger>
            <TabsTrigger value="pending">المهام المعلقة</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {tasks.filter(t => t.status === 'in_progress').map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{task.task_title}</CardTitle>
                    <Badge className="bg-blue-600">جاري العمل</Badge>
                  </div>
                  <CardDescription>{task.task_description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {task.estimated_duration} دقيقة تقريباً
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {tasks.filter(t => t.status === 'completed').map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{task.task_title}</CardTitle>
                    <Badge className="bg-green-600">مكتملة</Badge>
                  </div>
                  <CardDescription>{task.task_description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {tasks.filter(t => t.status === 'pending').map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{task.task_title}</CardTitle>
                    <Badge variant="outline">معلقة</Badge>
                  </div>
                  <CardDescription>{task.task_description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
