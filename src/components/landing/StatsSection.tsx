import { Card } from "@/components/ui/card";
import { Clock, TrendingUp, Users, CheckCircle } from "lucide-react";

export const StatsSection = () => {
  const stats = [
    {
      icon: Clock,
      value: "24/7",
      label: "خدمة مستمرة",
      description: "دعم فني متواصل"
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "معدل الرضا",
      description: "رضا العملاء"
    },
    {
      icon: Users,
      value: "+1000",
      label: "عميل نشط",
      description: "يثقون بنا"
    },
    {
      icon: CheckCircle,
      value: "+5000",
      label: "طلب مكتمل",
      description: "نجاح منجز"
    }
  ];

  return (
    <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            نتحكم في جميع عمليات الصيانة
            <span className="block text-primary-foreground/80">بكفاءة وسهولة</span>
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            أرقام تتحدث عن نفسها تعكس التزامنا بتقديم أفضل الخدمات
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-center p-8 hover:bg-white/15 transition-all duration-300 group">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-4xl lg:text-5xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-primary-foreground">
                  {stat.label}
                </div>
                <div className="text-sm text-primary-foreground/70">
                  {stat.description}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-primary-foreground/60 text-sm max-w-3xl mx-auto leading-relaxed">
            انضم إلى آلاف العملاء الذين يثقون بنظامنا المتطور لإدارة عمليات الصيانة والعقارات
            بكفاءة عالية وسرعة في الاستجابة
          </p>
        </div>
      </div>
    </section>
  );
};
