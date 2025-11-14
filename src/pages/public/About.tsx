import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, TrendingUp, Target, Heart, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="w-fit mx-auto">
              <Heart className="h-3 w-3 ml-1" />
              قصتنا
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold">
              نحن <span className="bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">العزب للمقاولات</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              شركة رائدة في مجال المقاولات والصيانة، نقدم حلولاً متكاملة ومبتكرة تلبي احتياجات عملائنا بأعلى معايير الجودة والاحترافية.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "عميل راضٍ", value: "+500", color: "text-blue-600" },
              { icon: Award, label: "مشروع مكتمل", value: "+350", color: "text-green-600" },
              { icon: TrendingUp, label: "سنة خبرة", value: "+15", color: "text-orange-600" },
              { icon: Target, label: "نسبة النجاح", value: "99%", color: "text-purple-600" }
            ].map((stat, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <stat.icon className={`h-10 w-10 mx-auto mb-3 ${stat.color}`} />
                <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">رحلتنا نحو التميز</h2>
              <p className="text-muted-foreground leading-relaxed">
                بدأت رحلتنا منذ أكثر من 15 عاماً بحلم بسيط: تقديم خدمات مقاولات وصيانة تتميز بالجودة والاحترافية. 
                اليوم، نفخر بأننا أصبحنا من الشركات الرائدة في المملكة، حيث أتممنا المئات من المشاريع الناجحة 
                وبنينا علاقات طويلة الأمد مع عملائنا.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                نؤمن بأن النجاح الحقيقي يأتي من رضا العملاء، لذلك نحرص دائماً على تقديم أفضل الخدمات 
                باستخدام أحدث التقنيات والممارسات العالمية، مع الالتزام بالمواعيد والجودة العالية.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://al-azab.co/images/about-hero.jpg" 
                alt="فريق العمل"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop";
                }}
              />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -top-6 -left-6 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">قيمنا الأساسية</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              نلتزم بمجموعة من القيم التي تحدد هويتنا وتوجه عملنا اليومي
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "الجودة أولاً",
                description: "نضع الجودة في صميم كل ما نقوم به، ملتزمين بأعلى المعايير في جميع مشاريعنا"
              },
              {
                icon: Heart,
                title: "رضا العميل",
                description: "سعادة عملائنا هي مقياس نجاحنا، ونسعى دائماً لتجاوز توقعاتهم"
              },
              {
                icon: Zap,
                title: "الابتكار المستمر",
                description: "نواكب أحدث التطورات والتقنيات لتقديم حلول مبتكرة وفعالة"
              }
            ].map((value, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                  <value.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">فريق العمل</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              فريق متخصص من المهندسين والفنيين ذوي الخبرة العالية في مختلف المجالات
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((member) => (
              <Card key={member} className="overflow-hidden hover:shadow-xl transition-all">
                <img 
                  src={`https://al-azab.co/images/team-${member}.jpg`}
                  alt={`عضو الفريق ${member}`}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&q=80`;
                  }}
                />
                <div className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-1">عضو الفريق</h3>
                  <p className="text-sm text-muted-foreground">مدير المشاريع</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
