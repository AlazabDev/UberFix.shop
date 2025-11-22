import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Wrench, Calendar, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface PropertyLifecycleData {
  property: {
    id: string;
    name: string;
    created_at: string;
    status: string;
    type: string;
  };
  maintenanceRequests: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  timeline: Array<{
    date: string;
    event: string;
    type: string;
    description: string;
  }>;
}

export function PropertyLifecycleReport({ propertyId }: { propertyId?: string }) {
  const [data, setData] = useState<PropertyLifecycleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLifecycleData();
  }, [propertyId]);

  const fetchLifecycleData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات العقارات
      const { data: properties, error: propsError } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(propertyId ? 1 : 10);

      if (propsError) throw propsError;

      const lifecycleData = await Promise.all(
        (properties || []).map(async (property) => {
          // جلب طلبات الصيانة لكل عقار
          const { data: requests } = await supabase
            .from("maintenance_requests")
            .select("*")
            .eq("property_id", property.id);

          // حساب الإحصائيات
          const stats = {
            total: requests?.length || 0,
            pending: requests?.filter((r) => r.status === "Open" || r.status === "Waiting").length || 0,
            in_progress: requests?.filter((r) => r.status === "InProgress" || r.status === "Assigned").length || 0,
            completed: requests?.filter((r) => r.status === "Completed").length || 0,
            cancelled: requests?.filter((r) => r.status === "Cancelled" || r.status === "Rejected").length || 0,
          };

          // بناء الجدول الزمني
          const timeline: PropertyLifecycleData["timeline"] = [
            {
              date: property.created_at,
              event: "إنشاء العقار",
              type: "property",
              description: `تم إنشاء عقار ${property.name}`,
            },
          ];

          // إضافة أحداث الصيانة
          requests?.forEach((req) => {
            timeline.push({
              date: req.created_at,
              event: req.status === "Completed" ? "صيانة منجزة" : "طلب صيانة",
              type: req.status === "Completed" ? "completed" : req.status === "InProgress" ? "in_progress" : "pending",
              description: req.title,
            });
          });

          // ترتيب حسب التاريخ
          timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          return {
            property: {
              id: property.id,
              name: property.name,
              created_at: property.created_at,
              status: property.status,
              type: property.type,
            },
            maintenanceRequests: stats,
            timeline: timeline.slice(0, 10), // آخر 10 أحداث
          };
        })
      );

      setData(lifecycleData);
    } catch (error) {
      console.error("Error fetching lifecycle data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      in_progress: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      completed: "bg-green-500/10 text-green-700 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-700 border-red-500/20",
      property: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-700";
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "property":
        return <Building2 className="w-4 h-4" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "in_progress":
        return <Wrench className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">تقرير دورة حياة العقارات والصيانات</h2>
          <p className="text-muted-foreground mt-1">تتبع شامل لجميع الأحداث والإحصائيات</p>
        </div>
      </div>

      <Tabs defaultValue="0" className="w-full">
        <TabsList className="grid w-full grid-cols-auto gap-2 overflow-x-auto">
          {data.map((item, index) => (
            <TabsTrigger key={item.property.id} value={String(index)} className="min-w-[120px]">
              {item.property.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.map((item, index) => (
          <TabsContent key={item.property.id} value={String(index)} className="space-y-6">
            {/* معلومات العقار */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-primary" />
                  {item.property.name}
                </CardTitle>
                <CardDescription>
                  تم الإنشاء في {format(new Date(item.property.created_at), "dd MMMM yyyy", { locale: ar })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(item.property.status)}>
                    {item.property.status}
                  </Badge>
                  <Badge variant="outline">{item.property.type}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* إحصائيات الصيانة */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    الإجمالي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {item.maintenanceRequests.total}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    قيد الانتظار
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {item.maintenanceRequests.pending}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    قيد التنفيذ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {item.maintenanceRequests.in_progress}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    مكتملة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {item.maintenanceRequests.completed}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    ملغاة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {item.maintenanceRequests.cancelled}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الجدول الزمني */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  الجدول الزمني للأحداث
                </CardTitle>
                <CardDescription>آخر 10 أحداث مسجلة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {item.timeline.map((event, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                    >
                      <div className={`p-2 rounded-lg ${getStatusColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{event.event}</h4>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.date), "dd/MM/yyyy - HH:mm", { locale: ar })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
