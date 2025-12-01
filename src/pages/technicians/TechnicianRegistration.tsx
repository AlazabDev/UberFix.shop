import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2 } from "lucide-react";

const registrationSchema = z.object({
  full_name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  phone: z.string().regex(/^[0-9]{11}$/, "رقم الهاتف يجب أن يكون 11 رقم"),
  national_id: z.string().regex(/^[0-9]{14}$/, "الرقم القومي يجب أن يكون 14 رقم"),
  city_id: z.string().min(1, "اختر المحافظة"),
  district_id: z.string().min(1, "اختر المدينة"),
  specialization: z.string().min(1, "اختر التخصص"),
  years_of_experience: z.string().min(1, "أدخل سنوات الخبرة"),
  alternative_contact: z.string().optional(),
  home_address: z.string().min(10, "العنوان يجب أن يكون 10 أحرف على الأقل"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function TechnicianRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      national_id: "",
      city_id: "",
      district_id: "",
      specialization: "",
      years_of_experience: "0",
      alternative_contact: "",
      home_address: "",
    },
  });

  const onSubmit = async (data: RegistrationForm) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "خطأ",
          description: "يجب تسجيل الدخول أولاً",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("technician_applications")
        .insert({
          user_id: user.id,
          full_name: data.full_name,
          phone: data.phone,
          national_id: data.national_id,
          city_id: parseInt(data.city_id),
          district_id: parseInt(data.district_id),
          specialization: data.specialization,
          years_of_experience: parseInt(data.years_of_experience),
          alternative_contact: data.alternative_contact,
          home_address: data.home_address,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "تم التسجيل بنجاح",
        description: "سيتم مراجعة طلبك والتواصل معك قريباً",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl">تسجيل فني جديد</CardTitle>
            <CardDescription className="text-lg">
              ابدأ رحلتك مع UberFix كفني محترف
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أحمد محمد علي" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="01234567890" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="national_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرقم القومي *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="12345678901234" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المحافظة *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المحافظة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">القاهرة</SelectItem>
                            <SelectItem value="2">الجيزة</SelectItem>
                            <SelectItem value="3">الإسكندرية</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدينة *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المدينة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">مدينة نصر</SelectItem>
                            <SelectItem value="2">المعادي</SelectItem>
                            <SelectItem value="3">مصر الجديدة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التخصص *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التخصص" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="plumber">سباكة</SelectItem>
                            <SelectItem value="electrician">كهرباء</SelectItem>
                            <SelectItem value="carpenter">نجارة</SelectItem>
                            <SelectItem value="painter">دهانات</SelectItem>
                            <SelectItem value="ac_tech">تكييفات</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="years_of_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سنوات الخبرة *</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" placeholder="5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="alternative_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وسيلة تواصل بديلة (اختياري)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="رقم هاتف أو بريد إلكتروني" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="home_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان السكن *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="العنوان بالتفصيل" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    "تسجيل كفني"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
