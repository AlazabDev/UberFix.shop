import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Wrench, Cog } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";

export default function RoleSelection() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <LandingHeader />

      {/* Main Content */}
      <div className="flex-1">
        {/* Page Title */}
        <div className="text-center pt-8 sm:pt-12 pb-6 sm:pb-8 px-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm">أختر مسارك الوصول الخاص إلي</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">اختيار نوع الحساب للدخول</h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">يرجى اختيار نوع الحساب المناسب للوصول إلى مميزات المنصة والتطبيقات</p>
        </div>

      {/* Role Cards */}
      <div className="container max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl">الإدارة</CardTitle>
              <CardDescription className="text-base">
                للمدراء والوصول إلى لوحة التحكم الكاملة وإدارة جميع جوانب المنظومة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li>• إدارة المستخدمين والتصريحات</li>
                <li>• إعدادات المنظومة الشاملة</li>
                <li>• التقارير والإشراف المتقدمة</li>
              </ul>
              <Link to="/login?role=admin" className="block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">تسجيل الدخول كـ الإدارة</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Vendor/Technician Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Wrench className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">الفنيون</CardTitle>
              <CardDescription className="text-base">
                للفنيون والوصول إلى أدوات العمل وإدارة المهام والمواعيد وتوثيق الصيانة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li>• إدارة المهام والمواعيد</li>
                <li>• نتائج المشاريع الموكلة</li>
                <li>• التقارير والإجابيات</li>
              </ul>
              <Link to="/login?role=vendor" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">تسجيل الدخول كـ الفنيون</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Customer Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">العملاء</CardTitle>
              <CardDescription className="text-base">
                للعملاء الذين يريدون إلى الوصول إلى خدماتنا ومعاملاتهم وطلباتهم الخاصة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li>• عرض الطلبات والمواعيد</li>
                <li>• تتبع حالة الطلبات</li>
                <li>• إدارة الملف الشخصي</li>
              </ul>
              <Link to="/login?role=customer" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">تسجيل الدخول كـ العملاء</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* System Features */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">مزايا النظام</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">الأمان والحماية</h4>
              <p className="text-sm text-muted-foreground">حماية متقدمة لبيانات المؤسسة المندمجة</p>
            </Card>

            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">إدارة الموظفين</h4>
              <p className="text-sm text-muted-foreground">أدوات متقدمة لإدارة الموارد البشرية</p>
            </Card>

            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">إدارة العملاء</h4>
              <p className="text-sm text-muted-foreground">نظام شامل لإدارة العملاء والعلاقات</p>
            </Card>

            <Card className="text-center p-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Cog className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-bold mb-2">التكامل الكامل</h4>
              <p className="text-sm text-muted-foreground">ريط جميع أنشطة المؤسسة في مكان واحد</p>
            </Card>
          </div>
        </div>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
