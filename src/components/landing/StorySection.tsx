import { Card } from "@/components/ui/card";
import { Quote, Award, Users, Target } from "lucide-react";

export const StorySection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary tracking-wide mb-3">قصة نجاح</p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-foreground">من فني إلى مدير تنفيذي</h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            رحلة محمد العزب من تقديم خدمة صيانة واحدة إلى بناء شركة وطنية لإدارة المرافق
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start mb-14">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden">
              <img 
                src="https://zrrffsjbfkphridqyais.supabase.co/storage/v1/object/public/az_gallery/images/construction/abuauf_47.jpg"
                alt="محمد العزب - مؤسس شركة العزب"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent rounded-2xl" />
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-xl font-bold text-white mb-1">محمد العزب</h3>
                <p className="text-sm text-white/80">مؤسس ومالك شركة العزب للمقاولات</p>
              </div>
            </div>
            
            <Card className="absolute -bottom-4 -right-4 p-4 bg-card border border-border shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">+5</div>
                  <div className="text-[10px] text-muted-foreground">سنوات من النجاح</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Content */}
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              بعد نشأته في قطاع البناء التجاري، انضم محمد العزب إلى قطاع إدارة المرافق الوطنية. 
              تلقى طلب خدمة صيانة من شركة أبو عوف، إحدى أكبر شركات التجزئة، في عام 2019.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              بعد فترة وجيزة من إتمام هذه الصيانة وبناء علاقة طويلة الأمد مع العملاء، بدأ محمد العزب رحلته نحو 
              بناء شركة وطنية لإدارة المرافق.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              استمر محمد العزب في تلبية احتياجات الصيانة لتجار التجزئة وسلاسل المطاعم في جميع المحافظات.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Card className="p-4 border-r-2 border-r-primary bg-accent/50">
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold mb-0.5 text-foreground">فريق متخصص</h4>
                    <p className="text-xs text-muted-foreground">تم توظيف وتدريب فريق مكتبي محترف</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-r-2 border-r-secondary bg-accent/50">
                <div className="flex items-start gap-2">
                  <Award className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold mb-0.5 text-foreground">ثقة العملاء</h4>
                    <p className="text-xs text-muted-foreground">خدمة سلاسل البيع بالتجزئة الكبرى</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Quote */}
        <Card className="relative p-8 lg:p-10 bg-primary text-primary-foreground overflow-hidden rounded-2xl">
          <Quote className="absolute top-4 right-4 h-20 w-20 text-primary-foreground/5" />
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <blockquote className="text-base lg:text-lg font-medium leading-relaxed mb-5 text-primary-foreground/90">
              "النية مهمة. نحن جميعاً ملتزمون بنقاء النية. فريقنا الداخلي هو الأهم، 
              وسنبذل قصارى جهدنا لتحقيق ذلك."
            </blockquote>
            <div className="font-semibold text-sm">محمد العزب</div>
            <div className="text-xs text-primary-foreground/60">مؤسس ومالك شركة العزب للمقاولات</div>
          </div>
        </Card>
      </div>
    </section>
  );
};
