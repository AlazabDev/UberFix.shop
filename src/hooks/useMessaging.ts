import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook موحد لإرسال الرسائل
 * 
 * SMS: عبر Twilio
 * WhatsApp: عبر Meta Graph API مباشرة
 * 
 * @example
 * const { sendSMS, sendWhatsApp, loading } = useMessaging();
 * 
 * // إرسال SMS
 * await sendSMS('+201234567890', 'مرحباً');
 * 
 * // إرسال WhatsApp
 * await sendWhatsApp('+201234567890', 'مرحباً');
 */

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function useMessaging() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * إرسال رسالة SMS عبر Twilio
   */
  const sendSMS = async (to: string, message: string, requestId?: string): Promise<SendResult> => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('send-twilio-message', {
        body: { to, message, type: 'sms', requestId },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {}
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'فشل في إرسال الرسالة');
      }

      toast({
        title: 'تم إرسال SMS',
        description: 'تم إرسال الرسالة النصية بنجاح',
      });

      return { success: true, messageId: data.messageSid };
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'خطأ في إرسال SMS',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    } finally {
      setLoading(false);
    }
  };

  /**
   * إرسال رسالة WhatsApp عبر Meta API
   */
  const sendWhatsApp = async (
    to: string, 
    message: string, 
    options?: {
      requestId?: string;
      mediaUrl?: string;
      mediaType?: 'image' | 'video' | 'document';
      buttons?: Array<{ id: string; title: string }>;
    }
  ): Promise<SendResult> => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('send-whatsapp-meta', {
        body: { 
          to, 
          message, 
          requestId: options?.requestId,
          mediaUrl: options?.mediaUrl,
          mediaType: options?.mediaType,
          buttons: options?.buttons
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {}
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'فشل في إرسال الرسالة');
      }

      toast({
        title: 'تم إرسال WhatsApp',
        description: 'تم إرسال رسالة WhatsApp بنجاح',
      });

      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast({
        title: 'خطأ في إرسال WhatsApp',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    } finally {
      setLoading(false);
    }
  };

  /**
   * إرسال رسالة WhatsApp باستخدام قالب Meta معتمد
   */
  const sendWhatsAppTemplate = async (
    to: string,
    templateName: string,
    templateComponents?: Array<{
      type: string;
      parameters: Array<{ type: string; text?: string }>;
    }>,
    requestId?: string
  ): Promise<SendResult> => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('send-whatsapp-meta', {
        body: { 
          to, 
          message: '', 
          type: 'template',
          templateName,
          templateComponents,
          requestId
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {}
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'فشل في إرسال القالب');
      }

      toast({
        title: 'تم إرسال القالب',
        description: 'تم إرسال قالب WhatsApp بنجاح',
      });

      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error('Error sending WhatsApp template:', error);
      toast({
        title: 'خطأ في إرسال القالب',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendSMS,
    sendWhatsApp,
    sendWhatsAppTemplate,
    loading,
    isSending: loading,
  };
}
