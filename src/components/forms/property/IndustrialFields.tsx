import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { PropertyFormData } from "./types";

interface IndustrialFieldsProps {
  register: UseFormRegister<PropertyFormData>;
  setValue: UseFormSetValue<PropertyFormData>;
  watch: UseFormWatch<PropertyFormData>;
}

const industrialActivities = [
  { value: "manufacturing", label: "تصنيع" },
  { value: "food_processing", label: "صناعات غذائية" },
  { value: "textile", label: "نسيج وملابس" },
  { value: "chemical", label: "صناعات كيميائية" },
  { value: "pharmaceutical", label: "أدوية" },
  { value: "automotive", label: "سيارات وقطع غيار" },
  { value: "electronics", label: "إلكترونيات" },
  { value: "warehouse", label: "مستودعات" },
  { value: "logistics", label: "لوجستيات" },
  { value: "other", label: "أخرى" },
];

const hazardLevels = [
  { value: "low", label: "منخفض" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "مرتفع" },
  { value: "critical", label: "حرج" },
];

const shiftPatterns = [
  { value: "single", label: "وردية واحدة" },
  { value: "double", label: "ورديتان" },
  { value: "triple", label: "ثلاث ورديات" },
  { value: "continuous", label: "تشغيل مستمر 24/7" },
];

const industrialAssets = [
  "ماكينات إنتاج",
  "محركات كهربائية",
  "لوحات تحكم PLC",
  "سيور ناقلة",
  "أنظمة أمان صناعي",
  "هواء مضغوط",
  "نظام تبريد صناعي",
];

export function IndustrialFields({ register, setValue, watch }: IndustrialFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
          🏭 خصائص العقار الصناعي
        </h4>
        <p className="text-sm text-amber-600 dark:text-amber-400">
          أدخل تفاصيل المنشأة الصناعية. سيتم تطبيق نظام الصيانة الوقائية والتنبؤية.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>النشاط الصناعي</Label>
          <Select
            value={watch("industrial_activity") || "manufacturing"}
            onValueChange={(value) => setValue("industrial_activity", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر النشاط" />
            </SelectTrigger>
            <SelectContent>
              {industrialActivities.map((activity) => (
                <SelectItem key={activity.value} value={activity.value}>
                  {activity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>مستوى الخطورة</Label>
          <Select
            value={watch("hazard_level") || "low"}
            onValueChange={(value) => setValue("hazard_level", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المستوى" />
            </SelectTrigger>
            <SelectContent>
              {hazardLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>نظام الورديات</Label>
          <Select
            value={watch("shift_pattern") || "single"}
            onValueChange={(value) => setValue("shift_pattern", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر النظام" />
            </SelectTrigger>
            <SelectContent>
              {shiftPatterns.map((pattern) => (
                <SelectItem key={pattern.value} value={pattern.value}>
                  {pattern.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>عدد خطوط الإنتاج</Label>
          <Input
            type="number"
            min={0}
            {...register("production_lines", { valueAsNumber: true })}
            placeholder="مثال: 5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>المساحة الإجمالية (م²)</Label>
          <Input
            type="number"
            min={0}
            {...register("area", { valueAsNumber: true })}
            placeholder="مثال: 10000"
          />
        </div>

        <div className="space-y-2">
          <Label>عدد العمال</Label>
          <Input
            type="number"
            min={0}
            {...register("workers_count", { valueAsNumber: true })}
            placeholder="مثال: 200"
          />
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <Label className="text-muted-foreground mb-2 block">الأصول الصناعية</Label>
        <div className="flex flex-wrap gap-2">
          {industrialAssets.map((asset) => (
            <span
              key={asset}
              className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm rounded-full border border-amber-200 dark:border-amber-700"
            >
              {asset}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          سيتم تتبع MTTR / MTBF وتكلفة الأصول تلقائياً
        </p>
      </div>

      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <h5 className="font-medium text-red-700 dark:text-red-300 mb-1">⚠️ تنبيه الصيانة</h5>
        <p className="text-sm text-red-600 dark:text-red-400">
          العقارات الصناعية تتطلب صيانة وقائية منتظمة وخطة طوارئ.
        </p>
      </div>
    </div>
  );
}
