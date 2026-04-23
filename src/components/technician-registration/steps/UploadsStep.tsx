import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TechnicianRegistrationData, TechnicianDocument } from "@/types/technician-registration";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Upload, FileText } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const uploadsSchema = z.object({
  documents: z.array(z.object({
    document_type: z.enum(['tax_card', 'commercial_registration', 'national_id', 'insurance_certificate', 'professional_license']),
    file_url: z.string().min(1, "يجب رفع الملف"),
    file_name: z.string(),
    file_size: z.number().optional(),
  })).optional(),
});

type UploadsFormData = z.infer<typeof uploadsSchema>;

interface UploadsStepProps {
  data: Partial<TechnicianRegistrationData>;
  onNext: (data: Partial<TechnicianRegistrationData>) => void;
  onBack: () => void;
  onSaveAndExit: (data: Partial<TechnicianRegistrationData>) => void;
}

const DOCUMENT_TYPES = [
  { value: 'tax_card', label: 'البطاقة الضريبية' },
  { value: 'commercial_registration', label: 'السجل التجاري' },
  { value: 'national_id', label: 'البطاقة الشخصية' },
  { value: 'insurance_certificate', label: 'شهادة التأمين' },
  { value: 'professional_license', label: 'رخصة مهنية' },
];

export function UploadsStep({ data, onNext, onBack, onSaveAndExit }: UploadsStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  const form = useForm<UploadsFormData>({
    resolver: zodResolver(uploadsSchema),
    defaultValues: {
      documents: data.documents || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  const handleFileUpload = async (file: File, index: number, documentType: string) => {
    setUploading(true);
    setUploadProgress({ ...uploadProgress, [index]: 0 });

    try {
      // Must be authenticated — RLS requires the file path to start with auth.uid()
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً قبل رفع المستندات');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-${Date.now()}.${fileExt}`;
      // Path MUST begin with the user's id so storage RLS ownership check passes
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('technician-registration-docs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('technician-registration-docs')
        .getPublicUrl(filePath);

      update(index, {
        document_type: documentType as any,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
      });

      setUploadProgress({ ...uploadProgress, [index]: 100 });
      toast.success("تم رفع الملف بنجاح");
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error("فشل رفع الملف: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (formData: UploadsFormData) => {
    onNext(formData);
  };

  const handleSaveAndExit = () => {
    const currentData = form.getValues();
    onSaveAndExit(currentData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">الخطوة 8: المرفقات</h2>
        <p className="text-muted-foreground">قم برفع المستندات الرسمية المطلوبة</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>ملحوظة:</strong> المستندات المرفوعة ستُراجع للتحقق من صحتها قبل قبول التسجيل
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">المستندات</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ 
                  document_type: 'national_id' as any, 
                  file_url: '', 
                  file_name: '',
                  file_size: 0 
                })}
              >
                <Upload className="h-4 w-4 ml-1" />
                إضافة مستند
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">مستند {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name={`documents.${index}.document_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع المستند *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع المستند" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DOCUMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                  name={`documents.${index}.file_url`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الملف *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const documentType = form.watch(`documents.${index}.document_type`);
                                handleFileUpload(file, index, documentType);
                              }
                            }}
                            disabled={uploading}
                          />
                          {field.value && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              <span>{form.watch(`documents.${index}.file_name`)}</span>
                            </div>
                          )}
                          {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ width: `${uploadProgress[index]}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            {fields.length === 0 && (
              <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">لم يتم إضافة مستندات بعد</p>
                <p className="text-sm text-muted-foreground mt-1">اضغط "إضافة مستند" للبدء</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-between pt-6">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                رجوع
              </Button>
              <Button type="button" variant="ghost" onClick={handleSaveAndExit}>
                حفظ والعودة لاحقاً
              </Button>
            </div>
            <Button type="submit" disabled={uploading}>
              حفظ واستمرار
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
