// src/components/landing/HeroSection.tsx

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Wrench,
  Building2,
  Zap,
  Droplets,
  MapPin,
  Sparkles,
} from "lucide-react";
import { RotatingText } from "./RotatingText";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5bf2320_1px,transparent_1px),linear-gradient(to_bottom,#f5bf2320_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-primary/20"></div>

        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-soft"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary/3 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10" dir="rtl">
        {/* Top Badge */}
        <div className="flex justify-center mb-8 animate-float">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse-soft" />
            <span className="text-sm font-medium">
              UberFix for Facility Management
            </span>
            <MapPin className="h-5 w-5 text-primary animate-pulse-soft" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Wrench className="h-3 w-3 mr-1" />
                By Alazab Construction
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight min-h-[180px] lg:min-h-[240px]">
                <RotatingText
                  texts={[
                    "إدارة المنشآت بمعايير الجودة",
                    "نقدم حلول ذكية لإدارة الصيانة",
                    "صيانة احترافية بمعايير واضحة",
                    "تجهيز المحلات بخبرة هندسية",
                    "نهج مستدام للمنشآت التجارية",         
                  ]}
                  interval={3500}
                />
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed">
                <RotatingText
                  texts={[
                    "نُدير المنشآت وفق أطر جودة واضحة تضمن كفاءة التشغيل، وتقليل الأعطال، والحفاظ على مستوى ثابت من الأداء اليومي.",
                    "نوفر حلول صيانة تعتمد على التخطيط والتحليل، بما يضمن سرعة الاستجابة واستمرارية العمل التشغليه دون تعطيل النشاط.",
                    "تنفيذ أعمال الصيانة والتجديدات بأسلوب منظم ومعايير محددة تضمن الجودة، والدقة، والالتزام في كل مرحلة من الخدمه.",
                    "خبرة عملية في تجهيز المحلات التجارية والفروع من التأسيس حتى التشغيل، مع مراعاة المتطلبات الفنية والتشغيلية .",
                    "نعتمد نهجًا طويل المدى يوازن بين الأداء والتكلفة، ويعزز استدامة المنشآت التجاريه وسلسلة الامدادات على المدى البعيد.",
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
                { icon: Building2, text: "تجهيز المحلات التجارية" },
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
              <Button
                size="lg"
                className="group"
                onClick={() => (window.location.href = "/role-selection")}
              >
                اطلب خدمة الآن
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="group"
                onClick={() => (window.location.href = "/gallery")}
              >
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
                <div className="text-xs text-muted-foreground">
                  خدمة متواصلة
                </div>
              </div>
            </div>
          </div>

          {/* جانب بصري بسيط بدل الخريطة */}
          <div className="relative h-[400px] lg:h-[500px]">
            <div className="absolute inset-0 rounded-3xl border border-primary/20 bg-background/80 shadow-[0_18px_60px_rgba(15,23,42,0.35)] p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  ملخص التشغيل
                </p>
                <h2 className="text-lg font-semibold mb-4">
                  لوحة متابعة سريعة لطلبات الصيانة
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  هذه مجرد عينة من شكل اللوحات التشغيلية التي يمكن ربطها
                  بالبيانات الحقيقية في النظام، مع تتبع فوري لحالة الطلبات،
                  الفروع، والفنيين على مدار اليوم.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-muted/70 px-3 py-2">
                  <p className="text-muted-foreground">طلبات اليوم</p>
                  <p className="text-lg font-bold text-primary">32</p>
                </div>
                <div className="rounded-xl bg-muted/70 px-3 py-2">
                  <p className="text-muted-foreground">طلبات تحت التنفيذ</p>
                  <p className="text-lg font-bold text-primary">12</p>
                </div>
                <div className="rounded-xl bg-muted/70 px-3 py-2">
                  <p className="text-muted-foreground">الفنيون المتصلون الآن</p>
                  <p className="text-lg font-bold text-primary">27</p>
                </div>
                <div className="rounded-xl bg-muted/70 px-3 py-2">
                  <p className="text-muted-foreground">متوسط زمن الاستجابة</p>
                  <p className="text-lg font-bold text-primary">18 دقيقة</p>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-[11px] text-muted-foreground">
                يمكن ربط هذه البطاقات مباشرة بسجلات Supabase وERPNext لعرض
                الأرقام الحقيقية للفروع والفنيين والطلبات في الوقت الفعلي.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
