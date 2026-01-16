// src/components/landing/HeroServicesBar.tsx
// Quick services bar shown directly below hero section

import { Wind, Zap, Droplets, Wrench, Building2, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// WhatsApp phone number - يمكن تغييره لاحقاً
const WHATSAPP_NUMBER = "201004006620";

const services = [
  {
    icon: Wind,
    title: "تكييف",
    description: "تركيب وصيانة",
    href: "/services/hvac",
    whatsappMessage: "مرحباً، أريد خدمة تكييف 🌬️"
  },
  {
    icon: Zap,
    title: "كهرباء",
    description: "تأسيس وصيانة",
    href: "/services/electrical",
    whatsappMessage: "مرحباً، أحتاج خدمة كهرباء ⚡"
  },
  {
    icon: Droplets,
    title: "سباكة",
    description: "كشف تسريبات",
    href: "/services/plumbing",
    whatsappMessage: "مرحباً، أحتاج خدمة سباكة 💧"
  },
  {
    icon: Wrench,
    title: "صيانة عامة",
    description: "إصلاحات متنوعة",
    href: "/services/general",
    whatsappMessage: "مرحباً، أحتاج خدمة صيانة عامة 🔧"
  },
  {
    icon: Building2,
    title: "تجهيز محلات",
    description: "تشطيبات كاملة",
    href: "/services/fitout",
    whatsappMessage: "مرحباً، أريد تجهيز محل تجاري 🏪"
  },
];

// فتح واتساب مع رسالة محددة
const openWhatsApp = (message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};

export const HeroServicesBar = () => {
  return (
    <section className="bg-card border-y border-border py-8" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="group flex flex-col items-center p-4 rounded-xl bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <service.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{service.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{service.description}</p>
              
              {/* WhatsApp Button */}
              <Button 
                size="sm"
                onClick={() => openWhatsApp(service.whatsappMessage)}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white text-xs px-3 py-1 h-8 flex items-center gap-1.5 font-medium shadow-md hover:shadow-lg transition-all w-full"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                واتساب
              </Button>
            </div>
          ))}
        </div>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">
            تحتاج خدمة سريعة؟ اطلب الآن واحصل على استجابة فورية
          </p>
          <div className="flex gap-3">
            <Button 
              variant="default" 
              size="sm"
              className="bg-primary hover:bg-primary-light text-primary-foreground"
              onClick={() => (window.location.href = "/quick-request")}
            >
              اطلب خدمة
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Button>
            <Button 
              size="sm"
              onClick={() => openWhatsApp("مرحباً، أريد طلب خدمة صيانة 🔧")}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              تواصل واتساب
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
