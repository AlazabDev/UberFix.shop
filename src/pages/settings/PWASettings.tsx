import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { OfflineStorage } from '@/lib/offlineStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  Download, 
  Trash2, 
  HardDrive,
  Settings,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function PWASettings() {
  const { 
    isInstalled, 
    notificationPermission, 
    canInstall, 
    installApp,
    requestNotificationPermission,
    isPushSupported 
  } = usePWA();
  
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    calculateStorageSize();
  }, []);

  const calculateStorageSize = async () => {
    try {
      // Calculate localStorage size
      let localStorageSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localStorageSize += localStorage[key].length + key.length;
        }
      }
      setCacheSize(localStorageSize);

      // Get storage estimate
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setStorageEstimate({
          usage: estimate.usage || 0,
          quota: estimate.quota || 0
        });
      }
    } catch (error) {
      console.error('Error calculating storage:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleClearCache = async () => {
    try {
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear offline storage
      OfflineStorage.clear();

      await calculateStorageSize();

      toast({
        title: "تم مسح الكاش",
        description: "تم مسح جميع البيانات المخزنة مؤقتاً بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل مسح الكاش",
        variant: "destructive"
      });
    }
  };

  const handleUnregisterSW = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        
        toast({
          title: "تم إلغاء التسجيل",
          description: "تم إلغاء تسجيل Service Worker. قم بتحديث الصفحة لإعادة التفعيل.",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إلغاء تسجيل Service Worker",
        variant: "destructive"
      });
    }
  };

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "تم التثبيت",
        description: "تم تثبيت التطبيق بنجاح",
      });
    }
  };

  const handleNotifications = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      toast({
        title: "تم التفعيل",
        description: "تم تفعيل الإشعارات بنجاح",
      });
    } else {
      toast({
        title: "تم الرفض",
        description: "تم رفض إذن الإشعارات",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">إعدادات PWA</h1>
          <p className="text-muted-foreground">إدارة التطبيق التدريجي والتخزين المحلي</p>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-5 w-5 text-success" /> : <WifiOff className="h-5 w-5 text-destructive" />}
            حالة الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">الاتصال بالإنترنت</span>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "متصل" : "غير متصل"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Installation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            حالة التثبيت
          </CardTitle>
          <CardDescription>
            تثبيت التطبيق للعمل مثل التطبيقات الأصلية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>التطبيق مثبت</Label>
            {isInstalled ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          {canInstall && !isInstalled && (
            <Button onClick={handleInstall} className="w-full">
              <Download className="ml-2 h-4 w-4" />
              تثبيت التطبيق
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      {isPushSupported && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {notificationPermission === 'granted' ? (
                <Bell className="h-5 w-5" />
              ) : (
                <BellOff className="h-5 w-5" />
              )}
              الإشعارات
            </CardTitle>
            <CardDescription>
              تلقي إشعارات فورية عن التحديثات والطلبات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>حالة الإشعارات</Label>
              <Badge variant={
                notificationPermission === 'granted' ? 'default' :
                notificationPermission === 'denied' ? 'destructive' : 'secondary'
              }>
                {notificationPermission === 'granted' ? 'مفعلة' :
                 notificationPermission === 'denied' ? 'محظورة' : 'غير مفعلة'}
              </Badge>
            </div>
            {notificationPermission === 'default' && (
              <Button onClick={handleNotifications} className="w-full">
                <Bell className="ml-2 h-4 w-4" />
                تفعيل الإشعارات
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Storage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            معلومات التخزين
          </CardTitle>
          <CardDescription>
            حجم البيانات المخزنة محلياً
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">حجم localStorage</span>
              <Badge variant="outline">{formatBytes(cacheSize)}</Badge>
            </div>
            
            {storageEstimate && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">إجمالي المساحة المستخدمة</span>
                  <Badge variant="outline">{formatBytes(storageEstimate.usage)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">المساحة المتاحة</span>
                  <Badge variant="outline">{formatBytes(storageEstimate.quota)}</Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all" 
                    style={{ 
                      width: `${(storageEstimate.usage / storageEstimate.quota) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  تم استخدام {((storageEstimate.usage / storageEstimate.quota) * 100).toFixed(2)}% من المساحة
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            إدارة الكاش
          </CardTitle>
          <CardDescription>
            مسح البيانات المخزنة مؤقتاً لتحرير المساحة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleClearCache} 
            variant="outline" 
            className="w-full"
          >
            <Trash2 className="ml-2 h-4 w-4" />
            مسح جميع البيانات المؤقتة
          </Button>
          
          <Button 
            onClick={handleUnregisterSW} 
            variant="outline" 
            className="w-full"
          >
            <XCircle className="ml-2 h-4 w-4" />
            إلغاء تسجيل Service Worker
          </Button>

          <p className="text-xs text-muted-foreground">
            ⚠️ ملاحظة: مسح البيانات سيزيل جميع البيانات المخزنة محلياً
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
