import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, User, ArrowRight, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from 'dompurify';

export default function BlogPost() {
  const { slug } = useParams();

  // بيانات تجريبية للمقال
  const post = {
    title: "أهمية الصيانة الدورية للمباني",
    excerpt: "تعرف على أهمية الصيانة الدورية وكيف تساعد في الحفاظ على قيمة العقار",
    category: "نصائح وإرشادات",
    author: "م. أحمد العزب",
    date: "15 يناير 2025",
    readTime: "5 دقائق",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=800&fit=crop",
    content: `
      <h2>مقدمة</h2>
      <p>الصيانة الدورية للمباني هي عملية حيوية تساعد في الحفاظ على سلامة المبنى وقيمته الاستثمارية. في هذا المقال، سنستعرض أهم جوانب الصيانة الدورية وفوائدها.</p>
      
      <h2>لماذا الصيانة الدورية مهمة؟</h2>
      <ul>
        <li>الحفاظ على قيمة العقار</li>
        <li>ضمان سلامة السكان</li>
        <li>تجنب التكاليف الباهظة للإصلاحات الطارئة</li>
        <li>إطالة عمر المبنى</li>
      </ul>

      <h2>أنواع الصيانة الدورية</h2>
      <p>تنقسم الصيانة الدورية إلى عدة أنواع:</p>
      <ol>
        <li><strong>الصيانة الوقائية:</strong> فحص دوري لاكتشاف المشاكل قبل تفاقمها</li>
        <li><strong>الصيانة التصحيحية:</strong> إصلاح الأعطال البسيطة فور اكتشافها</li>
        <li><strong>الصيانة التحسينية:</strong> تحديث وتطوير الأنظمة القديمة</li>
      </ol>

      <h2>جدول الصيانة الموصى به</h2>
      <p>ننصح بإجراء فحص شامل للمبنى كل 6 أشهر، مع فحوصات شهرية للأنظمة الحيوية مثل:</p>
      <ul>
        <li>نظام السباكة</li>
        <li>نظام الكهرباء</li>
        <li>نظام التكييف</li>
        <li>الأسطح والعزل</li>
      </ul>

      <h2>خلاصة</h2>
      <p>الاستثمار في الصيانة الدورية يوفر عليك الكثير من المال والجهد على المدى الطويل. لا تنتظر حتى تظهر المشاكل - ابدأ برنامج صيانة دورية اليوم!</p>
    `
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      {/* Hero Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img 
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Article Header */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto max-w-4xl">
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, {
              ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br'],
              ALLOWED_ATTR: ['href', 'target', 'rel']
            }) }} />
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                شارك المقال
              </h3>
              <div className="flex gap-3">
                <Button variant="outline" size="icon">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          <Card className="mt-8 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">{post.author}</h4>
                <p className="text-muted-foreground">
                  مهندس معماري ومدير مشاريع بخبرة تزيد عن 15 عامًا في مجال المقاولات والصيانة
                </p>
              </div>
            </div>
          </Card>

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link to="/blog">
              <Button variant="outline" size="lg">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة إلى المدونة
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
