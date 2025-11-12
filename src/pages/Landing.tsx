import { motion } from "framer-motion";
import { Building2, MapPin, Phone, Star, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const stats = [
    { value: "500+", label: "فني متخصص" },
    { value: "1000+", label: "عميل راضٍ" },
    { value: "50+", label: "مدينة" },
    { value: "24/7", label: "دعم فني" },
  ];

  const services = [
    { icon: "🔧", title: "صيانة كهربائية", desc: "خدمات كهرباء شاملة" },
    { icon: "💧", title: "سباكة", desc: "حلول سباكة احترافية" },
    { icon: "❄️", title: "تكييف", desc: "صيانة وتركيب المكيفات" },
    { icon: "🏗️", title: "نجارة", desc: "أعمال النجارة والديكور" },
    { icon: "🎨", title: "دهانات", desc: "دهان وتشطيبات" },
    { icon: "🔨", title: "صيانة عامة", desc: "جميع أعمال الصيانة" },
  ];

  const features = [
    "فنيون معتمدون ومدربون",
    "استجابة سريعة خلال 24 ساعة",
    "أسعار منافسة وشفافة",
    "ضمان على جميع الأعمال",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">UberFix.shop</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:0227047955" className="hidden md:flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <span className="font-medium">0227047955</span>
            </a>
            <Button onClick={() => navigate("/dashboard")} variant="default">
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 text-lg px-4 py-1" variant="secondary">
              <MapPin className="h-4 w-4 ml-1" />
              خدمات صيانة في جميع أنحاء مصر
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-primary via-primary to-accent bg-clip-text text-transparent">
              خدمات الصيانة بضغطة زر
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              احصل على أفضل الفنيين المعتمدين في منطقتك خلال دقائق
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg h-14 px-8">
                ابدأ الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/map")} className="text-lg h-14 px-8">
                <MapPin className="ml-2 h-5 w-5" />
                استكشف الخريطة
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 backdrop-blur-sm border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا</h2>
            <p className="text-lg text-muted-foreground">
              نوفر مجموعة شاملة من خدمات الصيانة
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50">
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                لماذا UberFix.shop؟
              </h2>
              <div className="space-y-4">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <div className="rounded-full bg-primary/10 p-2 mt-1">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-lg">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">تقييم ممتاز</div>
                      <div className="text-sm text-muted-foreground">
                        4.8 من 5 نجوم
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    "خدمة ممتازة وسريعة. الفني كان محترف جداً وحل المشكلة بسرعة.
                    أنصح بشدة!"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div>
                      <div className="font-medium">أحمد محمد</div>
                      <div className="text-xs text-muted-foreground">القاهرة</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-l from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              جاهز للبدء؟
            </h2>
            <p className="text-xl mb-8 opacity-90">
              احجز فني محترف الآن واحصل على خدمة سريعة ومضمونة
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/dashboard")}
              className="text-lg h-14 px-8"
            >
              احجز الآن
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">UberFix.shop</span>
              </div>
              <p className="text-muted-foreground">
                منصة رائدة لخدمات الصيانة في مصر
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <button onClick={() => navigate("/dashboard")} className="hover:text-primary">
                    الخدمات
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/map")} className="hover:text-primary">
                    الخريطة
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:0227047955" className="hover:text-primary">
                    0227047955
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>المعادي، القاهرة</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
            © 2025 UberFix.shop. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
