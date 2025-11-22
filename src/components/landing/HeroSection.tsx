import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Wrench, Building2, Zap, Droplets, MapPin, Sparkles } from "lucide-react";
import { RotatingText } from "./RotatingText";
import { InteractiveMap } from "./InteractiveMap";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5bf2320_1px,transparent_1px),linear-gradient(to_bottom,#f5bf2320_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/20"></div>
        
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-float"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Top Badge */}
        <div className="flex justify-center mb-8 animate-float">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse-soft" />
            <span className="text-sm font-medium">نخدم أكثر من 8 مدن في جميع أنحاء مصر</span>
            <MapPin className="h-5 w-5 text-primary animate-pulse-soft" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Wrench className="h-3 w-3 mr-1" />
                خبراء الصيانة وتجهيز المحلات
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight min-h-[180px] lg:min-h-[240px]">
                <RotatingText
                  texts={[
                    "حلول شاملة للصيانة",
                    "خدمات صيانة متكاملة",
                    "خبراء الصيانة المتخصصة",
                    "صيانة احترافية متطورة"
                  ]}
                  interval={3500}
                />
                <span className="bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent block mt-2">
                  <RotatingText
                    texts={[
                      "وتجهيز المحلات التجارية",
                      "وتجهيز المتاجر بالكامل",
                      "للمحلات والمنشآت التجارية",
                      "وتأسيس المحلات الحديثة"
                    ]}
                    interval={3500}
                  />
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                <RotatingText
                  texts={[
                    "نوفر خدمات الصيانة الكاملة من كهرباء وسباكة وتكييف، بالإضافة إلى تجهيز المحلات التجارية بأعلى معايير الجودة والاحترافية",
                    "نقدم حلول متكاملة لصيانة وتجهيز المحلات التجارية بأحدث التقنيات ومعايير الجودة العالمية مع فريق متخصص محترف",
                    "خبراء في تأسيس وصيانة المحلات التجارية بجميع أنواعها، من الكهرباء والسباكة إلى التكييف والديكور الداخلي",
                    "شريكك الموثوق في تجهيز المحلات التجارية والمنشآت، نوفر خدمات صيانة شاملة متاحة على مدار الساعة"
                  ]}
                  interval={3500}
                />
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Zap, text: "أعمال الكهرباء" },
                { icon: Droplets, text: "السباكة وإصلاح التسريبات" },
                { icon: Wrench, text: "تركيب وصيانة المكيفات" },
                { icon: Building2, text: "تجهيز المحلات التجارية" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group" onClick={() => window.location.href = '/role-selection'}>
                اطلب خدمة الآن
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="group" onClick={() => window.location.href = '/gallery'}>
                <Play className="h-4 w-4 ml-2" />
                عرض أعمالنا
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">+1000</div>
                <div className="text-xs text-muted-foreground">مشروع منجز</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-xs text-muted-foreground">سنة خبرة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-xs text-muted-foreground">خدمة متواصلة</div>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="relative h-[600px] lg:h-[700px]">
            <InteractiveMap />
          </div>
        </div>
      </div>
    </section>
  );
};
