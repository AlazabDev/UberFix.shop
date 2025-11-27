import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TechnicianRegistrationData, CoverageArea } from "@/types/technician-registration";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const coverageSchema = z.object({
  radius_km: z.number().min(1, "نصف القطر مطلوب").optional(),
  coverage_areas: z.array(z.object({
    city_id: z.number({ message: "المدينة مطلوبة" }),
    district_id: z.number().optional(),
    radius_km: z.number().optional(),
    city_name: z.string().optional(),
    district_name: z.string().optional(),
  })).min(1, "يجب إضافة منطقة واحدة على الأقل"),
});

type CoverageFormData = z.infer<typeof coverageSchema>;

interface CoverageStepProps {
  data: Partial<TechnicianRegistrationData>;
  onNext: (data: Partial<TechnicianRegistrationData>) => void;
  onBack: () => void;
  onSaveAndExit: (data: Partial<TechnicianRegistrationData>) => void;
}

export function CoverageStep({ data, onNext, onBack, onSaveAndExit }: CoverageStepProps) {
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<{ [key: number]: any[] }>({});

  const form = useForm<CoverageFormData>({
    resolver: zodResolver(coverageSchema),
    defaultValues: {
      radius_km: undefined,
      coverage_areas: data.coverage_areas || [{ city_id: 0, district_id: undefined, radius_km: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "coverage_areas",
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    const { data, error } = await supabase
      .from('cities')
      .select('id, name_ar')
      .order('name_ar');
    
    if (!error && data) {
      setCities(data);
    }
  };

  const fetchDistricts = async (cityId: number, fieldIndex: number) => {
    if (districts[cityId]) return; // Already loaded

    const { data, error } = await supabase
      .from('districts')
      .select('id, name_ar')
      .eq('city_id', cityId)
      .order('name_ar');
    
    if (!error && data) {
      setDistricts(prev => ({ ...prev, [cityId]: data }));
    }
  };

  const onSubmit = (formData: CoverageFormData) => {
    // Add city and district names
    const enrichedAreas = formData.coverage_areas.map(area => {
      const city = cities.find(c => c.id === area.city_id);
      const district = districts[area.city_id]?.find(d => d.id === area.district_id);
      
      return {
        ...area,
        city_name: city?.name_ar,
        district_name: district?.name_ar,
      };
    });

    onNext({ ...formData, coverage_areas: enrichedAreas });
  };

  const handleSaveAndExit = () => {
    const currentData = form.getValues();
    onSaveAndExit(currentData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">الخطوة 6: نطاق التغطية</h2>
        <p className="text-muted-foreground">حدد المناطق التي تغطيها خدماتك</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="radius_km"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نصف القطر الافتراضي (كم) - اختياري</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} 
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">نصف القطر الذي تستطيع تغطيته من موقعك</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">المناطق المغطاة</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ city_id: 0, district_id: undefined, radius_km: undefined })}
              >
                <Plus className="h-4 w-4 ml-1" />
                إضافة منطقة
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">منطقة {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name={`coverage_areas.${index}.city_id`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدينة *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const cityId = parseInt(value);
                            field.onChange(cityId);
                            form.setValue(`coverage_areas.${index}.district_id`, undefined);
                            fetchDistricts(cityId, index);
                          }} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المدينة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name_ar}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`coverage_areas.${index}.district_id`}
                    render={({ field }) => {
                      const cityId = form.watch(`coverage_areas.${index}.city_id`);
                      const cityDistricts = districts[cityId] || [];

                      return (
                        <FormItem>
                          <FormLabel>المنطقة (اختياري)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            value={field.value?.toString()}
                            disabled={!cityId || cityDistricts.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المنطقة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cityDistricts.map((district) => (
                                <SelectItem key={district.id} value={district.id.toString()}>
                                  {district.name_ar}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name={`coverage_areas.${index}.radius_km`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نصف القطر (كم)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5" 
                            {...field} 
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ يجب إضافة منطقة واحدة على الأقل للمتابعة
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
