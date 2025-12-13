// src/components/landing/HeroSection.tsx

import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ChevronDown, Wrench } from "lucide-react";
import { RotatingText } from "./RotatingText";
import { useEffect, useRef } from "react";

// Animated particles component
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

    const colors = [
      "hsl(160, 84%, 39%)", // Green
      "hsl(45, 93%, 47%)", // Yellow/Gold
      "hsl(199, 89%, 48%)", // Blue
      "hsl(280, 65%, 60%)", // Purple
      "hsl(340, 75%, 55%)", // Pink
    ];

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
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
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen bg-[hsl(200,50%,8%)] overflow-hidden flex flex-col items-center justify-center">
      {/* Animated Particles Background */}
      <AnimatedParticles />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(200,50%,8%)]/30 to-[hsl(200,50%,8%)]/80 z-[2]" />

      <div className="container mx-auto px-4 py-20 relative z-10 text-center" dir="rtl">
        {/* Top Badge */}
        <div className="flex justify-center mb-10">
          <div className="bg-[hsl(180,40%,20%)]/80 backdrop-blur-sm px-6 py-3 rounded-full border border-[hsl(160,84%,39%)]/30 flex items-center gap-3">
            <Wrench className="h-5 w-5 text-[hsl(160,84%,39%)]" />
            <span className="text-sm font-medium text-white/90">
              حلول صيانة مبتكرة
            </span>
          </div>
        </div>

        {/* Main Heading with Rotating Text */}
        <div className="max-w-4xl mx-auto space-y-6 mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white min-h-[120px] md:min-h-[150px]">
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
          <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-3xl mx-auto min-h-[80px]">
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            size="lg"
            className="bg-[hsl(180,40%,25%)] hover:bg-[hsl(180,40%,30%)] text-white border border-[hsl(160,84%,39%)]/30 px-8 py-6 text-base group"
            onClick={() => (window.location.href = "/role-selection")}
          >
            ابدأ رحلتك معنا
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-base"
            onClick={() => (window.location.href = "/contact")}
          >
            <Calendar className="h-5 w-5 ml-2" />
            احجز استشارة
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center mb-12">
          <button
            onClick={scrollToContent}
            className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
            </div>
            <span className="text-xs">انتقل لأسفل</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </button>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[hsl(180,60%,50%)]">99</div>
            <div className="text-sm text-white/60 mt-1">رضا العملاء</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[hsl(45,93%,47%)]">1500</div>
            <div className="text-sm text-white/60 mt-1">مشروع مكتمل</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[hsl(180,60%,50%)]">50</div>
            <div className="text-sm text-white/60 mt-1">خبير متخصص</div>
          </div>
        </div>
      </div>
    </section>
  );
};
