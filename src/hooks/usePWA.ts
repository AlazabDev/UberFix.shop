import { useState, useEffect } from 'react';
import { pushNotifications, PushNotificationManager } from '@/lib/pushNotifications';

interface PWAStatus {
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
  notificationPermission: NotificationPermission;
}

// Safe check for Notification API availability
const getNotificationPermission = (): NotificationPermission => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
};

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isUpdateAvailable: false,
    canInstall: false,
    notificationPermission: 'denied'
  });
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window === 'undefined') return;

    // Check if app is installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;

    const frame = requestAnimationFrame(() => {
      setStatus(prev => ({
        ...prev,
        isInstalled: isStandalone || isIOSStandalone,
        notificationPermission: getNotificationPermission()
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
