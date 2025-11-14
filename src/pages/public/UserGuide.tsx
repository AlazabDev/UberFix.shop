import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Book, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function UserGuide() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "البدء مع النظام",
      items: [
        {
          title: "إنشاء حساب جديد",
          content: "للبدء في استخدام النظام، قم بإنشاء حساب من خلال صفحة التسجيل. املأ البيانات المطلوبة مثل الاسم والبريد الإلكتروني ورقم الهاتف."
        },
        {
          title: "تسجيل الدخول",
          content: "بعد إنشاء الحساب، استخدم بريدك الإلكتروني وكلمة المرور لتسجيل الدخول إلى النظام والوصول إلى لوحة التحكم."
        },
        {
          title: "إعداد الملف الشخصي",
          content: "قم بتحديث معلومات ملفك الشخصي من صفحة الإعدادات. يمكنك إضافة صورة شخصية وتحديث بيانات الاتصال."
        }
      ]
    },
    {
      title: "إدارة طلبات الصيانة",
      items: [
        {
          title: "إنشاء طلب صيانة جديد",
          content: "من صفحة الطلبات، انقر على زر 'طلب جديد'. اختر نوع الصيانة المطلوبة (كهرباء، سباكة، تكييف، إلخ)، واملأ تفاصيل المشكلة، وحدد العقار والموعد المفضل."
        },
        {
          title: "متابعة حالة الطلب",
          content: "يمكنك متابعة حالة طلبك من خلال صفحة الطلبات. ستجد معلومات عن الحالة الحالية (قيد الانتظار، قيد التنفيذ، مكتمل)، والفني المعين، والوقت المتوقع للإنجاز."
        },
        {
          title: "التواصل مع الفني",
          content: "بمجرد تعيين فني لطلبك، ستحصل على معلومات الاتصال الخاصة به. يمكنك التواصل معه مباشرة لتنسيق موعد الزيارة أو الاستفسار عن التفاصيل."
        },
        {
          title: "إضافة تقييم ومراجعة",
          content: "بعد إتمام الصيانة، يمكنك تقييم جودة الخدمة والفني من خلال نظام التقييم. تساعد تقييماتك في تحسين الخدمة المقدمة."
        }
      ]
    },
    {
      title: "إدارة العقارات",
      items: [
        {
          title: "إضافة عقار جديد",
          content: "من صفحة العقارات، يمكنك إضافة عقار جديد بإدخال التفاصيل مثل العنوان، النوع، عدد الغرف، المساحة، والمرافق المتوفرة."
        },
        {
          title: "تحديث معلومات العقار",
          content: "يمكنك تعديل معلومات العقار في أي وقت من خلال النقر على العقار واختيار 'تعديل'. قم بتحديث البيانات ثم احفظ التغييرات."
        },
        {
          title: "جدولة الصيانة الدورية",
          content: "قم بإعداد جدول صيانة دورية لعقاراتك لضمان الحفاظ عليها. يمكنك تحديد مواعيد الفحص الدوري والصيانة الوقائية."
        }
      ]
    },
    {
      title: "المواعيد والزيارات",
      items: [
        {
          title: "جدولة موعد",
          content: "يمكنك جدولة مواعيد الزيارات من خلال صفحة المواعيد. اختر التاريخ والوقت المناسب، وسيتم إرسال تأكيد بالموعد."
        },
        {
          title: "تعديل أو إلغاء موعد",
          content: "في حالة الحاجة لتغيير موعد، يمكنك تعديله أو إلغاؤه من خلال قائمة المواعيد قبل 24 ساعة على الأقل من الموعد المحدد."
        },
        {
          title: "التذكيرات التلقائية",
          content: "سيرسل النظام تذكيرات تلقائية قبل موعد الزيارة بـ 24 ساعة عبر البريد الإلكتروني أو الرسائل النصية."
        }
      ]
    },
    {
      title: "الفواتير والمدفوعات",
      items: [
        {
          title: "عرض الفواتير",
          content: "يمكنك الاطلاع على جميع فواتيرك من صفحة الفواتير. ستجد تفاصيل كل فاتورة بما في ذلك الخدمات المقدمة والتكلفة."
        },
        {
          title: "طرق الدفع",
          content: "النظام يدعم عدة طرق للدفع: الدفع نقداً عند الزيارة، التحويل البنكي، أو الدفع الإلكتروني من خلال النظام."
        },
        {
          title: "تحميل الفواتير",
          content: "يمكنك تحميل نسخة PDF من أي فاتورة للاحتفاظ بها أو طباعتها من خلال زر 'تحميل' في صفحة تفاصيل الفاتورة."
        }
      ]
    },
    {
      title: "التقارير والإحصائيات",
      items: [
        {
          title: "لوحة المعلومات",
          content: "توفر لوحة المعلومات نظرة عامة على أنشطتك: عدد الطلبات النشطة، المواعيد القادمة، الفواتير المعلقة، وإحصائيات الأداء."
        },
        {
          title: "تقارير الصيانة",
          content: "يمكنك الوصول إلى تقارير مفصلة عن تاريخ الصيانة لعقاراتك، التكاليف، الفنيين المعينين، ومعدلات الإنجاز."
        },
        {
          title: "تصدير البيانات",
          content: "جميع التقارير يمكن تصديرها بصيغة Excel أو PDF للمراجعة أو الأرشفة."
        }
      ]
    },
    {
      title: "الإعدادات والتخصيص",
      items: [
        {
          title: "إعدادات الإشعارات",
          content: "تحكم في أنواع الإشعارات التي ترغب في استلامها: إشعارات البريد الإلكتروني، الرسائل النصية، الإشعارات داخل النظام."
        },
        {
          title: "تفضيلات اللغة",
          content: "يمكنك اختيار لغة واجهة النظام من الإعدادات (العربية أو الإنجليزية)."
        },
        {
          title: "الأمان وكلمة المرور",
          content: "من إعدادات الأمان يمكنك تغيير كلمة المرور، تفعيل المصادقة الثنائية، ومراجعة نشاط الحساب."
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Book className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">دليل المستخدم</h1>
            <p className="text-muted-foreground mt-1">دليل شامل لاستخدام نظام إدارة الصيانة</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/documentation')}>
          العودة للتوثيق
        </Button>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>محتويات الدليل</CardTitle>
          <CardDescription>
            اختر أي قسم لعرض التفاصيل والتعليمات خطوة بخطوة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {sections.map((section, sectionIndex) => (
              <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {section.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion type="multiple" className="pr-6">
                    {section.items.map((item, itemIndex) => (
                      <AccordionItem key={itemIndex} value={`item-${sectionIndex}-${itemIndex}`}>
                        <AccordionTrigger className="text-base">
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {item.content}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
