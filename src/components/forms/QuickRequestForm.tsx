import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, QrCode, MapPin, Calendar, Upload, Camera, Check } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const quickRequestSchema = z.object({
  client_name: z.string().min(2, "الاسم مطلوب"),
  client_phone: z.string().min(10, "رقم الهاتف مطلوب"),
  country: z.string().min(1, "الدولة مطلوبة"),
  service_type: z.string().optional(),
  description: z.string().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
});

type QuickRequestFormData = z.infer<typeof quickRequestSchema>;

interface QuickRequestFormProps {
  property: any;
  locale: string;
}

export function QuickRequestForm({ property, locale }: QuickRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showQR, setShowQR] = useState(true);

  const isArabic = locale === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuickRequestFormData>({
    resolver: zodResolver(quickRequestSchema),
    defaultValues: {
      client_name: "",
      client_phone: "",
      country: "جمهورية مصر العربية",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 20) {
      toast.error(isArabic ? "الحد الأقصى 20 صورة" : "Maximum 20 images");
      return;
    }

    setImages([...images, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const onSubmit = async (data: QuickRequestFormData) => {
    setLoading(true);
    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, image);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName);
          imageUrls.push(publicUrl);
        }
      }

      // Get user's company and branch
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
      const requestData: any = {
        branch_id: branchId,
        company_id: companyId,
        title: `${property.name} - طلب صيانة`,
        description: data.description || '',
        client_name: data.client_name,
        client_phone: data.client_phone,
        service_type: selectedServices.join(', '),
        location: property.address,
        priority: 'medium',
        channel: 'qr_code',
      };

      const { error } = await supabase
        .from('maintenance_requests')
        .insert(requestData);

      if (error) throw error;

      toast.success(
        isArabic 
          ? "تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً" 
          : "Request submitted successfully! We'll contact you soon"
      );

      // Redirect to a thank you page
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(
        isArabic 
          ? "حدث خطأ أثناء إرسال الطلب" 
          : "Error submitting request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-2xl border-border/50">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-right">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {property.name}
            </h1>
            <div className="flex items-center gap-2 justify-end text-sm text-muted-foreground">
              <span>{property.address}</span>
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          
          {showQR && (
            <Button
              variant="default"
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setShowQR(false)}
            >
              {isArabic ? "الوصول عبر رمز QR" : "Access via QR"}
              <QrCode className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <h2 className="text-xl font-bold text-right mb-6">
          {isArabic ? "تقديم طلب صيانة" : "Submit Maintenance Request"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-right">
              <Label className="text-sm text-muted-foreground mb-2 block">
                {isArabic ? "الدولة *" : "Country *"}
              </Label>
              <Select
                defaultValue="جمهورية مصر العربية"
                onValueChange={(value) => setValue("country", value)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="جمهورية مصر العربية">جمهورية مصر العربية</SelectItem>
                  <SelectItem value="المملكة العربية السعودية">المملكة العربية السعودية</SelectItem>
                  <SelectItem value="الإمارات العربية المتحدة">الإمارات العربية المتحدة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-right">
              <Label className="text-sm text-muted-foreground mb-2 block">
                {isArabic ? "الاسم *" : "Name *"}
              </Label>
              <Input
                {...register("client_name")}
                className="text-right"
                placeholder={isArabic ? "أدخل اسمك" : "Enter your name"}
              />
              {errors.client_name && (
                <p className="text-sm text-destructive mt-1">{errors.client_name.message}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="text-right">
            <Label className="text-sm text-muted-foreground mb-2 block">
              {isArabic ? "رقم الهاتف *" : "Phone Number *"}
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                {...register("client_phone")}
                dir="ltr"
                className="flex-1"
                placeholder="1004006620"
              />
              <div className="bg-muted px-4 py-2 rounded-md text-sm">(20+)</div>
              <Check className="h-5 w-5 text-green-600" />
            </div>
            {errors.client_phone && (
              <p className="text-sm text-destructive mt-1">{errors.client_phone.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {isArabic 
                ? "اختر الخدمات (اختياري)"
                : "Choose services (optional)"}
            </p>
            <p className="text-xs text-muted-foreground text-right">
              {isArabic
                ? "اختر خدمة واحدة أو أكثر الخدمة الأولى سيكون الخدمة الرئيسية"
                : "Choose one or more services. First will be main service"}
            </p>
          </div>

          {/* Services */}
          <div className="text-right">
            <Label className="text-sm text-muted-foreground mb-2 block">
              {isArabic ? "سبب" : "Reason"}
            </Label>
            <div className="relative">
              <Input
                placeholder={isArabic ? "ابحث عن خدمة..." : "Search for service..."}
                className="text-right pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                service(s) found 1
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">5</span>
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">{isArabic ? "خدمات أخرى" : "Other Services"}</span>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 border-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                    1
                  </div>
                  <div className="flex-1 text-right mr-3">
                    <p className="font-medium">{isArabic ? "سباكة" : "Plumbing"}</p>
                  </div>
                  <div className="text-4xl">🔧</div>
                </div>
              </div>

              <div className="mt-3 bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    ✕
                  </Button>
                  <div className="flex-1 text-right mr-2">
                    <p className="font-medium text-sm">{isArabic ? "الخدمة الرئيسية" : "Main Service"}</p>
                    <p className="text-sm flex items-center gap-2 justify-end">
                      <Check className="h-4 w-4 text-green-600" />
                      {isArabic ? "سباكة" : "Plumbing"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="text-right">
            <Label className="text-sm text-muted-foreground mb-2 block">
              {isArabic ? "الملاحظات *" : "Notes *"}
            </Label>
            <Textarea
              {...register("description")}
              className="text-right min-h-[100px]"
              placeholder={isArabic ? "مشكلة في توصيلات الحوض" : "Basin connection issue"}
            />
          </div>

          {/* Date and Time */}
          <div className="text-right">
            <Label className="text-sm text-muted-foreground mb-2 block">
              {isArabic ? "الموعد المفضل" : "Preferred Date"}
            </Label>
            <Input
              type="datetime-local"
              {...register("preferred_date")}
              defaultValue="2025-11-18T12:00"
              className="text-right"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic 
                ? "اختر الموعد والوقت المفضل للخدمة" 
                : "Choose preferred date and time for service"}
            </p>
          </div>

          {/* Images Upload */}
          <div className="text-right">
            <Label className="text-sm text-muted-foreground mb-2 block">
              {isArabic ? "المرفقات (اختياري)" : "Attachments (Optional)"}
            </Label>
            
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="font-medium mb-1">{isArabic ? "انقر لرفع الملفات" : "Click to upload files"}</p>
              <p className="text-sm text-muted-foreground mb-1">{isArabic ? "أو" : "or"}</p>
              
              <div className="flex gap-2 justify-center mb-4">
                <Button type="button" variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" />
                  {isArabic ? "التقط صورة" : "Take Photo"}
                </Button>
                <Button type="button" variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  {isArabic ? "اختر من المكتبة" : "Choose from Library"}
                </Button>
              </div>
              
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <p className="text-xs text-muted-foreground">
                  {isArabic 
                    ? "الصور والفيديوهات فقط (حد أقصى 20 ميجابايت لكل ملف)" 
                    : "Images and videos only (max 20 MB per file)"}
                </p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                {isArabic ? "جاري الإرسال..." : "Submitting..."}
              </span>
            ) : (
              isArabic ? "تقديم" : "Submit"
            )}
          </Button>

          {/* Footer */}
          <div className="text-center pt-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">
                {isArabic ? "مدعوم بواسطة" : "Powered by"}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-bold">
                  N
                </div>
                <span className="font-bold text-primary">Nabeeh</span>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
