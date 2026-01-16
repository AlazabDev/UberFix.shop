import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  Zap, 
  Droplets, 
  Wind, 
  Building2, 
  ArrowLeft,
  CheckCircle,
  MessageCircle
} from "lucide-react";

// WhatsApp phone number - يمكن تغييره لاحقاً
const WHATSAPP_NUMBER = "201000000000"; // رقم واتساب للاختبار

export const ServicesSection = () => {
  const services = [
    {
      icon: Wind,
      title: "تركيب وصيانة المكيفات",
      description: "تركيب، صيانة دورية، وإصلاح جميع أنواع أجهزة التكييف مع ضمان الجودة",
      image: "https://zrrffsjbfkphridqyais.supabase.co/storage/v1/object/public/az_gallery/images/maintenance/00451-klima-montaj.jpg",
      features: ["تركيب احترافي", "صيانة دورية", "شحن فريون", "غسيل وتنظيف"],
      badge: "الأكثر طلباً",
      whatsappMessage: "مرحباً، أريد الاستفسار عن خدمة تركيب وصيانة المكيفات 🌬️"
    },
    {
      icon: Zap,
      title: "أعمال الكهرباء",
      description: "تأسيس وتمديد الكهرباء، صيانة اللوحات الكهربائية، وحل جميع المشاكل الكهربائية",
      image: "https://zrrffsjbfkphridqyais.supabase.co/storage/v1/object/public/az_gallery/images/maintenance/62294-establish-electricity.jpg",
      features: ["تأسيس كهرباء", "صيانة لوحات", "كشف أعطال", "تركيب إضاءة"],
      badge: "متوفر 24/7",
      whatsappMessage: "مرحباً، أحتاج خدمة كهرباء ⚡"
    },
    {
      icon: Droplets,
      title: "السباكة وإصلاح التسريبات",
      description: "كشف وإصلاح تسريبات المياه، تركيب وصيانة الأدوات الصحية والمواسير",
      image: "https://zrrffsjbfkphridqyais.supabase.co/storage/v1/object/public/az_gallery/images/maintenance/05214-water-leak-repair.jpg",
      features: ["كشف تسريبات", "إصلاح مواسير", "تركيب صحي", "صيانة خزانات"],
      badge: "خدمة سريعة",
      whatsappMessage: "مرحباً، لدي مشكلة في السباكة وأحتاج مساعدة 💧"
    },
    {
      icon: Building2,
      title: "تجهيز المحلات التجارية",
      description: "تجهيز شامل للمحلات التجارية من تصميم وتنفيذ بأحدث المعايير والتقنيات",
      image: "https://zrrffsjbfkphridqyais.supabase.co/storage/v1/object/public/az_gallery/images/construction/abuauf_11.jpg",
      features: ["تصميم داخلي", "تنفيذ ديكورات", "تركيب واجهات", "تجهيز كامل"],
      badge: "مشاريع متكاملة",
      whatsappMessage: "مرحباً، أريد الاستفسار عن تجهيز محل تجاري 🏪"
    }
  ];

  // فتح واتساب مع رسالة محددة
  const openWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Wrench className="h-3 w-3 mr-1" />
            خدماتنا المتخصصة
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            خدمات صيانة
            <span className="block bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
              وتجهيز متكاملة
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            نقدم مجموعة شاملة من خدمات الصيانة وتجهيز المحلات التجارية بأعلى معايير الجودة 
            والاحترافية مع فريق من الخبراء المتخصصين
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  {service.badge}
                </Badge>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center mb-3">
                    <service.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 group/btn">
                    اطلب الخدمة
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={() => openWhatsApp(service.whatsappMessage)}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <MessageCircle className="h-5 w-5" />
                    واتساب
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Choose Us */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  لماذا تختار خدماتنا؟
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  نفخر بتقديم خدمات صيانة متميزة مع ضمان الجودة والالتزام بالمواعيد. 
                  فريقنا من الفنيين المحترفين جاهز لخدمتك في أي وقت.
                </p>
                <div className="space-y-3">
                  {[
                    "فنيون معتمدون وذوو خبرة عالية",
                    "استخدام أفضل المواد والأدوات",
                    "ضمان شامل على جميع الأعمال",
                    "أسعار تنافسية وعروض مميزة",
                    "خدمة عملاء متاحة على مدار الساعة"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://zrrffsjbfkphridqyais.supabase.co/storage/v1/object/public/az_gallery/images/maintenance/00453-klima-bakim.jpg"
                  alt="صيانة مكيفات"
                  className="w-full h-48 object-cover rounded-lg shadow-lg"
                />
                <img 
                  src="https://zrrffsjbfkphridqyais.supabase.co/storage/v1/object/public/az_gallery/images/construction/abuauf_13.jpg"
                  alt="تجهيز محلات"
                  className="w-full h-48 object-cover rounded-lg shadow-lg mt-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
