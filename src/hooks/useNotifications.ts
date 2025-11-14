import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  recipient_id: string;
  sender_id?: string;
  entity_type?: string;
  entity_id?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

interface SendNotificationOptions {
  type: 'request_created' | 'status_updated' | 'vendor_assigned' | 'sla_warning' | 'request_completed';
  request_id: string;
  recipient_id: string;
  recipient_email?: string;
  recipient_phone?: string;
  channels?: ('email' | 'sms' | 'whatsapp' | 'in_app')[];
  data?: {
    request_title?: string;
    request_status?: string;
    old_status?: string;
    new_status?: string;
    vendor_name?: string;
    property_name?: string;
    sla_deadline?: string;
    notes?: string;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const notificationsData = (data || []) as Notification[];
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.read_at).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
      await fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);

      if (error) throw error;
      await fetchNotifications();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const sendNotification = async (options: SendNotificationOptions) => {
    try {
      console.log('Sending unified notification:', options);

      // استدعاء Edge Function الموحد
      const { data, error } = await supabase.functions.invoke('send-unified-notification', {
        body: options
      });

      if (error) throw error;

      console.log('Notification sent successfully:', data);
      
      // تحديث القائمة
      await fetchNotifications();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error sending notification:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'خطأ في إرسال الإشعار' 
      };
    }
  };

  return { 
    notifications, 
    loading, 
    error, 
    unreadCount,
    markAsRead, 
    markAllAsRead,
    sendNotification,
    refetch: fetchNotifications 
  };
};