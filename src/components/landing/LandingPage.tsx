// src/components/landing/LandingPage.tsx
// Error-safe landing page with lazy-loaded components

import { lazy, Suspense } from "react";
import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { HeroServicesBar } from "./HeroServicesBar";
import { ServicesSection } from "./ServicesSection";
import { StatsSection } from "./StatsSection";
import { ExperienceSection } from "./ExperienceSection";
import { GlobalPresenceSection } from "./GlobalPresenceSection";
import { StorySection } from "./StorySection";
import { FeaturesSection } from "./FeaturesSection";
import { TechnicianSection } from "./TechnicianSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { Footer } from "./Footer";
import { Loader2 } from "lucide-react";

// Lazy load the map component to prevent blocking initial render
const InteractiveMap = lazy(() => import("./InteractiveMap"));

// Loading fallback for map
const MapLoadingFallback = () => (
  <div className="w-full h-[400px] rounded-2xl bg-muted/50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
      <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
    </div>
  </div>
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      {/* قسم الهيرو */}
      <HeroSection />

      {/* شريط الخدمات السريع أسفل الهيرو مباشرة */}
      <HeroServicesBar />

      {/* قسم مستقل للخريطة */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 space-y-6" dir="rtl">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              شبكة أوبر فيكس على الخريطة
            </p>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
              تغطية تشغيلية{" "}
              <span className="bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
                للفروع والعملاء
              </span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <Suspense fallback={<MapLoadingFallback />}>
              <InteractiveMap />
            </Suspense>
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
