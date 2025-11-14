import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const quickRequestSchema = z.object({
  contact_name: z.string().min(1, "الاسم مطلوب").max(100),
  contact_phone: z.string().min(10, "رقم الهاتف غير صحيح").max(20),
  contact_email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  issue_description: z.string().min(10, "يرجى وصف المشكلة بالتفصيل").max(1000),
  urgency_level: z.enum(["high", "urgent", "emergency"]),
  location_details: z.string().max(500).optional(),
});

type QuickRequestFormData = z.infer<typeof quickRequestSchema>;

export default function QuickRequest() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [propertyName, setPropertyName] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<QuickRequestFormData>({
    resolver: zodResolver(quickRequestSchema),
    defaultValues: {
      urgency_level: "high",
    },
  });

  // Fetch property name
  useState(() => {
    if (propertyId) {
      supabase
        .from("properties")
        .select("name")
        .eq("id", propertyId)
        .single()
        .then(({ data }) => {
          if (data) setPropertyName(data.name);
        });
    }
  });

  const onSubmit = async (data: QuickRequestFormData) => {
    if (!propertyId) {
      toast.error("معرف العقار غير صحيح");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images if any
      const imageUrls: string[] = [];
      if (images.length > 0) {
        for (const file of images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
          const filePath = `quick-requests/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('az_gallery')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('az_gallery')
            .getPublicUrl(filePath);

          imageUrls.push(publicUrl);
        }
      }

      const { error } = await supabase
        .from("quick_maintenance_requests")
        .insert({
          property_id: propertyId,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email || null,
          issue_description: data.issue_description,
          urgency_level: data.urgency_level,
          location_details: data.location_details || null,
          images: imageUrls.length > 0 ? imageUrls : null,
        });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("تم إرسال طلب الصيانة العاجل بنجاح");
      
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error submitting quick request:", error);
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">تم إرسال الطلب بنجاح!</h2>
            <p className="text-muted-foreground mb-4">
              سيتم التواصل معك في أقرب وقت ممكن
            </p>
            <p className="text-sm text-muted-foreground">
              سيتم تحويلك للصفحة الرئيسية...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <CardTitle className="text-2xl">طلب صيانة عاجل</CardTitle>
            </div>
            {propertyName && (
              <CardDescription className="text-lg">
                العقار: <span className="font-semibold">{propertyName}</span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                هذا النموذج مخصص للطلبات العاجلة فقط. سيتم التواصل معك في أقرب وقت.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contact_name">الاسم الكامل *</Label>
                  <Input
                    id="contact_name"
                    {...register("contact_name")}
                    placeholder="أدخل اسمك الكامل"
                    className="mt-1"
                  />
                  {errors.contact_name && (
                    <p className="text-sm text-destructive mt-1">{errors.contact_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact_phone">رقم الهاتف *</Label>
                  <Input
                    id="contact_phone"
                    {...register("contact_phone")}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="mt-1"
                  />
                  {errors.contact_phone && (
                    <p className="text-sm text-destructive mt-1">{errors.contact_phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact_email">البريد الإلكتروني</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    {...register("contact_email")}
                    placeholder="example@email.com"
                    dir="ltr"
                    className="mt-1"
                  />
                  {errors.contact_email && (
                    <p className="text-sm text-destructive mt-1">{errors.contact_email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="urgency_level">مستوى الأولوية *</Label>
                  <Select
                    onValueChange={(value) => setValue("urgency_level", value as any)}
                    defaultValue="high"
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                      <SelectItem value="emergency">طارئة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="issue_description">وصف المشكلة *</Label>
                  <Textarea
                    id="issue_description"
                    {...register("issue_description")}
                    placeholder="صف المشكلة بالتفصيل..."
                    rows={4}
                    className="mt-1"
                  />
                  {errors.issue_description && (
                    <p className="text-sm text-destructive mt-1">{errors.issue_description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location_details">تفاصيل الموقع داخل العقار</Label>
                  <Input
                    id="location_details"
                    {...register("location_details")}
                    placeholder="مثال: الطابق الثاني، الشقة رقم 5"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>إرفاق صور (اختياري)</Label>
                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={3}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال الطلب العاجل"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
