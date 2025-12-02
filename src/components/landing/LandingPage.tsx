// src/components/landing/LandingPage.tsx

import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { ServicesSection } from "./ServicesSection";
import { StatsSection } from "./StatsSection";
import { ExperienceSection } from "./ExperienceSection";
import { GlobalPresenceSection } from "./GlobalPresenceSection";
import { StorySection } from "./StorySection";
import { FeaturesSection } from "./FeaturesSection";
import { TechnicianSection } from "./TechnicianSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { Footer } from "./Footer";
import { InteractiveMap } from "./InteractiveMap";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      {/* قسم الهيرو */}
      <HeroSection />

      {/* قسم مستقل للخريطة أسفل الهيرو */}
      <section className="py-16 md:py-20 bg-muted/40 border-y border-border/60">
        <div className="container mx-auto px-4 space-y-8" dir="rtl">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <p className="inline-flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              شبكة أوبر فيكس على الخريطة
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
              تغطية تشغيلية{" "}
              <span className="bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
                للفروع والعملاء في مصر
              </span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              يعرض هذا القسم مواقع الفروع والشركاء التي نخدمها حاليًا، مع
              إمكانية ربطه مستقبلاً ببيانات حقيقية من Supabase وERPNext لعرض
              الحالة التشغيلية لحظيًا.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <InteractiveMap />
          </div>

          <div className="max-w-3xl mx-auto text-center text-xs md:text-sm text-muted-foreground">
            يمكن إضافة طبقات أخرى على الخريطة مثل حالة الطلبات، الفنيين
            المتصلين، أوقات الذروة، ومؤشرات الأداء لكل فرع، لتصبح الخريطة
            لوحة تحكم تشغيلية بصرية متكاملة.
          </div>
        </div>
      </section>

      {/* باقي أقسام صفحة الهبوط */}
      <ServicesSection />
      <StatsSection />
      <ExperienceSection />
      <GlobalPresenceSection />
      <StorySection />
      <FeaturesSection />
      <TechnicianSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};
