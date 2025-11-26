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

export const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <HeroSection />
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
