// src/components/landing/LandingPage.tsx
// Error-safe landing page with lazy-loaded components

import { lazy, Suspense } from "react";
import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { HeroServicesBar } from "./HeroServicesBar";
import { ServicesSection } from "./ServicesSection";
import { StatsSection } from "./StatsSection";
import { ExperienceSection } from "./ExperienceSection";

import { StorySection } from "./StorySection";
import { FeaturesSection } from "./FeaturesSection";
import { TechnicianSection } from "./TechnicianSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { Footer } from "./Footer";
import { WhatsAppFloatingButton } from "@/components/ui/WhatsAppFloatingButton";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

// Lazy load the map component to prevent blocking initial render
const BranchesMapbox = lazy(() => import("@/components/maps/BranchesMapbox"));

// Loading fallback for map
const MapLoadingFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full h-[500px] rounded-2xl bg-muted/50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
        <p className="text-sm text-muted-foreground">{t('map.loading')}</p>
      </div>
    </div>
  );
};

export const LandingPage = () => {
  const { t } = useTranslation();
  const { direction } = useDirection();

  return (
    <div className="min-h-screen bg-background text-foreground" dir={direction}>
      <LandingHeader />

      {/* قسم الهيرو */}
      <HeroSection />

      {/* شريط الخدمات السريع أسفل الهيرو مباشرة */}
      <HeroServicesBar />

      {/* قسم مستقل للخريطة */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <p className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {t('map.title')}
            </p>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">
              {t('map.subtitle')}{" "}
              <span className="bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
                {t('map.highlight')}
              </span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <Suspense fallback={<MapLoadingFallback />}>
              <BranchesMapbox height="500px" showStats={true} initialMode="globe" />
            </Suspense>
          </div>
        </div>
      </section>

      {/* باقي أقسام صفحة الهبوط */}
      <ServicesSection />
      <StatsSection />
      <ExperienceSection />
      <StorySection />
      <FeaturesSection />
      <TechnicianSection />
      <TestimonialsSection />
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <WhatsAppFloatingButton />
    </div>
  );
};
