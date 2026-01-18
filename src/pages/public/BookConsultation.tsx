import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { format, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageSquare, CheckCircle, Loader2, ChevronLeft, ChevronRight, Globe, Video, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  full_name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل").max(100),
  email: z.string().email("البريد الإلكتروني غير صحيح").max(255),
  phone: z.string().min(10, "رقم الهاتف غير صحيح").max(20),
  message: z.string().max(1000).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const meetingTypes = [
  { 
    id: "consultation", 
    title: "Alazab Team Manager 📊", 
    duration: "ساعة واحدة", 
    description: "احجز الوقت للاتصال بي",
    color: "bg-blue-500"
  },
];

const timeSlots = [
  "8:10 صباحاً",
  "8:40 صباحاً",
  "9:10 صباحاً",
  "9:40 صباحاً",
  "10:10 صباحاً",
  "10:40 صباحاً",
  "11:10 صباحاً",
  "11:40 صباحاً",
  "12:10 ظهراً",
  "12:40 ظهراً",
  "1:10 مساءً",
  "1:40 مساءً",
  "2:10 مساءً",
  "2:40 مساءً",
  "3:10 مساءً",
];

export default function BookConsultation() {
  const [step, setStep] = useState<"meeting" | "datetime" | "details" | "success">("meeting");
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding for days before the first day of month
    const startDayOfWeek = getDay(start);
    const paddingDays = Array(startDayOfWeek).fill(null);
    
    return [...paddingDays, ...days];
  }, [currentMonth]);

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || getDay(date) === 5; // Disable past dates and Fridays
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedDate || !selectedTime) return;
    
    setIsSubmitting(true);
    try {
      const { data: booking, error: dbError } = await supabase
        .from("consultation_bookings")
        .insert({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          service_type: selectedMeeting || "consultation",
          preferred_date: format(selectedDate, "yyyy-MM-dd"),
          preferred_time: selectedTime,
          message: data.message || null,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const { error: notifError } = await supabase.functions.invoke("send-booking-notification", {
        body: {
          ...data,
          service_type: selectedMeeting || "consultation",
          preferred_date: format(selectedDate, "yyyy-MM-dd"),
          preferred_time: selectedTime,
          booking_id: booking.id,
        },
      });

      if (notifError) {
        console.error("Notification error:", notifError);
      }

      setStep("success");
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

  const weekDays = ["س", "ن", "ث", "ر", "خ", "ج", "ح"];

  // Success Screen
  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">تم الحجز بنجاح!</h2>
            <p className="text-muted-foreground mb-2">
              {selectedDate && format(selectedDate, "EEEE, d MMMM yyyy", { locale: ar })}
            </p>
            <p className="text-muted-foreground mb-8">
              الساعة {selectedTime}
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الموعد
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate("/")} variant="outline">
                العودة للرئيسية
              </Button>
              <Button onClick={() => { 
                setStep("meeting"); 
                setSelectedDate(null);
                setSelectedTime(null);
                form.reset(); 
              }}>
                حجز موعد آخر
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-8 border-b">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            MA
          </div>
          <h1 className="text-2xl font-bold text-foreground">Mohamed Azab</h1>
          <p className="text-muted-foreground">صفحة الحجز</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step 1: Meeting Type Selection */}
        {step === "meeting" && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-8">اختيار نوع الاجتماع</h2>
            <div className="max-w-md mx-auto space-y-4">
              {meetingTypes.map((meeting) => (
                <button
                  key={meeting.id}
                  onClick={() => {
                    setSelectedMeeting(meeting.id);
                    setStep("datetime");
                  }}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-right transition-all hover:shadow-md",
                    "bg-white dark:bg-card border-primary/30 hover:border-primary",
                    "flex items-center justify-between gap-4"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm">{meeting.duration}</span>
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground">{meeting.description}</p>
                  </div>
                  <div className={cn("w-1 h-12 rounded-full", meeting.color)} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === "datetime" && (
          <div>
            <button 
              onClick={() => setStep("meeting")}
              className="flex items-center gap-2 text-primary mb-6 hover:underline"
            >
              <ChevronRight className="w-4 h-4" />
              رجوع
            </button>

            <div className="bg-white dark:bg-card rounded-xl shadow-sm border overflow-hidden">
              {/* Meeting Info Bar */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Video className="w-4 h-4" />
                  <span>مكالمة فيديو</span>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold">Alazab Team Manager 📊</h3>
                  <p className="text-sm text-muted-foreground">ساعة واحدة • احجز الوقت للاتصال بي</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse">
                {/* Time Slots */}
                <div className="p-6 order-2 md:order-1">
                  <h3 className="font-semibold mb-4 text-right">الأوقات المتاحة</h3>
                  {selectedDate ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => {
                            setSelectedTime(time);
                            setStep("details");
                          }}
                          className={cn(
                            "w-full py-3 px-4 rounded-lg border text-center transition-all",
                            "hover:border-primary hover:bg-primary/5",
                            selectedTime === time 
                              ? "border-primary bg-primary/10 text-primary font-medium" 
                              : "border-border bg-white dark:bg-card"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      اختر تاريخاً من التقويم
                    </p>
                  )}
                </div>

                {/* Calendar */}
                <div className="p-6 order-1 md:order-2">
                  <div className="flex items-center justify-between mb-4">
                    <button 
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <h3 className="font-semibold">
                      {format(currentMonth, "MMMM yyyy", { locale: ar })}
                    </h3>
                    <button 
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="p-2 hover:bg-muted rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Week days header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day, i) => (
                      <div key={i} className="text-center text-xs text-muted-foreground py-2 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                      if (!day) {
                        return <div key={`empty-${i}`} className="aspect-square" />;
                      }
                      
                      const isDisabled = isDateDisabled(day);
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, new Date());

                      return (
                        <button
                          key={day.toISOString()}
                          disabled={isDisabled}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "aspect-square rounded-full flex items-center justify-center text-sm transition-all",
                            isDisabled && "text-muted-foreground/40 cursor-not-allowed",
                            !isDisabled && "hover:bg-primary/10 cursor-pointer",
                            isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                            isToday && !isSelected && "border border-primary text-primary"
                          )}
                        >
                          {format(day, "d")}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => {
                        setCurrentMonth(new Date());
                        setSelectedDate(new Date());
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      اليوم
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-4 flex items-center justify-between bg-gray-50 dark:bg-muted/50">
                <Button 
                  onClick={() => selectedDate && selectedTime && setStep("details")}
                  disabled={!selectedDate || !selectedTime}
                >
                  التالي
                  <ChevronLeft className="w-4 h-4 mr-2" />
                </Button>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>توقيت القاهرة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === "details" && (
          <div>
            <button 
              onClick={() => setStep("datetime")}
              className="flex items-center gap-2 text-primary mb-6 hover:underline"
            >
              <ChevronRight className="w-4 h-4" />
              رجوع
            </button>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Booking Summary */}
              <div className="md:col-span-1">
                <Card className="sticky top-6">
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xl font-bold">
                        MA
                      </div>
                      <h3 className="font-semibold">Mohamed Azab</h3>
                    </div>
                    
                    <div className="space-y-4 text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>Alazab Team Manager</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>ساعة واحدة</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{selectedDate && format(selectedDate, "EEEE, d MMMM yyyy", { locale: ar })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span>توقيت القاهرة</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Form */}
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-6">أدخل بياناتك</h2>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                الاسم الكامل *
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
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                البريد الإلكتروني *
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
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                رقم الهاتف *
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="01xxxxxxxxx" type="tel" {...field} />
                              </FormControl>
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
                                ملاحظات إضافية (اختياري)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="أي معلومات إضافية تود مشاركتها..."
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
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin ml-2" />
                              جاري تأكيد الحجز...
                            </>
                          ) : (
                            "تأكيد الحجز"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} UberFix - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
