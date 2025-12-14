import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { PropertyFormData } from "./types";

interface ResidentialFieldsProps {
  register: UseFormRegister<PropertyFormData>;
  setValue: UseFormSetValue<PropertyFormData>;
  watch: UseFormWatch<PropertyFormData>;
}

const unitTypes = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "duplex", label: "دوبلكس" },
  { value: "studio", label: "ستوديو" },
  { value: "penthouse", label: "بنتهاوس" },
];

const defaultAssets = [
  "عداد كهرباء",
  "عداد مياه",
  "سخان مياه",
  "تكييف",
];

export function ResidentialFields({ register, setValue, watch }: ResidentialFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
          🏠 خصائص العقار السكني
        </h4>
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          أدخل تفاصيل العقار السكني. الأصول الافتراضية ستُضاف تلقائياً.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>عدد الوحدات</Label>
          <Input
            type="number"
            min={1}
            {...register("units_count", { valueAsNumber: true })}
            placeholder="مثال: 10"
          />
        </div>

        <div className="space-y-2">
          <Label>نوع الوحدات</Label>
          <Select
            value={watch("unit_type") || "apartment"}
            onValueChange={(value) => setValue("unit_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الوحدة" />
            </SelectTrigger>
            <SelectContent>
              {unitTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>عدد الغرف</Label>
          <Input
            type="number"
            min={0}
            {...register("rooms", { valueAsNumber: true })}
            placeholder="3"
          />
        </div>

        <div className="space-y-2">
          <Label>عدد الحمامات</Label>
          <Input
            type="number"
            min={0}
            {...register("bathrooms", { valueAsNumber: true })}
            placeholder="2"
          />
        </div>

        <div className="space-y-2">
          <Label>عدد الطوابق</Label>
          <Input
            type="number"
            min={1}
            {...register("floors", { valueAsNumber: true })}
            placeholder="1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>المساحة (م²)</Label>
        <Input
          type="number"
          min={0}
          {...register("area", { valueAsNumber: true })}
          placeholder="مثال: 150"
        />
      </div>

      <div className="space-y-2">
        <Label>مواقف السيارات</Label>
        <Input
          type="number"
          min={0}
          {...register("parking_spaces", { valueAsNumber: true })}
          placeholder="0"
        />
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <Label className="text-muted-foreground mb-2 block">الأصول الافتراضية</Label>
        <div className="flex flex-wrap gap-2">
          {defaultAssets.map((asset) => (
            <span
              key={asset}
              className="px-3 py-1 bg-background text-sm rounded-full border"
            >
              {asset}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          سيتم إضافة هذه الأصول تلقائياً للوحدات السكنية
        </p>
      </div>
    </div>
  );
}
