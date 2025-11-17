import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { InteractiveMap } from "@/components/maps/InteractiveMap";
import type { Property } from "@/hooks/useProperties";
import { PropertyFormTabs } from "./PropertyFormTabs";
import { useNavigate } from "react-router-dom";

const propertyFormSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, "يجب أن يكون الاسم 2 أحرف على الأقل"),
  type: z.string().min(1, "نوع العقار مطلوب"),
  status: z.string().min(1, "حالة العقار مطلوبة"),
  address: z.string().min(5, "العنوان مطلوب"),
  city_id: z.number().optional(),
  district_id: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  manager_id: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  initialData?: Partial<Property>;
  propertyId?: string;
  skipNavigation?: boolean;
  onSuccess?: () => void;
}

export function PropertyForm({ initialData, propertyId, skipNavigation, onSuccess }: PropertyFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<{ id: number; name_ar: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name_ar: string }[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [enableContact, setEnableContact] = useState(false);
  const [contactPhone, setContactPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [selectedType, setSelectedType] = useState(initialData?.type || "residential");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      ...initialData,
      type: selectedType,
      status: initialData?.status || "active"
    },
  });

  const selectedCityId = watch("city_id");

  useEffect(() => {
    setValue("type", selectedType);
  }, [selectedType, setValue]);

  useEffect(() => {
    const fetchCities = async () => {
      const { data } = await supabase.from("cities").select("*").order("name_ar");
      if (data) setCities(data);
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCityId) {
      const fetchDistricts = async () => {
        const { data } = await supabase
          .from("districts")
          .select("*")
          .eq("city_id", selectedCityId)
          .order("name_ar");
        if (data) setDistricts(data);
      };
      fetchDistricts();
    }
  }, [selectedCityId]);

  useEffect(() => {
    if (initialData?.images && initialData.images.length > 0) {
      setImagePreview(initialData.images[0]);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      let uploadedImages: string[] = initialData?.images || [];

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("property-images")
          .upload(filePath, image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`فشل تحميل الصورة: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        uploadedImages = [publicUrl];
      }

      const qrCodeData = `${window.location.origin}/quick-request/${propertyId || "new"}`;

      const propertyData = {
        ...data,
        images: uploadedImages,
        qr_code_data: qrCodeData,
        qr_code_generated_at: new Date().toISOString(),
        created_by: user.id,
      };

      if (propertyId) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", propertyId);

        if (error) throw error;
        
        toast.success("تم تحديث العقار بنجاح");
      } else {
        const { error } = await supabase
          .from("properties")
          .insert([propertyData]);

        if (error) throw error;
        
        toast.success("تم إنشاء العقار بنجاح");
      }

      if (onSuccess) {
        onSuccess();
      } else if (!skipNavigation) {
        navigate("/properties");
      }
    } catch (error: any) {
      console.error("Error saving property:", error);
      toast.error(error?.message || "حدث خطأ أثناء حفظ العقار");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Property Type Tabs */}
      <div>
        <Label className="mb-2 block">تصنيف العقار *</Label>
        <PropertyFormTabs selectedType={selectedType} onTypeChange={setSelectedType} />
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="code">رمز الدخول</Label>
          <Input {...register("code")} placeholder="543945" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" required>اسم العقار *</Label>
          <Input {...register("name")} placeholder="Alazabco" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>صورة العقار</Label>
        <div className="flex items-start gap-4">
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -left-2 h-6 w-6 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted-foreground">لا توجد صورة</span>
            </div>
          )}
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">اختر صورة للعقار</p>
          </div>
        </div>
      </div>

      {/* Client & Warranty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>العميل</Label>
          <Input placeholder="Alazabco" />
        </div>
        <div className="space-y-2">
          <Label>تاريخ انتهاء الضمان</Label>
          <Input type="date" defaultValue="2027-11-23" />
          <p className="text-xs text-muted-foreground">حدد التاريخ الذي ينتهي فيه ضمان العقار.</p>
        </div>
      </div>

      {/* Location Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>الدولة</Label>
          <Select defaultValue="EG">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EG">جمهورية مصر العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>المدينة</Label>
          <Select onValueChange={(value) => setValue("city_id", parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="القاهرة" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>الحي</Label>
          <Select onValueChange={(value) => setValue("district_id", parseInt(value))} disabled={!selectedCityId}>
            <SelectTrigger>
              <SelectValue placeholder="الحورة" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id.toString()}>
                  {district.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">العنوان التفصيلي</Label>
        <Input 
          {...register("address")} 
          placeholder="مثال: 8st 500 maadi Cairo" 
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          يمكنك النقر على الخريطة أدناه لتحديد الموقع بدقة
        </p>
      </div>

      {/* Interactive Map */}
      <InteractiveMap
        latitude={watch("latitude") || 30.0444}
        longitude={watch("longitude") || 31.2357}
        onLocationChange={(lat, lng, address) => {
          setValue("latitude", lat);
          setValue("longitude", lng);
          if (address) {
            setValue("address", address);
          }
        }}
        height="320px"
      />

      {/* Detailed Address */}
      <div className="space-y-2">
        <Label>العنوان التفصيلي</Label>
        <Input placeholder="(ادخل العنوان التفصيلي الاختياري)" />
      </div>

      {/* Property Managers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>مدير الصيانة</Label>
          <Button type="button" variant="outline" className="w-full justify-start">
            تحديد مدير للصيانة
          </Button>
          <p className="text-xs text-muted-foreground">
            متاح لجميع مديري الصيانة
          </p>
        </div>

        <div className="space-y-2">
          <Label>مشرف العقار</Label>
          <Button type="button" variant="outline" className="w-full justify-start">
            تحديد مشرف العقار
          </Button>
          <p className="text-xs text-muted-foreground">
            متاح لجميع مشرفي العقارات
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>إضافة بيانات تواصل موثّقة</Label>
          <Switch checked={enableContact} onCheckedChange={setEnableContact} />
        </div>
        
        {enableContact && (
          <>
            <p className="text-xs text-muted-foreground">
              هذه البيانات الخاصة بالضيافة والاستقبال. فقط للذا تحب مراجعة بيانات موثقة للطلبات.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>رمز الدولة</Label>
                <Select defaultValue="+966">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+20">جمهورية مصر العربية +20</SelectItem>
                    <SelectItem value="+966">+966</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>رقم الجوال للتواصل المؤقت</Label>
                <Input 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="01004006620"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  أدخل رقم الجوال، يجب بدون رمز الدولة
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>اسم الشخص للتواصل المؤقت</Label>
              <Input 
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Mohamed Azab"
              />
            </div>
          </>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-6">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          حفظ البيانات
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => navigate("/properties")}
          className="flex-1"
        >
          حفظ وإنشاء جديد
        </Button>
      </div>
    </form>
  );
}
