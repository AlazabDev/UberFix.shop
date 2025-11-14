import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export default function Blog() {
  const blogPosts = [
    {
      title: "أهمية الصيانة الدورية للمباني",
      excerpt: "تعرف على أهمية الصيانة الدورية وكيف تساعد في الحفاظ على قيمة العقار وتجنب التكاليف الباهظة في المستقبل",
      category: "نصائح وإرشادات",
      author: "م. أحمد العزب",
      date: "15 يناير 2025",
      readTime: "5 دقائق",
      image: "maintenance-tips.jpg",
      featured: true
    },
    {
      title: "أحدث اتجاهات التصميم الداخلي لعام 2025",
      excerpt: "استكشف أحدث صيحات التصميم الداخلي والديكورات العصرية التي ستسيطر على المنازل هذا العام",
      category: "تصميم وديكور",
      author: "م. سارة الأحمد",
      date: "12 يناير 2025",
      readTime: "7 دقائق",
      image: "interior-design.jpg",
      featured: true
    },
    {
      title: "كيفية اختيار المقاول المناسب لمشروعك",
      excerpt: "دليل شامل لمساعدتك في اختيار أفضل مقاول لمشروعك بناءً على معايير الجودة والخبرة",
      category: "إدارة المشاريع",
      author: "م. خالد محمد",
      date: "10 يناير 2025",
      readTime: "6 دقائق",
      image: "contractor-guide.jpg",
      featured: false
    },
    {
      title: "التقنيات الذكية في إدارة المباني",
      excerpt: "تعرف على كيفية استخدام التقنيات الحديثة لتحسين كفاءة إدارة المباني وتقليل التكاليف",
      category: "تقنية",
      author: "م. فهد السعيد",
      date: "8 يناير 2025",
      readTime: "8 دقائق",
      image: "smart-building.jpg",
      featured: false
    },
    {
      title: "أساسيات السلامة في المواقع الإنشائية",
      excerpt: "نصائح وإرشادات هامة لضمان سلامة العمال والزوار في المواقع الإنشائية",
      category: "السلامة المهنية",
      author: "م. محمد العتيبي",
      date: "5 يناير 2025",
      readTime: "5 دقائق",
      image: "safety.jpg",
      featured: false
    },
    {
      title: "دليل العزل الحراري والمائي للمباني",
      excerpt: "كل ما تحتاج معرفته عن أنواع العزل المختلفة وأهميتها في الحفاظ على المبانى",
      category: "نصائح وإرشادات",
      author: "م. عبدالله الحربي",
      date: "2 يناير 2025",
      readTime: "9 دقائق",
      image: "insulation.jpg",
      featured: false
    }
  ];

  const categories = [
    "الكل",
    "نصائح وإرشادات",
    "تصميم وديكور",
    "إدارة المشاريع",
    "تقنية",
    "السلامة المهنية"
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="w-fit mx-auto">
              <BookOpen className="h-3 w-3 ml-1" />
              مدونتنا
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold">
              أحدث <span className="bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">المقالات</span> والنصائح
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              اطلع على آخر الأخبار والنصائح المفيدة في عالم المقاولات والصيانة
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-card border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">مقالات مميزة</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.filter(post => post.featured).map((post, index) => (
              <Card 
                key={index}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-72 overflow-hidden bg-muted">
                  <img 
                    src={`https://al-azab.co/images/${post.image}`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const fallbacks = [
                        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                      ];
                      e.currentTarget.src = fallbacks[index % fallbacks.length];
                    }}
                  />
                  <Badge className="absolute top-4 right-4">
                    {post.category}
                  </Badge>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <Link to={`/blog/${post.title.replace(/\s+/g, '-').toLowerCase()}`}>
                    <Button className="w-full group">
                      اقرأ المزيد
                      <ArrowLeft className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">جميع المقالات</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.filter(post => !post.featured).map((post, index) => (
              <Card 
                key={index}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img 
                    src={`https://al-azab.co/images/${post.image}`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const fallbacks = [
                        "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1600573472556-e636c2f75494?w=800&h=600&fit=crop"
                      ];
                      e.currentTarget.src = fallbacks[index % fallbacks.length];
                    }}
                  />
                  <Badge className="absolute top-3 right-3 text-xs">
                    {post.category}
                  </Badge>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold line-clamp-2 hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              عرض المزيد من المقالات
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">اشترك في نشرتنا البريدية</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              احصل على آخر المقالات والنصائح مباشرة في بريدك الإلكتروني
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 px-4 py-3 rounded-lg text-foreground"
              />
              <Button variant="secondary" size="lg">
                اشترك الآن
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
