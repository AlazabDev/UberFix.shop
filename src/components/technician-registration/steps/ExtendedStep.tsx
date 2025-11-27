import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TechnicianRegistrationData } from "@/types/technician-registration";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const extendedSchema = z.object({
  company_model: z.enum(['local_provider', 'third_party']).optional(),
  number_of_inhouse_technicians: z.number().min(0).optional(),
  number_of_office_staff: z.number().min(0).optional(),
  accepts_emergency_jobs: z.boolean(),
  accepts_national_contracts: z.boolean(),
  additional_notes: z.string().optional(),
});

type ExtendedFormData = z.infer<typeof extendedSchema>;

interface ExtendedStepProps {
  data: Partial<TechnicianRegistrationData>;
  onNext: (data: Partial<TechnicianRegistrationData>) => void;
  onBack: () => void;
  onSaveAndExit: (data: Partial<TechnicianRegistrationData>) => void;
}

export function ExtendedStep({ data, onNext, onBack, onSaveAndExit }: ExtendedStepProps) {
  const form = useForm<ExtendedFormData>({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      company_model: data.company_model,
      number_of_inhouse_technicians: data.number_of_inhouse_technicians || 0,
      number_of_office_staff: data.number_of_office_staff || 0,
      accepts_emergency_jobs: data.accepts_emergency_jobs || false,
      accepts_national_contracts: data.accepts_national_contracts || false,
      additional_notes: data.additional_notes || '',
    },
  });

  const onSubmit = (formData: ExtendedFormData) => {
    onNext(formData);
  };

  const handleSaveAndExit = () => {
    const currentData = form.getValues();
    onSaveAndExit(currentData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">الخطوة 7: معلومات إضافية</h2>
        <p className="text-muted-foreground">تفاصيل إضافية عن شركتك وقدراتك</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="company_model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نموذج العمل (اختياري)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نموذج العمل" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="local_provider">مقدم خدمة محلي</SelectItem>
                    <SelectItem value="third_party">طرف ثالث</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  مقدم خدمة محلي: تقدم الخدمة بنفسك. طرف ثالث: تتعاقد مع فنيين آخرين
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="number_of_inhouse_technicians"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد الفنيين الداخليين (اختياري)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="5" 
                      {...field} 
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 0)} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    الفنيين العاملين لديك بدوام كامل
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number_of_office_staff"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عدد الموظفين الإداريين (اختياري)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="2" 
                      {...field} 
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 0)} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    موظفو المكتب والدعم
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="accepts_emergency_jobs"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">قبول أعمال الطوارئ</FormLabel>
                    <FormDescription>
                      هل تستطيع الاستجابة للطلبات العاجلة خارج أوقات العمل؟
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

            <FormField
              control={form.control}
              name="accepts_national_contracts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">قبول عقود على مستوى الدولة</FormLabel>
                    <FormDescription>
                      هل تستطيع التعامل مع مشاريع كبيرة على مستوى البلد؟
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
          </div>

          <FormField
            control={form.control}
            name="additional_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="أي معلومات إضافية تود مشاركتها..."
                    className="resize-none min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
