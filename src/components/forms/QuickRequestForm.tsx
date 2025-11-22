import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Send, CheckCircle2, Building2 } from "lucide-react";

const quickRequestSchema = z.object({
  client_name: z.string().min(2, "الاسم مطلوب"),
  client_phone: z.string().min(10, "رقم الهاتف مطلوب"),
  description: z.string().min(5, "وصف المشكلة مطلوب"),
});

type QuickRequestFormData = z.infer<typeof quickRequestSchema>;

interface QuickRequestFormProps {
  property: {
    id: string;
    name: string;
    address: string;
  };
  locale: string;
}

export function QuickRequestForm({ property, locale }: QuickRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isArabic = locale === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuickRequestFormData>({
    resolver: zodResolver(quickRequestSchema),
  });

  const onSubmit = async (data: QuickRequestFormData) => {
    setLoading(true);
    try {
      // Get default company and branch
      const { data: { user } } = await supabase.auth.getUser();
      let companyId = 'default-company';
      let branchId = 'default-branch';

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();

        if (profile?.company_id) {
          companyId = profile.company_id;
          
          const { data: branches } = await supabase
            .from('branches')
            .select('id')
            .eq('company_id', companyId)
            .limit(1);

          if (branches && branches.length > 0) {
            branchId = branches[0].id;
          }
        }
      }

      // Create maintenance request  
      const requestData = {
        branch_id: branchId,
        company_id: companyId,
        property_id: property.id,
        title: `طلب صيانة سريع - ${property.name}`,
        description: data.description,
        client_name: data.client_name,
        client_phone: data.client_phone,
        location: property.address,
        priority: 'medium',
        channel: 'qr_code',
        status: 'Open' as const,
      };

      const { error: requestError } = await supabase
        .from('maintenance_requests')
        .insert([requestData]);

      if (requestError) throw requestError;

      setSubmitted(true);
      toast.success(
        isArabic 
          ? "✅ تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً" 
          : "✅ Request submitted successfully! We'll contact you soon"
      );
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(
        isArabic 
          ? "❌ حدث خطأ أثناء إرسال الطلب" 
          : "❌ Error submitting request"
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="pt-16 pb-16 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-success/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative bg-success/10 p-6 rounded-full border-2 border-success/30">
                <CheckCircle2 className="h-20 w-20 text-success" />
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {isArabic ? "تم إرسال طلبك بنجاح!" : "Request Submitted Successfully!"}
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            {isArabic 
              ? "شكراً لثقتك في UberFix. سيتواصل معك فريقنا في أقرب وقت ممكن."
              : "Thank you for trusting UberFix. Our team will contact you as soon as possible."}
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 max-w-md mx-auto">
            <div className="flex items-start gap-3 text-right">
              <Building2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">{property.name}</p>
                <p className="text-sm text-muted-foreground">{property.address}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => window.location.href = '/'}
            className="mt-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8"
            size="lg"
          >
            {isArabic ? "العودة للصفحة الرئيسية" : "Back to Home"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="text-center space-y-3 py-4">
          <div className="flex items-center justify-center gap-3">
            <Building2 className="h-8 w-8" />
            <h1 className="text-3xl font-bold">
              {isArabic ? "طلب صيانة سريع" : "Quick Maintenance Request"}
            </h1>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-2xl mx-auto">
            <p className="text-xl font-semibold mb-2">{property.name}</p>
            <div className="flex items-center gap-2 justify-center text-sm text-primary-foreground/80">
              <MapPin className="h-4 w-4" />
              <span>{property.address}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-8 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
          {/* الاسم */}
          <div className="space-y-2">
            <Label htmlFor="client_name" className="text-base font-semibold text-foreground flex items-center gap-2">
              {isArabic ? "الاسم الكامل" : "Full Name"}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client_name"
              {...register("client_name")}
              placeholder={isArabic ? "أدخل اسمك الكامل" : "Enter your full name"}
              className="h-12 text-base border-2 focus:border-primary"
              dir={isArabic ? "rtl" : "ltr"}
            />
            {errors.client_name && (
              <p className="text-sm text-destructive">{errors.client_name.message}</p>
            )}
          </div>

          {/* رقم الهاتف */}
          <div className="space-y-2">
            <Label htmlFor="client_phone" className="text-base font-semibold text-foreground flex items-center gap-2">
              {isArabic ? "رقم الهاتف" : "Phone Number"}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="client_phone"
              {...register("client_phone")}
              placeholder={isArabic ? "مثال: 0501234567" : "Example: 0501234567"}
              className="h-12 text-base border-2 focus:border-primary"
              dir="ltr"
            />
            {errors.client_phone && (
              <p className="text-sm text-destructive">{errors.client_phone.message}</p>
            )}
          </div>

          {/* وصف المشكلة */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold text-foreground flex items-center gap-2">
              {isArabic ? "وصف المشكلة" : "Problem Description"}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder={isArabic ? "اشرح المشكلة بالتفصيل..." : "Describe the problem in detail..."}
              className="min-h-[120px] text-base border-2 focus:border-primary resize-none"
              dir={isArabic ? "rtl" : "ltr"}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* زر الإرسال */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{isArabic ? "جاري الإرسال..." : "Sending..."}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span>{isArabic ? "إرسال الطلب" : "Submit Request"}</span>
                <Send className="h-5 w-5" />
              </div>
            )}
          </Button>

          {/* ملاحظة */}
          <div className="bg-muted/50 border border-border/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {isArabic 
                ? "سيتم التواصل معك خلال 24 ساعة من إرسال الطلب"
                : "We will contact you within 24 hours of submitting the request"}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
