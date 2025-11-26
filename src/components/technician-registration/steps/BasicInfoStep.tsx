import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { basicInfoSchema, BasicInfoFormData } from "@/lib/validationSchemas/technicianRegistration";
import { TechnicianRegistrationData } from "@/types/technician-registration";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicInfoStepProps {
  data: Partial<TechnicianRegistrationData>;
  onNext: (data: Partial<TechnicianRegistrationData>) => void;
  onSaveAndExit: (data: Partial<TechnicianRegistrationData>) => void;
}

export function BasicInfoStep({ data, onNext, onSaveAndExit }: BasicInfoStepProps) {
  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      company_name: data.company_name || '',
      company_type: data.company_type || 'individual',
      full_name: data.full_name || '',
      email: data.email || '',
      phone: data.phone || '',
      preferred_language: data.preferred_language || 'ar',
    },
  });

  const onSubmit = (formData: BasicInfoFormData) => {
    onNext(formData);
  };

  const handleSaveAndExit = () => {
    const currentData = form.getValues();
    onSaveAndExit(currentData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">الخطوة 1: الأساسيات</h2>
        <p className="text-muted-foreground">المعلومات الأساسية عن الشركة أو الفني</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>اسم الشركة / الاسم التجاري</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم الشركة أو الاسم التجاري" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>نوع الكيان</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الكيان" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="individual">فني فردي</SelectItem>
                    <SelectItem value="small_team">فريق صغير</SelectItem>
                    <SelectItem value="company">شركة صيانة</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">شخص مسؤول لاستلام طلبات الصيانة</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل الاسم الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="example@domain.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="01xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اللغة المفضلة للتواصل</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-between pt-6">
            <Button type="button" variant="outline" onClick={handleSaveAndExit}>
              حفظ والعودة لاحقاً
            </Button>
            <Button type="submit">
              حفظ واستمرار
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
