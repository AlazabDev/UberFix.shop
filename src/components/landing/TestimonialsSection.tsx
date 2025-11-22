import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "أحمد محمد",
      position: "مدير العقارات",
      company: "مجموعة الفيصل العقارية",
      rating: 5,
      comment: "النظام سهل الاستخدام جداً وأحدث نقلة نوعية في إدارة طلبات الصيانة. فريق الدعم ممتاز والاستجابة سريعة.",
      avatar: "A"
    },
    {
      name: "سارة أحمد",
      position: "مديرة المشاريع",
      company: "شركة البناء المتطور",
      rating: 5,
      comment: "منصة رائعة تساعدنا في تنظيم جميع عمليات الصيانة والمتابعة. التقارير مفيدة جداً لاتخاذ القرارات.",
      avatar: "س"
    },
    {
      name: "محمد العلي",
      position: "رئيس قسم الصيانة",
      company: "مؤسسة الإعمار الحديث",
      rating: 5,
      comment: "وفر علينا الكثير من الوقت والجهد. إمكانية تتبع الطلبات والتواصل مع الفنيين ممتازة. أنصح به بشدة.",
      avatar: "م"
    }
  ];

  const companies = [
    "مجموعة الفيصل",
    "البناء المتطور", 
    "الإعمار الحديث",
    "العقارات الذكية",
    "المؤسسة الوطنية",
    "التطوير العمراني"
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-3 w-3 mr-1" />
            شهادات العملاء
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            يمكنك الآن تجربة نظام مجاني لمدة
            <span className="block text-primary">شهر واكتشاف الفرق بنفسك</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            آراء عملائنا تتحدث عن تجربتهم الإيجابية مع نظامنا وكيف ساعدهم في تحسين كفاءة إدارة الصيانة
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="h-10 w-10 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  "{testimonial.comment}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.position}</div>
                    <div className="text-xs text-primary">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trusted Companies */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-8 text-muted-foreground">
            يثق بنا أكثر من 500 شركة وعقار
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-primary/5 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">جرب النظام مجاناً الآن</h3>
            <p className="text-muted-foreground mb-6">
              احصل على تجربة مجانية لمدة شهر كامل واكتشف كيف يمكن لنظامنا تحسين كفاءة إدارة الصيانة لديك
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
