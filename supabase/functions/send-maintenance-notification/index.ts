import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

/**
 * Send Maintenance Notification
 * ==============================
 * إرسال إشعارات متعددة القنوات عند تغيير حالة طلب الصيانة
 * 
 * القنوات:
 * - WhatsApp (الأساسي)
 * - SMS (احتياطي)
 * - In-App Notifications
 * - Email (اختياري)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE = Deno.env.get('TWILIO_PHONE_NUMBER');

interface NotificationRequest {
  request_id: string;
  old_status?: string;
  new_status?: string;
  old_stage?: string;
  new_stage?: string;
  event_type: 'status_changed' | 'stage_changed' | 'request_created' | 'request_assigned' | 
              'request_scheduled' | 'request_in_progress' | 'request_completed' | 'request_cancelled' |
              'technician_on_way' | 'appointment_reminder' | 'custom';
  message?: string;
  send_whatsapp?: boolean;
  send_sms?: boolean;
  send_email?: boolean;
  scheduled_date?: string;
  scheduled_time?: string;
  technician_name?: string;
}

// ==========================================
// قوالب الرسائل لكل حالة
// ==========================================
const STATUS_MESSAGES: Record<string, (data: {title: string, techName?: string, date?: string, time?: string}) => {
  title: string;
  message: string;
  emoji: string;
}> = {
  pending: (data) => ({
    emoji: '⏳',
    title: 'تم استلام طلبك',
    message: `⏳ *تم استلام طلب الصيانة*\n\n📝 ${data.title}\n\nسيتم مراجعة طلبك والرد عليك قريباً.\n\nللمتابعة، أرسل "حالة" على واتساب.`
  }),
  
  assigned: (data) => ({
    emoji: '👷',
    title: 'تم تعيين فني',
    message: `👷 *تم تعيين فني لطلبك*\n\n📝 ${data.title}\n${data.techName ? `\n👤 الفني: ${data.techName}` : ''}\n\nسيتم التواصل معك لتحديد موعد الزيارة.`
  }),
  
  scheduled: (data) => ({
    emoji: '📅',
    title: 'تم جدولة الموعد',
    message: `📅 *تم تحديد موعد الزيارة*\n\n📝 ${data.title}\n${data.date ? `\n📆 التاريخ: ${data.date}` : ''}${data.time ? `\n⏰ الوقت: ${data.time}` : ''}\n\nسيصلك تذكير قبل الموعد.`
  }),
  
  in_progress: (data) => ({
    emoji: '🔧',
    title: 'جاري العمل',
    message: `🔧 *جاري العمل على طلبك*\n\n📝 ${data.title}\n\nالفني يعمل الآن على حل المشكلة.\nسيتم إعلامك عند الانتهاء.`
  }),
  
  completed: (data) => ({
    emoji: '✅',
    title: 'تم إتمام الخدمة',
    message: `✅ *تم إتمام طلب الصيانة بنجاح!*\n\n📝 ${data.title}\n\n🎉 شكراً لثقتك بـ UberFix!\n\n⭐ نرجو تقييم الخدمة بإرسال:\n"تقييم 5" (أو أي رقم من 1-5)`
  }),
  
  cancelled: (data) => ({
    emoji: '❌',
    title: 'تم إلغاء الطلب',
    message: `❌ *تم إلغاء طلب الصيانة*\n\n📝 ${data.title}\n\nإذا كان لديك أي استفسار، أرسل "تواصل".`
  }),
  
  technician_on_way: (data) => ({
    emoji: '🚗',
    title: 'الفني في الطريق',
    message: `🚗 *الفني في الطريق إليك!*\n\n📝 ${data.title}\n${data.techName ? `\n👤 الفني: ${data.techName}` : ''}\n\nالوقت المتوقع للوصول: 15-30 دقيقة`
  }),
  
  appointment_reminder: (data) => ({
    emoji: '⏰',
    title: 'تذكير بالموعد',
    message: `⏰ *تذكير بموعد الصيانة*\n\n📝 ${data.title}\n${data.date ? `\n📆 التاريخ: ${data.date}` : ''}${data.time ? `\n⏰ الوقت: ${data.time}` : ''}\n\nيرجى التأكد من تواجدك في الموقع.`
  })
};

// ==========================================
// إرسال WhatsApp
// ==========================================
async function sendWhatsAppNotification(
  to: string, 
  message: string,
  requestId: string,
  supabase: ReturnType<typeof createClient>
): Promise<boolean> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.log('⚠️ WhatsApp not configured, skipping');
    return false;
  }

  try {
    // تنسيق الرقم
    let formattedTo = to.replace(/\D/g, '');
    if (formattedTo.startsWith('0')) {
      formattedTo = '2' + formattedTo;
    }
    if (!formattedTo.startsWith('2') && formattedTo.length === 10) {
      formattedTo = '2' + formattedTo;
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedTo,
          type: 'text',
          text: { body: message }
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ WhatsApp error:', result);
      return false;
    }

    console.log('✅ WhatsApp sent:', result.messages?.[0]?.id);

    // حفظ في السجل
    await supabase.from('message_logs').insert({
      recipient: formattedTo,
      message_content: message,
      message_type: 'whatsapp',
      provider: 'meta',
      status: 'sent',
      external_id: result.messages?.[0]?.id,
      request_id: requestId,
      sent_at: new Date().toISOString(),
      metadata: { type: 'notification', trigger: 'status_change' }
    });

    return true;
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    return false;
  }
}

// ==========================================
// إرسال SMS (احتياطي)
// ==========================================
async function sendSMSNotification(
  to: string, 
  message: string,
  requestId: string,
  supabase: ReturnType<typeof createClient>
): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log('⚠️ Twilio not configured, skipping SMS');
    return false;
  }

  try {
    // تنسيق الرقم
    let formattedTo = to.replace(/\D/g, '');
    if (formattedTo.startsWith('0')) {
      formattedTo = '+2' + formattedTo;
    } else if (!formattedTo.startsWith('+')) {
      formattedTo = '+' + formattedTo;
    }

    // تقصير الرسالة للـ SMS
    const smsMessage = message
      .replace(/\*/g, '')
      .replace(/\n\n/g, '\n')
      .slice(0, 160);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: TWILIO_PHONE || '+12294082463',
        Body: smsMessage
      }).toString()
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ SMS error:', result);
      return false;
    }

    console.log('✅ SMS sent:', result.sid);

    // حفظ في السجل
    await supabase.from('message_logs').insert({
      recipient: formattedTo,
      message_content: smsMessage,
      message_type: 'sms',
      provider: 'twilio',
      status: 'sent',
      external_id: result.sid,
      request_id: requestId,
      sent_at: new Date().toISOString(),
      metadata: { type: 'notification', trigger: 'status_change' }
    });

    return true;
  } catch (error) {
    console.error('❌ SMS send error:', error);
    return false;
  }
}

// ==========================================
// Main Handler
// ==========================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: NotificationRequest = await req.json();
    const { 
      request_id, 
      old_status, 
      new_status, 
      event_type, 
      message,
      send_whatsapp = true,
      send_sms = false,
      scheduled_date,
      scheduled_time,
      technician_name
    } = requestData;

    console.log('📤 Notification request:', { request_id, event_type, new_status });

    // جلب معلومات الطلب
    const { data: request, error: requestError } = await supabase
      .from('maintenance_requests')
      .select(`
        id, title, client_name, client_phone, client_email, 
        created_by, status, workflow_stage,
        assigned_technician:technicians(name, phone)
      `)
      .eq('id', request_id)
      .single();

    if (requestError || !request) {
      throw new Error(`Request not found: ${requestError?.message}`);
    }

    // تحديد القالب
    const statusKey = new_status || event_type.replace('request_', '');
    const templateFn = STATUS_MESSAGES[statusKey] || STATUS_MESSAGES.pending;
    
    const templateData = {
      title: request.title,
      techName: technician_name || (request.assigned_technician as { name: string })?.name,
      date: scheduled_date,
      time: scheduled_time
    };

    const template = templateFn(templateData);
    const notificationMessage = message || template.message;

    const results: { channel: string; success: boolean; error?: string }[] = [];

    // 1. إرسال إشعار In-App للمستخدم
    if (request.created_by) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          recipient_id: request.created_by,
          title: `${template.emoji} ${template.title}`,
          message: notificationMessage.replace(/\*/g, '').replace(/\n+/g, ' ').slice(0, 200),
          type: new_status === 'completed' ? 'success' : 'info',
          entity_type: 'maintenance_request',
          entity_id: request_id,
          whatsapp_sent: send_whatsapp,
          sms_sent: send_sms
        });

      results.push({ 
        channel: 'in_app', 
        success: !notifError, 
        error: notifError?.message 
      });
    }

    // 2. إرسال WhatsApp للعميل
    if (send_whatsapp && request.client_phone) {
      const whatsappSuccess = await sendWhatsAppNotification(
        request.client_phone,
        notificationMessage,
        request_id,
        supabase
      );
      results.push({ channel: 'whatsapp', success: whatsappSuccess });
    }

    // 3. إرسال SMS كاحتياطي إذا فشل WhatsApp أو مطلوب صراحة
    const whatsappFailed = results.find(r => r.channel === 'whatsapp')?.success === false;
    if ((send_sms || whatsappFailed) && request.client_phone) {
      const smsSuccess = await sendSMSNotification(
        request.client_phone,
        notificationMessage,
        request_id,
        supabase
      );
      results.push({ channel: 'sms', success: smsSuccess });
    }

    // 4. إشعار للمسؤولين (فقط للأحداث المهمة)
    if (['request_created', 'request_completed', 'request_cancelled'].includes(event_type)) {
      const { data: staffUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'manager', 'dispatcher']);

      if (staffUsers && staffUsers.length > 0) {
        const staffNotifications = staffUsers
          .filter(u => u.user_id !== request.created_by)
          .map(u => ({
            recipient_id: u.user_id,
            title: `${template.emoji} ${template.title}`,
            message: `${request.client_name || 'عميل'}: ${request.title}`,
            type: 'info',
            entity_type: 'maintenance_request',
            entity_id: request_id
          }));

        if (staffNotifications.length > 0) {
          await supabase.from('notifications').insert(staffNotifications);
        }
      }
    }

    console.log('✅ Notifications sent:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: 'Notifications processed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Notification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
