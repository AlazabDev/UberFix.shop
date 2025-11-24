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
import { MapPin, Send, CheckCircle2, Building2, Search, Phone, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    type?: string;
  };
  locale: string;
}

export function QuickRequestForm({ property, locale }: QuickRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState<string | null>(null);
  const [trackingPhone, setTrackingPhone] = useState("");
  const [trackingResults, setTrackingResults] = useState<any[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<"request" | "track">("request");

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
          .maybeSingle();

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

      const { data: createdRequest, error: requestError } = await supabase
        .from('maintenance_requests')
        .insert([requestData])
        .select('id')
        .single();

      if (requestError) throw requestError;

      if (createdRequest) {
        setRequestNumber(createdRequest.id);
      }

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

  const handleTrackRequest = async () => {
    if (!trackingPhone || trackingPhone.length < 10) {
      toast.error(isArabic ? "الرجاء إدخال رقم هاتف صحيح" : "Please enter a valid phone number");
      return;
    }

    setTrackingLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('id, title, status, created_at, description, priority')
        .eq('property_id', property.id)
        .eq('client_phone', trackingPhone)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTrackingResults(data || []);
      
      if (!data || data.length === 0) {
        toast.info(isArabic ? "لا توجد طلبات مسجلة بهذا الرقم" : "No requests found with this number");
      }
    } catch (error) {
      console.error('Error tracking request:', error);
      toast.error(
        isArabic 
          ? "حدث خطأ أثناء البحث عن الطلبات" 
          : "Error searching for requests"
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Open': 'bg-blue-100 text-blue-800 border-blue-200',
      'Assigned': 'bg-purple-100 text-purple-800 border-purple-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { ar: string; en: string }> = {
      'Open': { ar: 'جديد', en: 'New' },
      'Assigned': { ar: 'تم التعيين', en: 'Assigned' },
      'In Progress': { ar: 'قيد التنفيذ', en: 'In Progress' },
      'Completed': { ar: 'مكتمل', en: 'Completed' },
      'Closed': { ar: 'مغلق', en: 'Closed' },
    };
    return isArabic ? statusMap[status]?.ar || status : statusMap[status]?.en || status;
  };

  if (submitted) {
    return (
      <Card className="shadow-xl border-border/50">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-success/10 p-4 rounded-full border-2 border-success/30">
              <CheckCircle2 className="h-16 w-16 text-success" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {isArabic ? "تم إرسال طلبك بنجاح!" : "Request Submitted Successfully!"}
          </h2>
          
          {requestNumber && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-md mx-auto mb-4">
              <p className="text-sm text-muted-foreground mb-1">
                {isArabic ? "رقم الطلب" : "Request Number"}
              </p>
              <p className="text-lg font-bold text-primary font-mono">{requestNumber}</p>
            </div>
          )}
          
          <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto">
            {isArabic 
              ? "شكراً لثقتك في UberFix. سيتواصل معك فريقنا قريباً."
              : "Thank you for trusting UberFix. Our team will contact you soon."}
          </p>

          <div className="bg-muted/30 border border-border/50 rounded-lg p-4 max-w-md mx-auto mb-6">
            <div className="flex items-start gap-3 text-right">
              <Building2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm mb-1">{property.name}</p>
                <p className="text-xs text-muted-foreground">{property.address}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setCurrentTab("track")}
              variant="outline"
              className="w-full max-w-md border-primary/50 hover:bg-primary/5"
            >
              {isArabic ? "تتبع طلباتي" : "Track My Requests"}
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              className="w-full max-w-md"
            >
              {isArabic ? "إرسال طلب جديد" : "Submit New Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-border/50">
      {/* معلومات العقار في الأعلى */}
      <CardHeader className="border-b border-border/30 bg-primary/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 text-right" dir="rtl">
            <h3 className="font-bold text-foreground text-lg">{property.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{property.address}</span>
            </div>
            {property.type && (
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic ? "النوع:" : "Type:"} {property.type}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6">
        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as "request" | "track")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="request" className="text-sm">
              <Send className="h-4 w-4 ml-2" />
              {isArabic ? "طلب جديد" : "New Request"}
            </TabsTrigger>
            <TabsTrigger value="track" className="text-sm">
              <Search className="h-4 w-4 ml-2" />
              {isArabic ? "تتبع الطلبات" : "Track Requests"}
            </TabsTrigger>
          </TabsList>

          {/* تبويب الطلب الجديد */}
          <TabsContent value="request" className="mt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="client_name" className="text-sm font-medium flex items-center gap-2" dir={isArabic ? "rtl" : "ltr"}>
                  <User className="h-4 w-4 text-muted-foreground" />
                  {isArabic ? "الاسم الكامل" : "Full Name"}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client_name"
                  {...register("client_name")}
                  placeholder={isArabic ? "أدخل اسمك الكامل" : "Enter your full name"}
                  className="h-11 border-border/50"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                {errors.client_name && (
                  <p className="text-xs text-destructive">{errors.client_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone" className="text-sm font-medium flex items-center gap-2" dir={isArabic ? "rtl" : "ltr"}>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {isArabic ? "رقم الهاتف" : "Phone Number"}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client_phone"
                  {...register("client_phone")}
                  placeholder={isArabic ? "مثال: 0501234567" : "Example: 0501234567"}
                  className="h-11 border-border/50"
                  dir="ltr"
                />
                {errors.client_phone && (
                  <p className="text-xs text-destructive">{errors.client_phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium" dir={isArabic ? "rtl" : "ltr"}>
                  {isArabic ? "وصف المشكلة" : "Problem Description"}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder={isArabic ? "اشرح المشكلة بالتفصيل..." : "Describe the problem in detail..."}
                  className="min-h-[100px] border-border/50 resize-none"
                  dir={isArabic ? "rtl" : "ltr"}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isArabic ? "جاري الإرسال..." : "Sending..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{isArabic ? "إرسال الطلب" : "Submit Request"}</span>
                    <Send className="h-4 w-4" />
                  </div>
                )}
              </Button>

              <div className="bg-muted/30 border border-border/30 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {isArabic 
                    ? "سيتم التواصل معك خلال 24 ساعة من إرسال الطلب"
                    : "We will contact you within 24 hours"}
                </p>
              </div>
            </form>
          </TabsContent>

          {/* تبويب تتبع الطلبات */}
          <TabsContent value="track" className="mt-0">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="tracking_phone" className="text-sm font-medium flex items-center gap-2" dir={isArabic ? "rtl" : "ltr"}>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {isArabic ? "رقم الهاتف المسجل" : "Registered Phone Number"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tracking_phone"
                    value={trackingPhone}
                    onChange={(e) => setTrackingPhone(e.target.value)}
                    placeholder={isArabic ? "أدخل رقم هاتفك" : "Enter your phone number"}
                    className="h-11 border-border/50"
                    dir="ltr"
                  />
                  <Button
                    onClick={handleTrackRequest}
                    disabled={trackingLoading}
                    className="h-11 px-6 bg-primary hover:bg-primary/90"
                  >
                    {trackingLoading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {trackingResults.length > 0 && (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  <p className="text-sm font-medium text-foreground" dir={isArabic ? "rtl" : "ltr"}>
                    {isArabic ? `تم العثور على ${trackingResults.length} طلب` : `Found ${trackingResults.length} request(s)`}
                  </p>
                  {trackingResults.map((request) => (
                    <div
                      key={request.id}
                      className="border border-border/50 rounded-lg p-4 space-y-2 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1" dir={isArabic ? "rtl" : "ltr"}>
                          <p className="font-semibold text-sm text-foreground">{request.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{request.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-md border font-medium whitespace-nowrap ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
                        <span className="font-mono">{request.id.slice(0, 8)}</span>
                        <span>{new Date(request.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}