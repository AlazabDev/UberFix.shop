import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WhatsAppSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SettingsStatus {
  accessToken: 'configured' | 'missing' | 'checking';
  phoneNumberId: 'configured' | 'missing' | 'checking';
  wabaId: 'configured' | 'missing' | 'checking';
  verifyToken: 'configured' | 'missing' | 'checking';
}

export function WhatsAppSettingsModal({ open, onOpenChange }: WhatsAppSettingsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTokens, setShowTokens] = useState({
    accessToken: false,
    wabaId: false,
    phoneNumberId: false,
    verifyToken: false,
  });
  
  const [formData, setFormData] = useState({
    accessToken: '',
    phoneNumberId: '',
    wabaId: '',
    verifyToken: '',
  });

  const [status, setStatus] = useState<SettingsStatus>({
    accessToken: 'checking',
    phoneNumberId: 'checking',
    wabaId: 'checking',
    verifyToken: 'checking',
  });

  // Check current settings status
  useEffect(() => {
    if (open) {
      checkSettingsStatus();
    }
  }, [open]);

  const checkSettingsStatus = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      // Call a check endpoint to verify secrets exist
      const response = await fetch(
        'https://zrrffsjbfkphridqyais.supabase.co/functions/v1/whatsapp-templates?action=check-config',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatus({
          accessToken: data.accessToken ? 'configured' : 'missing',
          phoneNumberId: data.phoneNumberId ? 'configured' : 'missing',
          wabaId: data.wabaId ? 'configured' : 'missing',
          verifyToken: data.verifyToken ? 'configured' : 'missing',
        });
      } else {
        // If endpoint doesn't exist, show all as needs checking
        setStatus({
          accessToken: 'missing',
          phoneNumberId: 'missing',
          wabaId: 'missing',
          verifyToken: 'missing',
        });
      }
    } catch (error) {
      console.error('Error checking settings:', error);
      setStatus({
        accessToken: 'missing',
        phoneNumberId: 'missing',
        wabaId: 'missing',
        verifyToken: 'missing',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate WABA ID is numeric
    if (formData.wabaId && !/^\d+$/.test(formData.wabaId)) {
      toast.error('معرف حساب WhatsApp Business يجب أن يكون رقماً فقط');
      return;
    }

    setIsSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('يجب تسجيل الدخول أولاً');
        return;
      }

      // Send update request
      const response = await fetch(
        'https://zrrffsjbfkphridqyais.supabase.co/functions/v1/whatsapp-templates?action=update-config',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: formData.accessToken || undefined,
            phoneNumberId: formData.phoneNumberId || undefined,
            wabaId: formData.wabaId || undefined,
            verifyToken: formData.verifyToken || undefined,
          }),
        }
      );

      if (response.ok) {
        toast.success('تم حفظ الإعدادات بنجاح');
        setFormData({
          accessToken: '',
          phoneNumberId: '',
          wabaId: '',
          verifyToken: '',
        });
        await checkSettingsStatus();
      } else {
        const error = await response.json();
        toast.error(error.error || 'فشل في حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (statusValue: 'configured' | 'missing' | 'checking') => {
    switch (statusValue) {
      case 'configured':
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 ml-1 text-primary" />
            مُعد
          </Badge>
        );
      case 'missing':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 ml-1" />
            غير مُعد
          </Badge>
        );
      case 'checking':
        return (
          <Badge variant="outline" className="bg-muted">
            <Loader2 className="h-3 w-3 ml-1 animate-spin" />
            جاري التحقق
          </Badge>
        );
    }
  };

  const allConfigured = 
    status.accessToken === 'configured' &&
    status.phoneNumberId === 'configured' &&
    status.wabaId === 'configured';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            إعدادات WhatsApp API
          </DialogTitle>
          <DialogDescription>
            قم بتكوين بيانات Meta Graph API للمزامنة مع WhatsApp Business
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Overview */}
            <Alert variant={allConfigured ? 'default' : 'destructive'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {allConfigured 
                  ? 'جميع الإعدادات المطلوبة مُكتملة. يمكنك المزامنة مع Meta الآن.'
                  : 'بعض الإعدادات مفقودة. أكمل البيانات أدناه للمزامنة مع Meta.'}
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Access Token */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="accessToken">Access Token (System User)</Label>
                {getStatusBadge(status.accessToken)}
              </div>
              <div className="relative">
                <Input
                  id="accessToken"
                  type={showTokens.accessToken ? 'text' : 'password'}
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  placeholder={status.accessToken === 'configured' ? '••••••••••••••••' : 'أدخل التوكن الجديد'}
                  className="pr-10"
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowTokens({ ...showTokens, accessToken: !showTokens.accessToken })}
                >
                  {showTokens.accessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                احصل عليه من Meta Business Suite → System Users → Generate Token
              </p>
            </div>

            {/* WABA ID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="wabaId">WhatsApp Business Account ID</Label>
                {getStatusBadge(status.wabaId)}
              </div>
              <div className="relative">
                <Input
                  id="wabaId"
                  type={showTokens.wabaId ? 'text' : 'password'}
                  value={formData.wabaId}
                  onChange={(e) => setFormData({ ...formData, wabaId: e.target.value })}
                  placeholder={status.wabaId === 'configured' ? '••••••••' : 'مثال: 123456789012345'}
                  className="pr-10"
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowTokens({ ...showTokens, wabaId: !showTokens.wabaId })}
                >
                  {showTokens.wabaId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                رقم معرف WABA (يجب أن يكون رقماً فقط)
              </p>
            </div>

            {/* Phone Number ID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                {getStatusBadge(status.phoneNumberId)}
              </div>
              <div className="relative">
                <Input
                  id="phoneNumberId"
                  type={showTokens.phoneNumberId ? 'text' : 'password'}
                  value={formData.phoneNumberId}
                  onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                  placeholder={status.phoneNumberId === 'configured' ? '••••••••' : 'مثال: 123456789012345'}
                  className="pr-10"
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowTokens({ ...showTokens, phoneNumberId: !showTokens.phoneNumberId })}
                >
                  {showTokens.phoneNumberId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                معرف رقم الهاتف من WhatsApp Business API
              </p>
            </div>

            {/* Verify Token */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="verifyToken">Webhook Verify Token</Label>
                {getStatusBadge(status.verifyToken)}
              </div>
              <div className="relative">
                <Input
                  id="verifyToken"
                  type={showTokens.verifyToken ? 'text' : 'password'}
                  value={formData.verifyToken}
                  onChange={(e) => setFormData({ ...formData, verifyToken: e.target.value })}
                  placeholder={status.verifyToken === 'configured' ? '••••••••' : 'أدخل Verify Token'}
                  className="pr-10"
                  dir="ltr"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowTokens({ ...showTokens, verifyToken: !showTokens.verifyToken })}
                >
                  {showTokens.verifyToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                التوكن المستخدم للتحقق من Webhook في Meta
              </p>
            </div>

            <Separator />

            {/* Webhook URLs */}
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium">روابط Webhook</Label>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">WhatsApp:</span>
                  <code className="bg-background px-2 py-0.5 rounded text-[10px]">
                    .../functions/v1/whatsapp-webhook
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Templates:</span>
                  <code className="bg-background px-2 py-0.5 rounded text-[10px]">
                    .../functions/v1/whatsapp-templates-webhook
                  </code>
                </div>
              </div>
            </div>

            {/* Help Link */}
            <Button variant="link" className="p-0 h-auto text-xs" asChild>
              <a 
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 ml-1" />
                دليل إعداد WhatsApp Cloud API
              </a>
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || (!formData.accessToken && !formData.wabaId && !formData.phoneNumberId && !formData.verifyToken)}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ الإعدادات'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
