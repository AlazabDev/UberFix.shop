/**
 * Push Notifications Manager
 * Handles push notification subscription and management
 */

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

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
    if (Notification.permission === 'default') {
      await this.requestPermission();
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      await this.subscribeToPush();
    }
    
    return permission;
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
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource
      });

      console.log('Push subscription successful:', subscription);
      
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
      const subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
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

    return await this.registration.pushManager.getSubscription();
  }

  /**
   * Show local notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
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
      const { supabase } = await import('@/integrations/supabase/client');
      
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
      
      console.log('✅ Push subscription stored successfully');
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
      .replace(/\-/g, '+')
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
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  /**
   * Get notification permission status
   */
  static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
}

// Export singleton instance
export const pushNotifications = PushNotificationManager.getInstance();
