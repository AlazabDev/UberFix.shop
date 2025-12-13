// src/components/landing/HeroSection.tsx

import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ChevronDown, Wrench } from "lucide-react";
import { RotatingText } from "./RotatingText";
import { useEffect, useRef } from "react";

// Animated particles component with brand colors
const AnimatedParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
      opacity: number;
    }> = [];

    // Brand colors from design system
    const colors = [
      "hsl(220, 84%, 35%)", // Primary blue
      "hsl(38, 92%, 50%)", // Secondary orange
      "hsl(120, 60%, 50%)", // Success green
      "hsl(220, 84%, 45%)", // Primary light
    ];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export const HeroSection = () => {
  const scrollToContent = () => {
    window.scrollBy({ top: window.innerHeight * 0.7, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[85vh] bg-primary-dark overflow-hidden flex flex-col items-center justify-center">
      {/* Animated Particles Background */}
      <AnimatedParticles />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary-dark/50 to-primary-dark z-[2]" />

      <div className="container mx-auto px-4 py-12 relative z-10 text-center" dir="rtl">
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary/20 backdrop-blur-sm px-5 py-2 rounded-full border border-secondary/30 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-white/90">
              حلول صيانة مبتكرة
            </span>
          </div>
        </div>

        {/* Main Heading with Rotating Text */}
        <div className="max-w-4xl mx-auto space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white min-h-[80px] md:min-h-[100px]">
            <RotatingText
              texts={[
                "إدارة المنشآت بمعايير الجودة",
                "نقدم حلول ذكية لإدارة الصيانة",
                "صيانة احترافية بمعايير واضحة",
                "تجهيز المحلات بخبرة هندسية",
                "نهج مستدام للمنشآت التجارية",
              ]}
              interval={4000}
            />
          </h1>

          {/* Subtitle with Rotating Text */}
          <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-2xl mx-auto min-h-[60px]">
            <RotatingText
              texts={[
                "نُدير المنشآت وفق أطر جودة واضحة تضمن كفاءة التشغيل، وتقليل الأعطال، والحفاظ على مستوى ثابت من الأداء اليومي.",
                "نوفر حلول صيانة تعتمد على التخطيط والتحليل، بما يضمن سرعة الاستجابة واستمرارية العمل التشغيلية دون تعطيل النشاط.",
                "تنفيذ أعمال الصيانة والتجديدات بأسلوب منظم ومعايير محددة تضمن الجودة، والدقة، والالتزام في كل مرحلة من الخدمة.",
                "خبرة عملية في تجهيز المحلات التجارية والفروع من التأسيس حتى التشغيل، مع مراعاة المتطلبات الفنية والتشغيلية.",
                "نعتمد نهجًا طويل المدى يوازن بين الأداء والتكلفة، ويعزز استدامة المنشآت التجارية وسلسلة الإمدادات على المدى البعيد.",
              ]}
              interval={4000}
            />
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Button
            size="lg"
            className="bg-secondary hover:bg-secondary-light text-secondary-foreground px-6 py-5 text-sm font-semibold group"
            onClick={() => (window.location.href = "/role-selection")}
          >
            ابدأ رحلتك معنا
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 px-6 py-5 text-sm"
            onClick={() => (window.location.href = "/contact")}
          >
            <Calendar className="h-4 w-4 ml-2" />
            احجز استشارة
          </Button>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-6">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-secondary">99%</div>
            <div className="text-xs text-white/60 mt-1">رضا العملاء</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-success">+1500</div>
            <div className="text-xs text-white/60 mt-1">مشروع مكتمل</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-secondary">+50</div>
            <div className="text-xs text-white/60 mt-1">خبير متخصص</div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors cursor-pointer mx-auto"
        >
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
};
