/**
 * Push Notifications Manager
 * Handles push notification subscription and management
 * Mobile-safe implementation with proper API availability checks
 */

import { supabase } from '@/integrations/supabase/client';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Safe check for Notification API
const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

const getNotificationPermission = (): NotificationPermission => {
  if (isNotificationSupported()) {
    return Notification.permission;
  }
  return 'denied';
};

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  /**
   * Initialize push notifications
   */
  async initialize(registration: ServiceWorkerRegistration): Promise<void> {
    this.registration = registration;
    
    // Request notification permission if not granted
    if (isNotificationSupported() && Notification.permission === 'default') {
      await this.requestPermission();
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!isNotificationSupported()) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.warn('Notification permission granted');
        await this.subscribeToPush();
      }
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.warn('VAPID public key not configured');
      return null;
    }

    try {
      const reg = this.registration as any;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
      });

      console.warn('Push subscription successful:', subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const reg = this.registration as any;
      const subscription = await reg.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.warn('Unsubscribed from push notifications');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    const reg = this.registration as any;
    return await reg.pushManager.getSubscription();
  }

  /**
   * Show local notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return;
    }

    if (!isNotificationSupported() || Notification.permission !== 'granted') {
      console.warn('Notification permission not granted or not supported');
      return;
    }

    const notificationOptions: NotificationOptions = {
      icon: 'https://storage.googleapis.com/gpt-engineer-file-uploads/dmiUcYug6mgFnkhRfrySrDYZmFR2/uploads/1762298790053-uber-icon.gif',
      badge: 'https://storage.googleapis.com/gpt-engineer-file-uploads/dmiUcYug6mgFnkhRfrySrDYZmFR2/uploads/1762298790053-uber-icon.gif',
      ...options
    };

    await this.registration.showNotification(title, notificationOptions);
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.functions.invoke('push-subscribe', {
        body: subscription.toJSON(),
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      
      console.warn('✅ Push subscription stored successfully');
    } catch (error) {
      console.error('❌ Failed to store push subscription:', error);
      throw error;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  /**
   * Check if push notifications are supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' &&
           'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  /**
   * Get notification permission status
   */
  static getPermissionStatus(): NotificationPermission {
    return getNotificationPermission();
  }
}

// Export singleton instance
export const pushNotifications = PushNotificationManager.getInstance();
