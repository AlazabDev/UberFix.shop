import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ServiceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
  userLocation?: { lat: number; lng: number; address?: string };
}

export const ServiceRequestDialog = ({
  open,
  onOpenChange,
  vendorId,
  vendorName,
  userLocation
}: ServiceRequestDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !phone.trim()) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'غير مصرح',
          description: 'يجب تسجيل الدخول أولاً',
          variant: 'destructive'
        });
        return;
      }

      // Get user's company_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على معلومات الشركة',
          variant: 'destructive'
        });
        return;
      }

      // Get a default branch for this company
      const { data: branch } = await supabase
        .from('branches')
        .select('id')
        .eq('company_id', profile.company_id)
        .limit(1)
        .single();

      if (!branch) {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على فرع للشركة',
          variant: 'destructive'
        });
        return;
      }

      const requestData = {
        title: title.trim(),
        description: description.trim(),
        assigned_vendor_id: vendorId,
        client_phone: phone.trim(),
        client_name: user.email || 'عميل',
        status: 'Open' as const,
        priority: 'medium',
        workflow_stage: 'submitted',
        created_by: user.id,
        company_id: profile.company_id,
        branch_id: branch.id,
        location: userLocation?.address || '',
      };

      const { error } = await supabase
        .from('maintenance_requests')
        .insert([requestData]);

      if (error) throw error;

      toast({
        title: 'تم الإرسال بنجاح',
        description: `تم إرسال طلبك إلى ${vendorName}`,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPhone('');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إرسال الطلب. حاول مرة أخرى.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>طلب خدمة من {vendorName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الطلب *</Label>
            <Input
              id="title"
              placeholder="مثال: صيانة تكييف"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف المشكلة *</Label>
            <Textarea
              id="description"
              placeholder="اشرح المشكلة بالتفصيل..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {userLocation?.address && (
            <div className="space-y-2">
              <Label>الموقع</Label>
              <p className="text-sm text-muted-foreground">{userLocation.address}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              'إرسال الطلب'
            )}
          </Button>
          <Button 
            onClick={() => onOpenChange(false)} 
            variant="outline"
            disabled={submitting}
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
