import { useState, useEffect } from 'react';
import { pushNotifications, PushNotificationManager } from '@/lib/pushNotifications';

interface PWAStatus {
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
  notificationPermission: NotificationPermission;
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isUpdateAvailable: false,
    canInstall: false,
    notificationPermission: 'default'
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if app is installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;

    const frame = requestAnimationFrame(() => {
      setStatus(prev => ({
        ...prev,
        isInstalled: isStandalone || isIOSStandalone,
        notificationPermission: Notification.permission
      }));
    });

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setStatus(prev => ({ ...prev, canInstall: true }));
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setStatus(prev => ({ ...prev, canInstall: false }));
      return true;
    }
    
    return false;
  };

  const requestNotificationPermission = async () => {
    const permission = await pushNotifications.requestPermission();
    setStatus(prev => ({ ...prev, notificationPermission: permission }));
    return permission;
  };

  const showNotification = async (title: string, options?: NotificationOptions) => {
    await pushNotifications.showNotification(title, options);
  };

  return {
    ...status,
    installApp,
    requestNotificationPermission,
    showNotification,
    isPushSupported: PushNotificationManager.isSupported()
  };
}
