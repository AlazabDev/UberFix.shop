import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CheckCircle, Loader2, ArrowRight, Wrench, Zap, Droplets, Wind, ClipboardCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";

const bookingSchema = z.object({
  full_name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(100),
  email: z.string().email("البريد الإلكتروني غير صحيح").max(255),
  phone: z.string().min(10, "رقم الهاتف غير صحيح").max(20),
  service_type: z.string().min(1, "يرجى اختيار نوع الخدمة"),
  preferred_date: z.string().min(1, "يرجى اختيار التاريخ"),
  preferred_time: z.string().min(1, "يرجى اختيار الوقت"),
  message: z.string().max(1000).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const serviceTypes = [
  { value: "maintenance", label: "صيانة عامة", icon: Wrench, color: "text-blue-500" },
  { value: "ac", label: "تكييف وتبريد", icon: Wind, color: "text-cyan-500" },
  { value: "electrical", label: "كهرباء", icon: Zap, color: "text-yellow-500" },
  { value: "plumbing", label: "سباكة", icon: Droplets, color: "text-indigo-500" },
  { value: "consulting", label: "استشارة فنية", icon: ClipboardCheck, color: "text-green-500" },
  { value: "inspection", label: "فحص ومعاينة", icon: ClipboardCheck, color: "text-orange-500" },
  { value: "other", label: "أخرى", icon: HelpCircle, color: "text-gray-500" },
];

const timeSlots = [
  "09:00 صباحاً",
  "10:00 صباحاً",
  "11:00 صباحاً",
  "12:00 ظهراً",
  "01:00 مساءً",
  "02:00 مساءً",
  "03:00 مساءً",
  "04:00 مساءً",
  "05:00 مساءً",
  "06:00 مساءً",
];

export default function BookConsultation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      service_type: "",
      preferred_date: "",
      preferred_time: "",
      message: "",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Insert booking into database
      const { data: booking, error: dbError } = await supabase
        .from("consultation_bookings")
        .insert({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          service_type: data.service_type,
          preferred_date: data.preferred_date,
          preferred_time: data.preferred_time,
          message: data.message || null,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Send notifications
      const { error: notifError } = await supabase.functions.invoke("send-booking-notification", {
        body: {
          ...data,
          booking_id: booking.id,
        },
      });

      if (notifError) {
        console.error("Notification error:", notifError);
        // Don't throw - booking was saved successfully
      }

      setIsSuccess(true);
      toast({
        title: "تم الحجز بنجاح! ✅",
        description: "سنتواصل معك قريباً لتأكيد الموعد",
      });
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "حدث خطأ",
        description: error.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <LandingHeader />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="pt-12 pb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">تم استلام طلب الحجز!</h2>
                <p className="text-muted-foreground mb-8">
                  شكراً لك! سيتواصل معك فريقنا خلال 24 ساعة لتأكيد موعد الاستشارة.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => navigate("/")} variant="outline">
                    العودة للرئيسية
                  </Button>
                  <Button onClick={() => { setIsSuccess(false); form.reset(); }}>
                    حجز آخر
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <LandingHeader />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              احجز استشارتك المجانية
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              استشارة فنية <span className="text-primary">متخصصة</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              فريقنا من الخبراء جاهز لمساعدتك في جميع احتياجاتك الفنية. احجز موعدك الآن واحصل على استشارة مجانية!
            </p>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card className="shadow-xl border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      بيانات الحجز
                    </CardTitle>
                    <CardDescription>
                      املأ البيانات التالية وسنتواصل معك لتأكيد الموعد
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  الاسم الكامل
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="أدخل اسمك الكامل" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  رقم الهاتف
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="01xxxxxxxxx" type="tel" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                البريد الإلكتروني
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="example@email.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Service Type */}
                        <FormField
                          control={form.control}
                          name="service_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نوع الخدمة</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر نوع الخدمة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {serviceTypes.map((service) => (
                                    <SelectItem key={service.value} value={service.value}>
                                      <div className="flex items-center gap-2">
                                        <service.icon className={`w-4 h-4 ${service.color}`} />
                                        {service.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Date & Time */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="preferred_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  التاريخ المفضل
                                </FormLabel>
                                <FormControl>
                                  <Input type="date" min={getMinDate()} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="preferred_time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  الوقت المفضل
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الوقت" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeSlots.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Message */}
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                تفاصيل إضافية (اختياري)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="اكتب أي تفاصيل إضافية تود مشاركتها معنا..."
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full gap-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              جاري الحجز...
                            </>
                          ) : (
                            <>
                              تأكيد الحجز
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Why Choose Us */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg">لماذا تختارنا؟</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { icon: "✅", text: "استشارة مجانية 100%" },
                      { icon: "⏱️", text: "رد خلال 24 ساعة" },
                      { icon: "👨‍🔧", text: "خبراء متخصصون" },
                      { icon: "🛡️", text: "ضمان جودة الخدمة" },
                      { icon: "💬", text: "دعم فني متواصل" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm font-medium">{item.text}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">تواصل معنا</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <a
                      href="tel:+201004006620"
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">اتصل بنا</p>
                        <p className="font-medium" dir="ltr">+20 100 400 6620</p>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/201004006620"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">واتساب</p>
                        <p className="font-medium text-green-600">تحدث معنا الآن</p>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
