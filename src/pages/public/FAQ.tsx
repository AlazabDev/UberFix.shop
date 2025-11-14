import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function FAQ() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      category: "الأسئلة العامة",
      questions: [
        {
          question: "ما هو نظام إدارة الصيانة الذكي؟",
          answer: "هو نظام شامل لإدارة طلبات الصيانة والعقارات والفنيين. يتيح لك النظام إنشاء ومتابعة طلبات الصيانة، جدولة المواعيد، إدارة الفنيين والمقاولين، وإصدار الفواتير بشكل إلكتروني."
        },
        {
          question: "من يمكنه استخدام النظام؟",
          answer: "النظام مصمم لأصحاب العقارات، مديري المنشآت، شركات إدارة العقارات، والأفراد الذين يرغبون في إدارة صيانة ممتلكاتهم بشكل احترافي ومنظم."
        },
        {
          question: "هل النظام آمن لحفظ بياناتي؟",
          answer: "نعم، النظام يستخدم أحدث معايير الأمان والتشفير لحماية بياناتك. جميع المعلومات الحساسة محمية ومشفرة، ولا يمكن الوصول إليها إلا من قبل المستخدمين المصرح لهم."
        },
        {
          question: "هل يمكن استخدام النظام على الهاتف المحمول؟",
          answer: "نعم، النظام متجاوب تماماً ويعمل بكفاءة على جميع الأجهزة: الكمبيوتر، الأجهزة اللوحية، والهواتف الذكية بمختلف أحجامها."
        }
      ]
    },
    {
      category: "طلبات الصيانة",
      questions: [
        {
          question: "كيف أقوم بإنشاء طلب صيانة جديد؟",
          answer: "انتقل إلى صفحة 'الطلبات' واضغط على زر 'طلب جديد'. اختر نوع الصيانة المطلوبة، املأ تفاصيل المشكلة، حدد العقار والموعد المفضل، ثم اضغط 'إرسال الطلب'."
        },
        {
          question: "كيف أتابع حالة طلبي؟",
          answer: "من صفحة 'الطلبات' ستجد قائمة بجميع طلباتك مع حالة كل طلب. يمكنك النقر على أي طلب لعرض التفاصيل الكاملة، دورة الحياة، والتحديثات. كما ستصلك إشعارات فورية عند أي تغيير في حالة الطلب."
        },
        {
          question: "متى سيصل الفني لتنفيذ الصيانة؟",
          answer: "عادة يتم تعيين فني خلال 24 ساعة من إنشاء الطلب. سيتواصل معك الفني مباشرة لتحديد موعد مناسب للزيارة. في الحالات الطارئة، يمكن التواصل مع الدعم الفني لتسريع العملية."
        },
        {
          question: "هل يمكنني تعديل طلب الصيانة بعد إرساله؟",
          answer: "نعم، يمكنك تعديل تفاصيل الطلب طالما كان في حالة 'قيد الانتظار'. بمجرد تعيين فني وبدء العمل، ستحتاج للتواصل مع الفني مباشرة لأي تعديلات."
        },
        {
          question: "ماذا لو لم أكن راضياً عن الخدمة المقدمة؟",
          answer: "يمكنك تقييم الخدمة بعد الانتهاء من الصيانة. في حالة عدم الرضا، اتصل بخدمة العملاء وسنعمل على حل المشكلة أو إعادة الصيانة مجاناً حسب سياسة الضمان."
        }
      ]
    },
    {
      category: "المواعيد والجدولة",
      questions: [
        {
          question: "كيف أحدد موعد للصيانة؟",
          answer: "عند إنشاء طلب الصيانة، يمكنك اختيار التاريخ والوقت المفضل. كما يمكنك جدولة مواعيد مسبقة من صفحة 'المواعيد'."
        },
        {
          question: "هل يمكنني تغيير موعد الزيارة؟",
          answer: "نعم، يمكنك تعديل أو إلغاء الموعد قبل 24 ساعة على الأقل من الموعد المحدد من خلال صفحة المواعيد أو بالتواصل مع الفني مباشرة."
        },
        {
          question: "هل سأحصل على تذكير بالموعد؟",
          answer: "نعم، سيرسل النظام تذكيراً تلقائياً قبل 24 ساعة من موعد الزيارة عبر البريد الإلكتروني والرسائل النصية (حسب إعداداتك)."
        },
        {
          question: "ماذا يحدث إذا لم يحضر الفني في الموعد؟",
          answer: "في هذه الحالة، يرجى الاتصال بخدمة العملاء فوراً على الرقم 920000000. سنتعامل مع الموضوع بأولوية قصوى وإعادة جدولة الزيارة أو تعيين فني بديل."
        }
      ]
    },
    {
      category: "الفواتير والدفع",
      questions: [
        {
          question: "كيف أدفع قيمة الصيانة؟",
          answer: "يمكنك الدفع نقداً للفني عند إتمام العمل، أو من خلال النظام بعد استلام الفاتورة الإلكترونية. نوفر أيضاً خيار التحويل البنكي للمبالغ الكبيرة."
        },
        {
          question: "متى سأحصل على الفاتورة؟",
          answer: "يتم إصدار فاتورة إلكترونية فور إتمام الصيانة. ستصلك نسخة بالبريد الإلكتروني ويمكنك تحميلها من صفحة الفواتير في أي وقت."
        },
        {
          question: "هل يمكنني الحصول على فاتورة ضريبية؟",
          answer: "نعم، جميع الفواتير الصادرة من النظام تتضمن الضريبة المضافة وتكون متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك."
        },
        {
          question: "كيف يتم حساب التكلفة؟",
          answer: "يتم احتساب التكلفة بناءً على نوع الخدمة، تعقيد المشكلة، المواد المستخدمة، ووقت العمل. ستحصل على تقدير مبدئي قبل بدء العمل، والفاتورة النهائية بعد الانتهاء."
        }
      ]
    },
    {
      category: "الدعم الفني",
      questions: [
        {
          question: "كيف أتواصل مع الدعم الفني؟",
          answer: "يمكنك التواصل معنا عبر: الهاتف 920000000 (متاح 24/7)، البريد الإلكتروني support@maintenance.app، أو من خلال الشات بوت الذكي في النظام."
        },
        {
          question: "ما هي أوقات عمل الدعم الفني؟",
          answer: "خدمة الدعم الفني متاحة 24 ساعة طوال أيام الأسبوع للحالات الطارئة. أما الاستفسارات العامة فيتم الرد عليها خلال ساعات العمل الرسمية من الساعة 8 صباحاً حتى 10 مساءً."
        },
        {
          question: "كم من الوقت يستغرق الرد على الاستفسارات؟",
          answer: "نسعى للرد على جميع الاستفسارات في أقل من ساعة واحدة. في حالات الطوارئ، يكون الرد فورياً."
        },
        {
          question: "هل يوجد فيديوهات تعليمية؟",
          answer: "نعم، لدينا مكتبة فيديوهات تعليمية توضح كيفية استخدام جميع ميزات النظام. يمكنك الوصول إليها من قسم المساعدة أو على قناتنا على اليوتيوب."
        }
      ]
    },
    {
      category: "الأمان والخصوصية",
      questions: [
        {
          question: "كيف يتم حماية بياناتي الشخصية؟",
          answer: "نستخدم تشفير SSL للاتصالات، وجميع البيانات الحساسة محفوظة بشكل مشفر في قواعد بيانات آمنة. نلتزم بسياسة صارمة لحماية الخصوصية ولا نشارك بياناتك مع أي طرف ثالث بدون إذنك."
        },
        {
          question: "هل يمكن للفنيين الوصول لمعلوماتي الشخصية؟",
          answer: "الفنيون يحصلون فقط على المعلومات الضرورية لتنفيذ المهمة (الاسم، العنوان، رقم الهاتف). المعلومات المالية والبيانات الحساسة الأخرى محمية ولا يمكن الوصول إليها."
        },
        {
          question: "كيف أغير كلمة المرور؟",
          answer: "من صفحة الإعدادات، اختر 'الأمان'، ثم 'تغيير كلمة المرور'. ستحتاج لإدخال كلمة المرور القديمة وتأكيد كلمة المرور الجديدة."
        },
        {
          question: "ماذا أفعل إذا نسيت كلمة المرور؟",
          answer: "في صفحة تسجيل الدخول، اضغط على 'نسيت كلمة المرور'. ستصلك رسالة على بريدك الإلكتروني تحتوي على رابط لإعادة تعيين كلمة المرور."
        }
      ]
    }
  ];

  const filteredCategories = categories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">الأسئلة الشائعة</h1>
            <p className="text-muted-foreground mt-1">إجابات على الأسئلة الأكثر شيوعاً</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/documentation')}>
          العودة للتوثيق
        </Button>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>ابحث في الأسئلة الشائعة</CardTitle>
          <CardDescription>اكتب سؤالك أو كلمة مفتاحية للبحث</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن سؤال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لم يتم العثور على أسئلة مطابقة لبحثك
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {filteredCategories.map((category, categoryIndex) => (
                <AccordionItem key={categoryIndex} value={`category-${categoryIndex}`}>
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {category.category}
                      <span className="text-sm text-muted-foreground mr-2">
                        ({category.questions.length} سؤال)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Accordion type="multiple" className="pr-6">
                      {category.questions.map((item, itemIndex) => (
                        <AccordionItem key={itemIndex} value={`question-${categoryIndex}-${itemIndex}`}>
                          <AccordionTrigger className="text-base font-medium">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
