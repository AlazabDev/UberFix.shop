import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageSquare, CheckCircle, Loader2, ArrowRight, Wrench, Zap, Droplets, Wind, ClipboardCheck, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";
import { format, addDays, isSameDay } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  { value: "08:00", label: "8:00 صباحاً" },
  { value: "08:30", label: "8:30 صباحاً" },
  { value: "09:00", label: "9:00 صباحاً" },
  { value: "09:30", label: "9:30 صباحاً" },
  { value: "10:00", label: "10:00 صباحاً" },
  { value: "10:30", label: "10:30 صباحاً" },
  { value: "11:00", label: "11:00 صباحاً" },
  { value: "11:30", label: "11:30 صباحاً" },
  { value: "12:00", label: "12:00 ظهراً" },
  { value: "13:00", label: "1:00 مساءً" },
  { value: "14:00", label: "2:00 مساءً" },
  { value: "15:00", label: "3:00 مساءً" },
  { value: "16:00", label: "4:00 مساءً" },
  { value: "17:00", label: "5:00 مساءً" },
];

export default function BookConsultation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
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

      const { error: notifError } = await supabase.functions.invoke("send-booking-notification", {
        body: {
          ...data,
          booking_id: booking.id,
        },
      });

      if (notifError) {
        console.error("Notification error:", notifError);
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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      form.setValue("preferred_date", format(date, "yyyy-MM-dd"));
    }
    setSelectedTime(null);
    form.setValue("preferred_time", "");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    form.setValue("preferred_time", time);
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      setStep(2);
    } else {
      toast({
        title: "يرجى اختيار الموعد",
        description: "حدد التاريخ والوقت المناسب للاستشارة",
        variant: "destructive",
      });
    }
  };

  const tomorrow = addDays(new Date(), 1);

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
                  <Button onClick={() => { setIsSuccess(false); setStep(1); setSelectedDate(undefined); setSelectedTime(null); form.reset(); }}>
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
        {/* Header Section */}
        <section className="py-8 bg-gradient-to-b from-muted/50 to-background border-b">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Mohamed Azab</h1>
              <p className="text-muted-foreground">صفحة الحجز</p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {step === 1 ? (
            <>
              {/* Meeting Type Selection */}
              <section className="max-w-3xl mx-auto mb-8">
                <h2 className="text-center text-lg font-semibold mb-4">اختيار نوع الاجتماع</h2>
                <Card className="border-2 border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Alazab Team Manager 🏢</h3>
                        <p className="text-sm text-muted-foreground">احجز الوقت للاتصال بي</p>
                      </div>
                      <span className="text-sm text-muted-foreground">ساعة واحدة</span>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Calendar & Time Selection */}
              <section className="max-w-4xl mx-auto">
                <h2 className="text-center text-lg font-semibold mb-6">الأوقات المتاحة</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <Card>
                    <CardContent className="p-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < tomorrow}
                        locale={ar}
                        className="pointer-events-auto"
                        classNames={{
                          head_cell: "text-muted-foreground font-normal text-center w-9",
                          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-r-md last:[&:has([aria-selected])]:rounded-l-md focus-within:relative focus-within:z-20",
                          day: cn(
                            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md"
                          ),
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day_disabled: "text-muted-foreground opacity-50",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          caption: "flex justify-center pt-1 relative items-center",
                        }}
                      />
                    </CardContent>
                  </Card>

                  {/* Time Slots */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {selectedDate 
                          ? format(selectedDate, "EEEE، d MMMM", { locale: ar })
                          : "اختر التاريخ أولاً"
                        }
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[320px] overflow-y-auto">
                      {selectedDate ? (
                        timeSlots.map((slot) => (
                          <button
                            key={slot.value}
                            onClick={() => handleTimeSelect(slot.value)}
                            className={cn(
                              "w-full py-3 px-4 rounded-lg border text-right transition-all",
                              selectedTime === slot.value
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            {slot.label}
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>حدد تاريخاً من التقويم لعرض الأوقات المتاحة</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center mt-8">
                  <Button 
                    size="lg" 
                    onClick={handleContinue}
                    disabled={!selectedDate || !selectedTime}
                    className="gap-2 px-8"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </section>
            </>
          ) : (
            /* Step 2: Contact Form */
            <section className="max-w-2xl mx-auto">
              <Button 
                variant="ghost" 
                onClick={() => setStep(1)}
                className="mb-4 gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                رجوع للتقويم
              </Button>

              {/* Selected Appointment Summary */}
              <Card className="mb-6 bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">موعدك المحدد</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDate && format(selectedDate, "EEEE، d MMMM yyyy", { locale: ar })} - {timeSlots.find(t => t.value === selectedTime)?.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    بياناتك الشخصية
                  </CardTitle>
                  <CardDescription>
                    أكمل بياناتك لتأكيد الحجز
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                                rows={3}
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
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
