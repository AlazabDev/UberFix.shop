import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { TemplatePreview } from './TemplatePreview';
import type { WATemplate, TemplateButton, TemplateCategory } from '@/hooks/useWhatsAppTemplates';

// Validation schema
const templateSchema = z.object({
  name: z
    .string()
    .min(1, 'الاسم مطلوب')
    .max(512, 'الاسم طويل جداً')
    .regex(/^[a-z][a-z0-9_]*$/, 'يجب أن يبدأ بحرف صغير ويحتوي فقط على أحرف صغيرة وأرقام وشرطة سفلية'),
  category: z.enum(['utility', 'marketing', 'authentication']),
  language: z.string().min(1, 'اللغة مطلوبة'),
  header_type: z.enum(['none', 'text', 'image', 'video', 'document']),
  header_content: z.string().max(60, 'الحد الأقصى 60 حرف').optional(),
  body_text: z
    .string()
    .min(1, 'نص الرسالة مطلوب')
    .max(1024, 'الحد الأقصى 1024 حرف')
    .refine(
      (text) => {
        const placeholders = text.match(/\{\{(\d+)\}\}/g) || [];
        const numbers = placeholders.map((p) => parseInt(p.replace(/[{}]/g, ''))).sort((a, b) => a - b);
        for (let i = 0; i < numbers.length; i++) {
          if (numbers[i] !== i + 1) return false;
        }
        return true;
      },
      { message: 'المتغيرات يجب أن تكون متسلسلة من {{1}}' }
    ),
  footer_text: z.string().max(60, 'الحد الأقصى 60 حرف').optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: WATemplate | null;
  onSave: (data: Partial<WATemplate>) => Promise<void>;
  isSaving: boolean;
}

const BUTTON_TYPES = [
  { value: 'QUICK_REPLY', label: 'رد سريع' },
  { value: 'URL', label: 'رابط' },
  { value: 'PHONE_NUMBER', label: 'رقم هاتف' },
];

export function TemplateEditor({ 
  open, 
  onOpenChange, 
  template, 
  onSave,
  isSaving 
}: TemplateEditorProps) {
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      category: 'utility',
      language: 'ar',
      header_type: 'none',
      header_content: '',
      body_text: '',
      footer_text: '',
    },
  });

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        category: template.category,
        language: template.language,
        header_type: template.header_type || 'none',
        header_content: template.header_content || '',
        body_text: template.body_text,
        footer_text: template.footer_text || '',
      });
      setButtons(template.buttons || []);
    } else {
      form.reset({
        name: '',
        category: 'utility',
        language: 'ar',
        header_type: 'none',
        header_content: '',
        body_text: '',
        footer_text: '',
      });
      setButtons([]);
    }
  }, [template, form]);

  const watchedValues = form.watch();

  const handleSubmit = async (values: TemplateFormValues) => {
    await onSave({
      ...values,
      buttons,
      ...(template?.id && { id: template.id }),
    });
    onOpenChange(false);
  };

  const addButton = () => {
    if (buttons.length >= 3) return;
    setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }]);
  };

  const updateButton = (index: number, field: keyof TemplateButton, value: string) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], [field]: value };
    setButtons(updated);
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const isEditing = !!template?.id;
  const isLocked = template?.is_locked;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'تعديل القالب' : 'إنشاء قالب جديد'}
          </SheetTitle>
          <SheetDescription>
            {isEditing 
              ? 'قم بتعديل بيانات القالب. لن تتمكن من تعديل بعض الحقول بعد الموافقة.'
              : 'أنشئ قالب رسالة جديد وأرسله للموافقة من Meta.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم القالب *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="template_name" 
                        disabled={isEditing}
                        className="font-mono"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormDescription>
                      أحرف صغيرة وأرقام وشرطة سفلية فقط
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isLocked}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="utility">أداة مساعدة</SelectItem>
                          <SelectItem value="marketing">تسويق</SelectItem>
                          <SelectItem value="authentication">مصادقة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اللغة *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="en_US">English (US)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Header */}
              <FormField
                control={form.control}
                name="header_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع العنوان</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLocked}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">بدون عنوان</SelectItem>
                        <SelectItem value="text">نص</SelectItem>
                        <SelectItem value="image">صورة</SelectItem>
                        <SelectItem value="video">فيديو</SelectItem>
                        <SelectItem value="document">مستند</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedValues.header_type === 'text' && (
                <FormField
                  control={form.control}
                  name="header_content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نص العنوان</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="عنوان الرسالة" 
                          maxLength={60}
                          disabled={isLocked}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/60 حرف
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Body */}
              <FormField
                control={form.control}
                name="body_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نص الرسالة *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="مرحباً {{1}}، هذه رسالة تجريبية..."
                        rows={5}
                        maxLength={1024}
                        disabled={isLocked}
                        dir="rtl"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/1024 حرف. استخدم {'{{1}}'} {'{{2}}'} للمتغيرات
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Footer */}
              <FormField
                control={form.control}
                name="footer_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نص التذييل</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="شكراً لتواصلك معنا" 
                        maxLength={60}
                        disabled={isLocked}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/60 حرف
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>الأزرار (اختياري)</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addButton}
                    disabled={buttons.length >= 3 || isLocked}
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة زر
                  </Button>
                </div>

                {buttons.map((button, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1 space-y-2">
                      <Select
                        value={button.type}
                        onValueChange={(v) => updateButton(index, 'type', v)}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BUTTON_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="نص الزر"
                        value={button.text}
                        onChange={(e) => updateButton(index, 'text', e.target.value)}
                        className="h-8"
                        maxLength={25}
                        disabled={isLocked}
                      />
                      {button.type === 'URL' && (
                        <Input
                          placeholder="https://..."
                          value={button.url || ''}
                          onChange={(e) => updateButton(index, 'url', e.target.value)}
                          className="h-8"
                          dir="ltr"
                          disabled={isLocked}
                        />
                      )}
                      {button.type === 'PHONE_NUMBER' && (
                        <Input
                          placeholder="+201234567890"
                          value={button.phone_number || ''}
                          onChange={(e) => updateButton(index, 'phone_number', e.target.value)}
                          className="h-8"
                          dir="ltr"
                          disabled={isLocked}
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeButton(index)}
                      disabled={isLocked}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <SheetFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSaving || isLocked}>
                  {isSaving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                  {isEditing ? 'حفظ التغييرات' : 'إنشاء القالب'}
                </Button>
              </SheetFooter>
            </form>
          </Form>

          {/* Preview */}
          <div className="hidden lg:block">
            <TemplatePreview 
              template={{
                ...watchedValues,
                buttons,
              }} 
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
