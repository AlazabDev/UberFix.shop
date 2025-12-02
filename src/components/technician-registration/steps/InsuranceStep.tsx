import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TechnicianRegistrationData } from "@/types/technician-registration";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const insuranceSchema = z.object({
  has_insurance: z.boolean(),
  insurance_company_name: z.string().optional(),
  policy_number: z.string().optional(),
  policy_expiry_date: z.string().optional(),
  insurance_notes: z.string().optional(),
}).refine((data) => {
  if (data.has_insurance) {
    return data.insurance_company_name && data.policy_number && data.policy_expiry_date;
  }
  return true;
}, {
  message: "يجب إدخال بيانات التأمين الكاملة عند تفعيل التأمين",
  path: ["insurance_company_name"],
});

type InsuranceFormData = z.infer<typeof insuranceSchema>;

interface InsuranceStepProps {
  data: Partial<TechnicianRegistrationData>;
  onNext: (data: Partial<TechnicianRegistrationData>) => void;
  onBack: () => void;
  onSaveAndExit: (data: Partial<TechnicianRegistrationData>) => void;
}

export function InsuranceStep({ data, onNext, onBack, onSaveAndExit }: InsuranceStepProps) {
  const form = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      has_insurance: data.has_insurance || false,
      insurance_company_name: data.insurance_company_name || '',
      policy_number: data.policy_number || '',
      policy_expiry_date: data.policy_expiry_date || '',
      insurance_notes: data.insurance_notes || '',
    },
  });

  const hasInsurance = form.watch('has_insurance');

  const onSubmit = (formData: InsuranceFormData) => {
    onNext(formData);
  };

  const handleSaveAndExit = () => {
    const currentData = form.getValues();
    onSaveAndExit(currentData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">الخطوة 3: التأمين</h2>
        <p className="text-muted-foreground">معلومات التأمين على الأعمال والمسؤولية</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="has_insurance"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">هل لديك تأمين على الأعمال؟</FormLabel>
                  <FormDescription>
                    التأمين يزيد من ثقة العملاء ويحميك من المخاطر
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {hasInsurance && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <FormField
                control={form.control}
                name="insurance_company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم شركة التأمين *</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: شركة التأمين المصرية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="policy_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الوثيقة *</FormLabel>
                      <FormControl>
                        <Input placeholder="POL-2024-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="policy_expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ انتهاء الوثيقة *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="insurance_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أي تفاصيل إضافية عن التأمين..."
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {!hasInsurance && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 <strong>نصيحة:</strong> الحصول على تأمين يساعدك في الحصول على المزيد من الطلبات وزيادة ثقة العملاء
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-between pt-6">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                رجوع
              </Button>
              <Button type="button" variant="ghost" onClick={handleSaveAndExit}>
                حفظ والعودة لاحقاً
              </Button>
            </div>
            <Button type="submit">
              حفظ واستمرار
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
