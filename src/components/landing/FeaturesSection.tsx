import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  MapPin, 
  Bell, 
  Calendar, 
  FileText, 
  BarChart3,
  Users,
  Shield,
  Smartphone,
  Clock,
  CheckCircle,
  Zap
} from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Settings,
      title: "إدارة الصيانة",
      description: "نظام شامل لإدارة جميع أنواع طلبات الصيانة مع تتبع حالة كل طلب",
      badge: "أساسي"
    },
    {
      icon: MapPin,
      title: "تحديد المواقع",
      description: "خدمة تحديد المواقع الذكية للعثور على أقرب فني متاح",
      badge: "ذكي"
    },
    {
      icon: Bell,
      title: "الإشعارات الفورية",
      description: "تنبيهات لحظية عن حالة الطلبات والمواعيد المهمة",
      badge: "فوري"
    },
    {
      icon: Calendar,
      title: "إدارة المواعيد",
      description: "جدولة وتنظيم المواعيد مع الفنيين والعملاء بكفاءة",
      badge: "منظم"
    },
    {
      icon: FileText,
      title: "التقارير والفواتير",
      description: "تقارير تفصيلية وفواتير إلكترونية لجميع الخدمات",
      badge: "شامل"
    },
    {
      icon: BarChart3,
      title: "تحليل الأداء",
      description: "لوحة تحكم تحليلية لمراقبة الأداء واتخاذ القرارات",
      badge: "تحليلي"
    }
  ];

  const additionalFeatures = [
    { icon: Users, text: "إدارة متعددة المستخدمين" },
    { icon: Shield, text: "أمان وحماية البيانات" },
    { icon: Smartphone, text: "تطبيق موبايل سهل الاستخدام" },
    { icon: Clock, text: "عمل على مدار الساعة" },
    { icon: CheckCircle, text: "ضمان جودة الخدمة" },
    { icon: Zap, text: "سرعة في الاستجابة" }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Settings className="h-3 w-3 mr-1" />
            الميزات الأساسية
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            إدارة الصيانة
            <span className="block bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
              لأعمال متعددة الفروع
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            نظام متكامل يوفر جميع الأدوات اللازمة لإدارة عمليات الصيانة والعقارات 
            بطريقة احترافية وفعالة
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              إدارة صيانة 
              <span className="text-primary">العقارات التجارية</span>
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              حلول متخصصة لإدارة صيانة العقارات التجارية والسكنية مع دعم كامل لجميع أنواع الصيانة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-background rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
