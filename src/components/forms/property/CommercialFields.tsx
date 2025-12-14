import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { PropertyFormData } from "./types";

interface CommercialFieldsProps {
  register: UseFormRegister<PropertyFormData>;
  setValue: UseFormSetValue<PropertyFormData>;
  watch: UseFormWatch<PropertyFormData>;
}

const businessActivities = [
  { value: "retail", label: "تجزئة" },
  { value: "restaurant", label: "مطعم / كافيه" },
  { value: "office", label: "مكاتب إدارية" },
  { value: "medical", label: "مركز طبي" },
  { value: "hotel", label: "فندق / شقق فندقية" },
  { value: "supermarket", label: "سوبرماركت" },
  { value: "mall", label: "مول تجاري" },
  { value: "other", label: "أخرى" },
];

const slaLevels = [
  { value: "standard", label: "عادي - استجابة خلال 24 ساعة" },
  { value: "priority", label: "أولوية - استجابة خلال 4 ساعات" },
  { value: "critical", label: "حرج - استجابة خلال ساعة" },
];

const criticalAssets = [
  "HVAC تكييف مركزي",
  "لوحات كهرباء",
  "نظام إنذار / إطفاء",
  "كاميرات مراقبة",
  "أبواب أوتوماتيكية",
];

export function CommercialFields({ register, setValue, watch }: CommercialFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
          🏬 خصائص العقار التجاري
        </h4>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          أدخل تفاصيل المنشأة التجارية. سيتم تطبيق نظام SLA للصيانة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>النشاط التجاري</Label>
          <Select
            value={watch("business_activity") || "retail"}
            onValueChange={(value) => setValue("business_activity", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر النشاط" />
            </SelectTrigger>
            <SelectContent>
              {businessActivities.map((activity) => (
                <SelectItem key={activity.value} value={activity.value}>
                  {activity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>عدد المحلات / المساحات</Label>
          <Input
            type="number"
            min={1}
            {...register("units_count", { valueAsNumber: true })}
            placeholder="مثال: 20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>ساعات التشغيل</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="time"
              {...register("opening_time")}
              className="flex-1"
            />
            <span className="text-muted-foreground">إلى</span>
            <Input
              type="time"
              {...register("closing_time")}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>مستوى الأولوية (SLA)</Label>
          <Select
            value={watch("sla_level") || "standard"}
            onValueChange={(value) => setValue("sla_level", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر مستوى SLA" />
            </SelectTrigger>
            <SelectContent>
              {slaLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>المساحة الإجمالية (م²)</Label>
        <Input
          type="number"
          min={0}
          {...register("area", { valueAsNumber: true })}
          placeholder="مثال: 5000"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>عدد الطوابق</Label>
          <Input
            type="number"
            min={1}
            {...register("floors", { valueAsNumber: true })}
            placeholder="3"
          />
        </div>

        <div className="space-y-2">
          <Label>مواقف السيارات</Label>
          <Input
            type="number"
            min={0}
            {...register("parking_spaces", { valueAsNumber: true })}
            placeholder="50"
          />
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <Label className="text-muted-foreground mb-2 block">الأصول الحرجة</Label>
        <div className="flex flex-wrap gap-2">
          {criticalAssets.map((asset) => (
            <span
              key={asset}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-700"
            >
              {asset}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          هذه الأصول تتطلب صيانة دورية ومراقبة مستمرة
        </p>
      </div>
    </div>
  );
}
