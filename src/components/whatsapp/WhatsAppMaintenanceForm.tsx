import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send, Loader2, ImagePlus, X, Wrench } from 'lucide-react';
import { useWhatsAppNotifications } from '@/hooks/useWhatsAppNotifications';
import { useToast } from '@/hooks/use-toast';

const SERVICE_TYPES = [
  { value: 'ac', label: 'تكييف', emoji: '❄️' },
  { value: 'electrical', label: 'كهرباء', emoji: '⚡' },
  { value: 'plumbing', label: 'سباكة', emoji: '🔧' },
  { value: 'carpentry', label: 'نجارة', emoji: '🪚' },
  { value: 'painting', label: 'دهانات', emoji: '🎨' },
  { value: 'cleaning', label: 'تنظيف', emoji: '🧹' },
  { value: 'metalwork', label: 'حدادة', emoji: '⚙️' },
  { value: 'other', label: 'أخرى', emoji: '📋' },
];

const PRIORITIES = [
  { value: 'high', label: 'عاجل', emoji: '🔴', color: 'text-red-500' },
  { value: 'medium', label: 'متوسط', emoji: '🟡', color: 'text-yellow-500' },
  { value: 'low', label: 'عادي', emoji: '🟢', color: 'text-green-500' },
];

const BRANCHES = [
  'الفرع الرئيسي',
  'فرع المعادي',
  'فرع مدينة نصر',
  'فرع الشيخ زايد',
  'فرع التجمع الخامس',
  'فرع الإسكندرية',
];

interface WhatsAppMaintenanceFormProps {
  className?: string;
  defaultPhone?: string;
}

export function WhatsAppMaintenanceForm({ className, defaultPhone }: WhatsAppMaintenanceFormProps) {
  const [requesterName, setRequesterName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [branch, setBranch] = useState('');
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { sendCustomMessage, loading } = useWhatsAppNotifications();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'خطأ', description: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت', variant: 'destructive' });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const getServiceLabel = (val: string) => SERVICE_TYPES.find(s => s.value === val);
  const getPriorityLabel = (val: string) => PRIORITIES.find(p => p.value === val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requesterName.trim() || !serviceType || !branch || !priority || !description.trim()) {
      toast({ title: 'تنبيه', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    const service = getServiceLabel(serviceType);
    const prio = getPriorityLabel(priority);

    const message = [
      `📋 *طلب صيانة جديد*`,
      ``,
      `✍️ *مقدم الطلب:* ${requesterName.trim()}`,
      `🔧 *نوع الصيانة:* ${service?.emoji} ${service?.label}`,
      `🏢 *الفرع:* ${branch}`,
      `📋 *الأولوية:* ${prio?.emoji} ${prio?.label}`,
      ``,
      `📝 *وصف المشكلة:*`,
      description.trim(),
      imageFile ? `\n📷 *مرفق صورة*` : '',
      ``,
      `— UberFix 🛠️`,
    ].filter(Boolean).join('\n');

    // Send via WhatsApp (to admin/dispatch number)
    const result = await sendCustomMessage(
      defaultPhone || '+201000000000',
      message
    );

    if (result.success) {
      toast({ title: '✅ تم الإرسال', description: 'تم إرسال طلب الصيانة عبر WhatsApp بنجاح' });
      // Reset form
      setRequesterName('');
      setServiceType('');
      setBranch('');
      setPriority('');
      setDescription('');
      removeImage();
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          إرسال طلب صيانة عبر WhatsApp
        </CardTitle>
        <CardDescription>أرسل طلب صيانة مباشرة عبر الواتساب</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* اسم مقدم الطلب */}
          <div className="space-y-2">
            <Label htmlFor="requester-name">✍️ اسم مقدم الطلب *</Label>
            <Input
              id="requester-name"
              placeholder="أدخل اسمك الكامل"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* نوع الصيانة */}
          <div className="space-y-2">
            <Label>🔧 نوع الصيانة *</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الصيانة" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.emoji} {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* اسم الفرع */}
          <div className="space-y-2">
            <Label>🏢 اسم الفرع *</Label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفرع" />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الأولوية */}
          <div className="space-y-2">
            <Label>📋 الأولوية *</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الأولوية" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className="flex items-center gap-2">
                      {p.emoji} {p.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* وصف المشكلة */}
          <div className="space-y-2">
            <Label htmlFor="description">📝 وصف المشكلة *</Label>
            <Textarea
              id="description"
              placeholder="اشرح المشكلة بالتفصيل..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{description.length}/500 حرف</p>
          </div>

          {/* صورة المشكلة */}
          <div className="space-y-2">
            <Label>📷 صورة المشكلة (اختياري)</Label>
            {imagePreview ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">اضغط لإرفاق صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* زر الإرسال */}
          <Button
            type="submit"
            disabled={loading || !requesterName.trim() || !serviceType || !branch || !priority || !description.trim()}
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? 'جاري الإرسال...' : 'إرسال عبر WhatsApp ✅'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
