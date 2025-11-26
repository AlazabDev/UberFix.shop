import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Wallet, Star, Bell, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TechnicianSection = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Bell,
      title: "استلام طلبات لحظية",
      description: "احصل على إشعارات فورية بطلبات الصيانة القريبة منك"
    },
    {
      icon: Wallet,
      title: "محفظة مالية ذكية",
      description: "تتبع أرباحك وسحب أموالك بسهولة من خلال نظام مالي آمن"
    },
    {
      icon: Star,
      title: "تقييمات وبدلات",
      description: "احصل على تقييمات من العملاء وبدلات تشجيعية شهرية"
    },
    {
      icon: TrendingUp,
      title: "فرص نمو مستمرة",
      description: "وصول لشبكة واسعة من العملاء وزيادة دخلك الشهري"
    },
    {
      icon: Clock,
      title: "مرونة في العمل",
      description: "اختر مواعيدك ومناطق عملك حسب جدولك الخاص"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-block">
              للفنيين المحترفين
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            منصة الفنيين – احصل على شغل أكثر مع{" "}
            <span className="text-primary">UberFix</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            انضم لشبكة الفنيين المحترفين واحصل على طلبات صيانة مستمرة مع نظام دفع آمن وفوري
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-background/50 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Features List */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="border-2 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center text-foreground mb-8">
                لماذا تنضم لمنصة UberFix؟
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "استلام طلبات بشكل لحظي",
                  "محفظة مالية لحساب أرباحك",
                  "تقييمات عملاء وبدلات تشجيعية",
                  "دعم فني متواصل",
                  "تدريبات مجانية لتطوير مهاراتك",
                  "حوافز شهرية للمتميزين",
                  "نظام سهل للسحب المالي",
                  "مرونة كاملة في اختيار المواعيد"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={() => navigate("/technicians/register")}
            className="bg-gradient-primary hover:shadow-lg transition-all duration-300 text-lg px-8 py-6 h-auto"
          >
            الدخول إلى نظام الفنيين
            <Check className="mr-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            سجل الآن واحصل على فرصة للانضمام لشبكة UberFix من الفنيين المحترفين
          </p>
        </div>
      </div>
    </section>
  );
};
