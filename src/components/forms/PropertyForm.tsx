import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getPropertyIcon } from "@/lib/propertyIcons";
import type { Property } from "@/hooks/useProperties";

const propertyFormSchema = z.object({
  name: z.string().min(2, "يجب أن يكون الاسم 2 أحرف على الأقل"),
  code: z.string().optional(),
  type: z.string().min(1, "نوع العقار مطلوب"),
  status: z.string().min(1, "حالة العقار مطلوبة"),
  address: z.string().min(5, "العنوان مطلوب"),
  city_id: z.number().optional(),
  district_id: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  area: z.number().optional(),
  rooms: z.number().optional(),
  bathrooms: z.number().optional(),
  floors: z.number().optional(),
  parking_spaces: z.number().optional(),
  description: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  initialData?: Partial<Property>;
  propertyId?: string;
  onSuccess?: (property: Property) => void;
  skipNavigation?: boolean;
}

export function PropertyForm({
  initialData,
  propertyId,
  onSuccess,
  skipNavigation = false,
}: PropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<{ id: number; name_ar: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name_ar: string }[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData,
  });

  const selectedCityId = watch("city_id");
  const selectedType = watch("type");

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
    if (initialData?.images) {
      setExistingImages(initialData.images);
    }
  }, [initialData]);

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      let uploadedImages: string[] = [...existingImages];

      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `properties/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(filePath, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("property-images")
            .getPublicUrl(filePath);

          uploadedImages.push(publicUrl);
        }
      }

      const qrCodeData = `${window.location.origin}/quick-request/${propertyId || "new"}`;
      const iconUrl = getPropertyIcon(data.type);

      const propertyData = {
        ...data,
        images: uploadedImages,
        icon_url: iconUrl,
        qr_code_data: qrCodeData,
        qr_code_generated_at: new Date().toISOString(),
        created_by: user.id,
      };

      if (propertyId) {
        const { data: updatedProperty, error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", propertyId)
          .select()
          .single();

        if (error) throw error;

        toast.success("تم تحديث العقار بنجاح");
        if (onSuccess) onSuccess(updatedProperty);
      } else {
        const { data: newProperty, error } = await supabase
          .from("properties")
          .insert([propertyData])
          .select()
          .single();

        if (error) throw error;

        toast.success("تمت إضافة العقار بنجاح");
        if (onSuccess) onSuccess(newProperty);
      }

      if (!skipNavigation) {
        window.location.href = "/properties";
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ أثناء حفظ العقار");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="type" required>نوع العقار</Label>
          <Select onValueChange={(value) => setValue("type", value)} defaultValue={initialData?.type}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع العقار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">سكني</SelectItem>
              <SelectItem value="commercial">تجاري</SelectItem>
              <SelectItem value="industrial">صناعي</SelectItem>
              <SelectItem value="office">مكتبي</SelectItem>
              <SelectItem value="retail">تجزئة</SelectItem>
              <SelectItem value="mixed_use">متعدد الاستخدام</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">كود العقار</Label>
          <Input {...register("code")} placeholder="كود فريد للعقار" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" required>اسم العقار</Label>
          <Input {...register("name")} placeholder="اسم العقار" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" required>حالة العقار</Label>
          <Select onValueChange={(value) => setValue("status", value)} defaultValue={initialData?.status || "active"}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
              <SelectItem value="maintenance">تحت الصيانة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city_id">المدينة</Label>
          <Select onValueChange={(value) => setValue("city_id", parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المدينة" />
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
          <Label htmlFor="district_id">الحي</Label>
          <Select onValueChange={(value) => setValue("district_id", parseInt(value))} disabled={!selectedCityId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الحي" />
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" required>العنوان التفصيلي</Label>
          <Textarea {...register("address")} placeholder="العنوان الكامل للعقار" />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">المساحة (م²)</Label>
          <Input 
            type="number" 
            {...register("area", { valueAsNumber: true })} 
            placeholder="المساحة بالمتر المربع" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rooms">عدد الغرف</Label>
          <Input type="number" {...register("rooms", { valueAsNumber: true })} placeholder="عدد الغرف" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">عدد دورات المياه</Label>
          <Input type="number" {...register("bathrooms", { valueAsNumber: true })} placeholder="عدد دورات المياه" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="floors">عدد الطوابق</Label>
          <Input type="number" {...register("floors", { valueAsNumber: true })} placeholder="عدد الطوابق" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parking_spaces">مواقف السيارات</Label>
          <Input 
            type="number" 
            {...register("parking_spaces", { valueAsNumber: true })} 
            placeholder="عدد مواقف السيارات" 
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">الوصف</Label>
          <Textarea {...register("description")} placeholder="وصف تفصيلي للعقار" rows={4} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          {propertyId ? "تحديث العقار" : "إضافة العقار"}
        </Button>
      </div>
    </form>
  );
}
