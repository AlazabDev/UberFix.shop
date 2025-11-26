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
import { MapPin, Send, CheckCircle2, Building2, Search, Phone, User, Upload, QrCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const quickRequestSchema = z.object({
  client_name: z.string().min(2, "الاسم مطلوب"),
  client_phone: z.string().min(10, "رقم الهاتف مطلوب"),
  country: z.string().optional(),
  services: z.array(z.string()).min(1, "يرجى اختيار خدمة واحدة على الأقل"),
  description: z.string().min(5, "الملاحظات مطلوبة"),
  preferred_date: z.string().optional(),
});

type QuickRequestFormData = z.infer<typeof quickRequestSchema>;

type TrackedRequest = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  description?: string | null;
  priority?: string | null;
};

interface QuickRequestFormProps {
  property: {
    id: string;
    name: string;
    address: string;
    type?: string;
  };
  locale: string;
}

const SERVICES = [
  { id: "plumbing", name_ar: "سباكة", name_en: "Plumbing", icon: "🔧" },
  { id: "electrical", name_ar: "كهرباء", name_en: "Electrical", icon: "⚡" },
  { id: "ac", name_ar: "تكييف", name_en: "AC", icon: "❄️" },
  { id: "carpentry", name_ar: "نجارة", name_en: "Carpentry", icon: "🪚" },
  { id: "metalwork", name_ar: "حدادات", name_en: "Metalwork", icon: "🔨" },
];

export function QuickRequestForm({ property, locale }: QuickRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState<string | null>(null);
  const [trackingPhone, setTrackingPhone] = useState("");
  const [trackingResults, setTrackingResults] = useState<TrackedRequest[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<"request" | "track">("request");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const isArabic = locale === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<QuickRequestFormData>({
    resolver: zodResolver(quickRequestSchema),
    defaultValues: {
      country: "جمهورية مصر العربية",
      services: [],
    },
  });

  // Generate next 7 days for date selection
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getDayName = (date: Date) => {
    const days_ar = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const days_en = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return isArabic ? days_ar[date.getDay()] : days_en[date.getDay()];
  };

  const toggleService = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    setSelectedServices(newServices);
    setValue('services', newServices);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (requestId: string) => {
    if (files.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${requestId}/${Date.now()}-${i}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('maintenance-attachments')
        .upload(fileName, file);

      if (!uploadError && data) {
        const { data: urlData } = supabase.storage
          .from('maintenance-attachments')
          .getPublicUrl(data.path);
        
        uploadedUrls.push(urlData.publicUrl);
      }
      
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: QuickRequestFormData) => {
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Get first available company and branch
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1);

      const companyId = companies?.[0]?.id;
      if (!companyId) {
        throw new Error('No company found in system');
      }

      const { data: branches } = await supabase
        .from('branches')
        .select('id')
        .eq('company_id', companyId)
        .limit(1);

      const branchId = branches?.[0]?.id;
      if (!branchId) {
        throw new Error('No branch found in system');
      }

      // Create maintenance request with all data
      const serviceNames = selectedServices.map(id => 
        SERVICES.find(s => s.id === id)?.[isArabic ? 'name_ar' : 'name_en'] || id
      ).join(', ');

      const requestData = {
        branch_id: branchId,
        company_id: companyId,
        property_id: property.id,
        title: `${isArabic ? 'طلب صيانة -' : 'Maintenance Request -'} ${serviceNames}`,
        description: `${data.description}\n\n${isArabic ? 'الخدمات المطلوبة:' : 'Requested Services:'} ${serviceNames}${selectedDate ? `\n${isArabic ? 'التاريخ المفضل:' : 'Preferred Date:'} ${selectedDate}` : ''}`,
        client_name: data.client_name,
        client_phone: data.client_phone,
        location: `${property.address}${data.country ? `, ${data.country}` : ''}`,
        priority: 'medium',
        channel: 'qr_code',
        status: 'Open' as const,
        customer_notes: data.description,
      };

      const { data: createdRequest, error: requestError } = await supabase
        .from('maintenance_requests')
        .insert([requestData])
        .select('id')
        .single();

      if (requestError) throw requestError;

      if (createdRequest) {
        setRequestNumber(createdRequest.id);
        
        // Upload files if any
        if (files.length > 0) {
          await uploadFiles(createdRequest.id);
        }
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
      setUploadProgress(0);
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

      setTrackingResults((data as TrackedRequest[]) || []);
      
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
              <p className="text-lg font-bold text-primary font-mono">{requestNumber.slice(0, 8)}</p>
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
    <Card className="shadow-xl border-border/50 max-w-3xl mx-auto">
      {/* Header with Property Info and QR Access Badge */}
      <CardHeader className="border-b border-border/30 bg-gradient-to-br from-primary/5 to-primary/10 pb-6 space-y-4">
        {/* Title */}
        <div className="text-center border-b border-border/20 pb-3">
          <a href="https://uberfix.shop" className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2 text-base font-semibold">
            ← {isArabic ? "تبعنا هنا" : "Follow Us"}
          </a>
          <h2 className="text-lg font-bold text-foreground mt-2">
            {isArabic ? "لديك طلب صيانة؟" : "Have a Maintenance Request?"}
          </h2>
        </div>

        {/* User Avatar Section */}
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-border/30">
          <div className="bg-muted rounded-full p-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {isArabic ? "صاحب الطلب" : "Request Owner"}
            </p>
            <p className="font-bold text-lg text-foreground">Mohamed Azab</p>
          </div>
          <Button size="sm" variant="default" className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
            <QrCode className="h-4 w-4" />
            {isArabic ? "الوصول عبر QR" : "QR Access"}
          </Button>
        </div>

        {/* Property Info */}
        <div className="flex items-start gap-3 bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/20">
          <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1 text-right" dir="rtl">
            <h3 className="font-bold text-foreground text-base">{property.name}</h3>
            <p className="text-sm text-muted-foreground">{property.address}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6">
        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as "request" | "track")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
            <TabsTrigger value="request" className="text-sm font-medium">
              <Send className="h-4 w-4 ml-2" />
              {isArabic ? "تقديم طلب صيانة" : "Submit Request"}
            </TabsTrigger>
            <TabsTrigger value="track" className="text-sm font-medium">
              <Search className="h-4 w-4 ml-2" />
              {isArabic ? "تتبع الطلبات" : "Track Requests"}
            </TabsTrigger>
          </TabsList>

          {/* New Request Tab */}
          <TabsContent value="request" className="mt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name and Country Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-right block" dir="rtl">
                    {isArabic ? "الاسم" : "Name"}
                    <span className="text-destructive mr-1">*</span>
                  </Label>
                  <Input
                    {...register("client_name")}
                    placeholder="Alazabco"
                    className="h-11 border-border/50 text-right"
                    dir="rtl"
                  />
                  {errors.client_name && (
                    <p className="text-xs text-destructive text-right">{errors.client_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-right block" dir="rtl">
                    {isArabic ? "الدولة" : "Country"}
                    <span className="text-destructive mr-1">*</span>
                  </Label>
                  <Select defaultValue="جمهورية مصر العربية" onValueChange={(value) => setValue('country', value)}>
                    <SelectTrigger className="h-11 border-border/50 text-right">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="جمهورية مصر العربية">جمهورية مصر العربية</SelectItem>
                      <SelectItem value="المملكة العربية السعودية">المملكة العربية السعودية</SelectItem>
                      <SelectItem value="الإمارات العربية المتحدة">الإمارات العربية المتحدة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-right block" dir="rtl">
                  {isArabic ? "رقم الهاتف" : "Phone Number"}
                  <span className="text-destructive mr-1">*</span>
                </Label>
                <div className="relative">
                  <Input
                    {...register("client_phone")}
                    placeholder="1004006620 (20+)"
                    className="h-12 border-border/50 pr-10 text-right"
                    dir="ltr"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-green-500 rounded-full p-1">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                </div>
                {errors.client_phone && (
                  <p className="text-xs text-destructive text-right">{errors.client_phone.message}</p>
                )}
              </div>

              {/* Services Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between" dir="rtl">
                  <Label className="text-sm font-medium">
                    {isArabic ? "اختر الخدمات الأخرى" : "Select Additional Services"}
                    <span className="text-destructive mr-1">*</span>
                  </Label>
                  <button
                    type="button"
                    className="text-orange-500 text-sm hover:text-orange-600 flex items-center gap-1"
                  >
                    {isArabic ? "خدمات أخرى" : "Other Services"}
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {selectedServices.length}
                    </span>
                  </button>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-5 gap-3">
                  {SERVICES.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        selectedServices.includes(service.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border/50 hover:border-border'
                      }`}
                    >
                      <div className="text-3xl">{service.icon}</div>
                      <span className="text-xs font-medium text-center">
                        {isArabic ? service.name_ar : service.name_en}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.services && (
                  <p className="text-xs text-destructive text-right">{errors.services.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-right block" dir="rtl">
                  {isArabic ? "الملاحظات" : "Notes"}
                  <span className="text-destructive mr-1">*</span>
                </Label>
                <Textarea
                  {...register("description")}
                  placeholder={isArabic ? "اوصف المشكلة التي تواجهها..." : "Describe the problem you're facing..."}
                  className="min-h-[100px] border-border/50 resize-none text-right"
                  dir="rtl"
                />
                {errors.description && (
                  <p className="text-xs text-destructive text-right">{errors.description.message}</p>
                )}
              </div>

              {/* Preferred Date */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-right block" dir="rtl">
                  {isArabic ? "الموعد المفضل" : "Preferred Date"}
                </Label>
                <div className="relative">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {getNextDays().map((date, index) => {
                      const dateStr = date.toISOString().split('T')[0];
                      const isSelected = selectedDate === dateStr;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedDate(dateStr)}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-border/50 hover:border-border bg-background'
                          }`}
                        >
                          <span className="text-xs opacity-80">{isArabic ? 'ديسمبر' : 'December'}</span>
                          <span className="text-2xl font-bold">{date.getDate()}</span>
                          <span className="text-xs opacity-80">{getDayName(date).slice(0, 3)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-right block" dir="rtl">
                  {isArabic ? "المرفقات (اختياري)" : "Attachments (Optional)"}
                </Label>
                <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-border transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-primary/10 p-4 rounded-full">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {isArabic ? "اضغر لرفع الملفات" : "Click to upload files"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? "او" : "or"}
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        {isArabic ? "التقط صورة" : "Take Photo"}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        {isArabic 
                          ? "الصور والمستنداعات: فقط (حد أقصى 20 ميجابايت لكل ملف)"
                          : "Images and Documents: Only (Max 20MB per file)"}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Files Preview */}
                {files.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="border border-border/50 rounded-lg p-2">
                          <p className="text-xs truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{isArabic ? "جاري الرفع..." : "Uploading..."}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isArabic ? "جاري الإرسال..." : "Sending..."}</span>
                  </div>
                ) : (
                  <span>{isArabic ? "تقديم" : "Submit"}</span>
                )}
              </Button>

              {/* Footer */}
              <div className="bg-muted/30 border border-border/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <img src="/logo/uberfix-logo.png" alt="UberFix" className="h-6" />
                  <span className="text-xs text-muted-foreground">
                    {isArabic ? "مدعوم بواسطة" : "Powered by"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isArabic 
                    ? "سيتم التواصل معك خلال 24 ساعة من إرسال الطلب"
                    : "We will contact you within 24 hours"}
                </p>
              </div>
            </form>
          </TabsContent>

          {/* Track Requests Tab */}
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
