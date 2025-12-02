import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TechnicianRegistrationData, TechnicianTrade } from "@/types/technician-registration";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const tradesSchema = z.object({
  trades: z.array(z.object({
    category_id: z.number(),
    category_name: z.string().optional(),
    years_of_experience: z.number().min(0).optional(),
    licenses_or_certifications: z.string().optional(),
    can_handle_heavy_projects: z.boolean(),
  })).min(1, "يجب اختيار مهنة واحدة على الأقل"),
});

type TradesFormData = z.infer<typeof tradesSchema>;

interface TradesStepProps {
  data: Partial<TechnicianRegistrationData>;
  onNext: (data: Partial<TechnicianRegistrationData>) => void;
  onBack: () => void;
  onSaveAndExit: (data: Partial<TechnicianRegistrationData>) => void;
}

export function TradesStep({ data, onNext, onBack, onSaveAndExit }: TradesStepProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(
    new Set(data.trades?.map(t => t.category_id) || [])
  );

  const form = useForm<TradesFormData>({
    resolver: zodResolver(tradesSchema),
    defaultValues: {
      trades: data.trades || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "trades",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, name, description')
      .eq('is_active', true)
      .order('sort_order');
    
    if (!error && data) {
      setCategories(data);
    }
  };

  const toggleCategory = (category: any) => {
    const isSelected = selectedCategoryIds.has(category.id);
    
    if (isSelected) {
      setSelectedCategoryIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(category.id);
        return newSet;
      });
      const index = fields.findIndex(f => f.category_id === category.id);
      if (index >= 0) remove(index);
    } else {
      setSelectedCategoryIds(prev => new Set(prev).add(category.id));
      append({
        category_id: category.id,
        category_name: category.name,
        years_of_experience: 0,
        licenses_or_certifications: '',
        can_handle_heavy_projects: false,
      });
    }
  };

  const onSubmit = (formData: TradesFormData) => {
    onNext(formData);
  };

  const handleSaveAndExit = () => {
    const currentData = form.getValues();
    onSaveAndExit(currentData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">الخطوة 5: المهن والتخصصات</h2>
        <p className="text-muted-foreground">حدد المجالات التي تعمل فيها وخبرتك</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {categories.map((category) => {
              const isSelected = selectedCategoryIds.has(category.id);
              const fieldIndex = fields.findIndex(f => f.category_id === category.id);

              return (
                <div key={category.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleCategory(category)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label className="text-base font-medium cursor-pointer">
                        {category.name}
                      </label>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </div>

                  {isSelected && fieldIndex >= 0 && (
                    <div className="space-y-4 pt-2 pr-6 animate-in fade-in-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`trades.${fieldIndex}.years_of_experience`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>سنوات الخبرة (اختياري)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="5" 
                                  {...field} 
                                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 0)} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`trades.${fieldIndex}.can_handle_heavy_projects`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">مشاريع كبيرة</FormLabel>
                                <p className="text-xs text-muted-foreground">قادر على التعامل مع مشاريع ثقيلة</p>
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
                        name={`trades.${fieldIndex}.licenses_or_certifications`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>التراخيص والشهادات (اختياري)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="أي تراخيص أو شهادات مهنية في هذا المجال..."
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
                </div>
              );
            })}
          </div>

          {fields.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ يجب اختيار مهنة واحدة على الأقل للمتابعة
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
            <Button type="submit" disabled={fields.length === 0}>
              حفظ واستمرار
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
