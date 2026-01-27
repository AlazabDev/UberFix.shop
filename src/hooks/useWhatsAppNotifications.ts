import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook لإدارة إشعارات WhatsApp
 * 
 * @example
 * const { sendStatusNotification, sendCustomMessage, loading } = useWhatsAppNotifications();
 * 
 * // إرسال إشعار تغيير الحالة
 * await sendStatusNotification(requestId, 'assigned', { technicianName: 'أحمد' });
 * 
 * // إرسال رسالة مخصصة
 * await sendCustomMessage('+201234567890', 'رسالة اختبار');
 */

type StatusType = 
  | 'pending' 
  | 'assigned' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled'
  | 'technician_on_way'
  | 'appointment_reminder';

interface NotificationOptions {
  technicianName?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  customMessage?: string;
  sendSMS?: boolean;
}

interface NotificationResult {
  success: boolean;
  results?: Array<{ channel: string; success: boolean; error?: string }>;
  error?: string;
}

export function useWhatsAppNotifications() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * إرسال إشعار تغيير الحالة
   */
  const sendStatusNotification = useCallback(async (
    requestId: string,
    newStatus: StatusType,
    options: NotificationOptions = {}
  ): Promise<NotificationResult> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('send-maintenance-notification', {
        body: {
          request_id: requestId,
          new_status: newStatus,
          event_type: `request_${newStatus}`,
          send_whatsapp: true,
          send_sms: options.sendSMS || false,
          technician_name: options.technicianName,
          scheduled_date: options.scheduledDate,
          scheduled_time: options.scheduledTime,
          message: options.customMessage
        }
      });

      if (error) throw error;

      if (data.success) {
        const whatsappResult = data.results?.find((r: { channel: string }) => r.channel === 'whatsapp');
        if (whatsappResult?.success) {
          toast({
            title: 'تم إرسال الإشعار',
            description: 'تم إرسال إشعار WhatsApp للعميل بنجاح',
          });
        }
      }

      return data as NotificationResult;
    } catch (error) {
      console.error('Notification error:', error);
      toast({
        title: 'خطأ في الإرسال',
        description: error instanceof Error ? error.message : 'فشل في إرسال الإشعار',
        variant: 'destructive',
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * إرسال رسالة WhatsApp مخصصة عبر Meta API
   */
  const sendCustomMessage = useCallback(async (
    phone: string,
    message: string,
    requestId?: string
  ): Promise<NotificationResult> => {
    try {
      setLoading(true);

      // استخدام Meta API مباشرة بدلاً من Twilio
      const { data, error } = await supabase.functions.invoke('send-whatsapp-meta', {
        body: {
          to: phone,
          message,
          requestId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'تم الإرسال',
          description: 'تم إرسال رسالة WhatsApp بنجاح',
        });
      }

      return { success: data.success };
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: 'خطأ في الإرسال',
        description: error instanceof Error ? error.message : 'فشل في إرسال الرسالة',
        variant: 'destructive',
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * إرسال تذكير بالموعد
   */
  const sendAppointmentReminder = useCallback(async (
    requestId: string,
    date: string,
    time: string
  ): Promise<NotificationResult> => {
    return sendStatusNotification(requestId, 'appointment_reminder', {
      scheduledDate: date,
      scheduledTime: time
    });
  }, [sendStatusNotification]);

  /**
   * إرسال إشعار "الفني في الطريق"
   */
  const sendTechnicianOnWay = useCallback(async (
    requestId: string,
    technicianName: string
  ): Promise<NotificationResult> => {
    return sendStatusNotification(requestId, 'technician_on_way', {
      technicianName
    });
  }, [sendStatusNotification]);

  return {
    sendStatusNotification,
    sendCustomMessage,
    sendAppointmentReminder,
    sendTechnicianOnWay,
    loading,
    isSending: loading
  };
}
