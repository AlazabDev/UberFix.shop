import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  List,
  PlusCircle,
  BarChart3,
  Package,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FolderKanban
} from "lucide-react";

export default function MaintenanceOverview() {
  const stats = [
    { label: "إجمالي الطلبات", value: "150", color: "bg-primary", icon: FolderKanban },
    { label: "الطلبات المعينة", value: "45", color: "bg-blue-500", icon: Clock },
    { label: "الطلبات المكتملة", value: "98", color: "bg-green-500", icon: CheckCircle2 },
    { label: "الطلبات الملغية", value: "7", color: "bg-red-500", icon: XCircle },
  ];

  const quickActions = [
    { label: "إضافة طلب", icon: PlusCircle, link: "/maintenance/create", color: "bg-primary" },
    { label: "قائمة الطلبات", icon: List, link: "/maintenance/list", color: "bg-blue-500" },
    { label: "التقارير", icon: BarChart3, link: "/reports/maintenance", color: "bg-purple-500" },
    { label: "المواد", icon: Package, link: "/materials", color: "bg-orange-500" },
    { label: "المستخدمون", icon: Users, link: "/users", color: "bg-green-500" },
    { label: "الفواتير", icon: FileText, link: "/invoices", color: "bg-yellow-500" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">نظرة عامة على الصيانة</h1>
        <p className="text-muted-foreground">لوحة التحكم الرئيسية لإدارة طلبات الصيانة</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">الإجراءات السريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-lg">{action.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-4">النشاط الأخير</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <p className="text-sm">تم اكتمال طلب الصيانة #MR-123456</p>
              </div>
              <p className="text-xs text-muted-foreground">منذ 5 دقائق</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-sm">تم تعيين فني لطلب #MR-123457</p>
              </div>
              <p className="text-xs text-muted-foreground">منذ 15 دقيقة</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <p className="text-sm">طلب صيانة جديد #MR-123458</p>
              </div>
              <p className="text-xs text-muted-foreground">منذ 30 دقيقة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
