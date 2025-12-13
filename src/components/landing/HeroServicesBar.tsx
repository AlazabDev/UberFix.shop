// src/components/landing/HeroServicesBar.tsx
// Quick services bar shown directly below hero section

import { Wind, Zap, Droplets, Wrench, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Wind,
    title: "تكييف",
    description: "تركيب وصيانة",
    href: "/services/hvac",
  },
  {
    icon: Zap,
    title: "كهرباء",
    description: "تأسيس وصيانة",
    href: "/services/electrical",
  },
  {
    icon: Droplets,
    title: "سباكة",
    description: "كشف تسريبات",
    href: "/services/plumbing",
  },
  {
    icon: Wrench,
    title: "صيانة عامة",
    description: "إصلاحات متنوعة",
    href: "/services/general",
  },
  {
    icon: Building2,
    title: "تجهيز محلات",
    description: "تشطيبات كاملة",
    href: "/services/fitout",
  },
];

export const HeroServicesBar = () => {
  return (
    <section className="bg-card border-y border-border py-8" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.href}
              className="group flex flex-col items-center p-4 rounded-xl bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <service.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{service.title}</h3>
              <p className="text-xs text-muted-foreground">{service.description}</p>
            </a>
          ))}
        </div>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">
            تحتاج خدمة سريعة؟ اطلب الآن واحصل على استجابة فورية
          </p>
          <Button 
            variant="default" 
            size="sm"
            className="bg-primary hover:bg-primary-light text-primary-foreground"
            onClick={() => (window.location.href = "/quick-request")}
          >
            اطلب خدمة
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
