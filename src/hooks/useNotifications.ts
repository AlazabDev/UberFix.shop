import { useState, useEffect } from 'react';
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

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
  }, []);

  const fetchNotifications = async () => {
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
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
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
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const createNotification = async (
    notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>,
    sendEmail: boolean = false,
    emailData?: {
      recipient_email: string;
      recipient_name: string;
      notification_type: 'request_created' | 'status_update' | 'vendor_assigned' | 'request_completed';
      request_id: string;
      request_title: string;
      request_status?: string;
      vendor_name?: string;
      notes?: string;
    }
  ) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;

      // إرسال بريد إلكتروني إذا كان مطلوباً
      if (sendEmail && emailData) {
        try {
          await supabase.functions.invoke('send-email-notification', {
            body: emailData
          });
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // لا نريد فشل الإشعار بسبب فشل البريد
        }
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'خطأ في إرسال الإشعار' };
    }
  };

  return { 
    notifications, 
    loading, 
    error, 
    unreadCount,
    markAsRead, 
    markAllAsRead,
    createNotification,
    refetch: fetchNotifications 
  };
};