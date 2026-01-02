import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

/**
 * Event-Driven Notification System
 * مربوط بدورة حياة طلب الصيانة - UberFix Maintenance Timeline
 * 
 * القاعدة الحاكمة: كل تغيير حالة مؤثّر على العميل = إشعار واحد فقط
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ==========================================
// Types & Interfaces
// ==========================================
type NotificationChannel = 'email' | 'whatsapp';
type NotificationStatus = 'received' | 'reviewed' | 'scheduled' | 'on_the_way' | 'in_progress' | 'completed' | 'closed';

interface NotificationRequest {
  request_id: string;
  event_type?: string;
  old_status?: string;
  new_status?: string;
  old_stage?: string;
  new_stage?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  technician_name?: string;
  message?: string;
  send_whatsapp?: boolean;
  send_sms?: boolean;
  send_email?: boolean;
}

interface NotificationTemplate {
  status: NotificationStatus;
  channels: NotificationChannel[];
  email?: {
    subject: string;
    bodyTemplate: string;
    buttonText: string;
  };
  whatsapp?: {
    template: string;
    buttonText: string;
  };
}

// ==========================================
// Notification Templates - Based on UberFix Timeline
// ==========================================
const NOTIFICATION_TEMPLATES: Record<NotificationStatus, NotificationTemplate> = {
  received: {
    status: 'received',
    channels: ['email', 'whatsapp'],
    email: {
      subject: 'تم استلام طلب الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تم استلام طلب الصيانة الخاص بك بنجاح.
رقم الطلب: {{order_id}}
سنقوم بمراجعته والعودة إليك بالتحديثات.`,
      buttonText: 'تتبّع طلب الصيانة',
    },
    whatsapp: {
      template: `تم استلام طلب الصيانة بنجاح ✅
رقم الطلب: {{order_id}}
يمكنك متابعة حالة الطلب من هنا 👇
{{track_url}}`,
      buttonText: 'تتبّع الطلب',
    },
  },

  reviewed: {
    status: 'reviewed',
    channels: ['email'],
    email: {
      subject: 'تمت مراجعة طلب الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تمت مراجعة طلب الصيانة وجارٍ تجهيز التفاصيل اللازمة.`,
      buttonText: 'عرض حالة الطلب',
    },
  },

  scheduled: {
    status: 'scheduled',
    channels: ['email', 'whatsapp'],
    email: {
      subject: 'تم تحديد موعد الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تم تحديد موعد الزيارة كما يلي:
📅 {{date}} — ⏰ {{time}}`,
      buttonText: 'عرض / تغيير الموعد',
    },
    whatsapp: {
      template: `تم تحديد موعد الصيانة 🗓
📅 {{date}} — ⏰ {{time}}
لمراجعة التفاصيل أو تغيير الموعد:
{{track_url}}`,
      buttonText: 'إدارة الموعد',
    },
  },

  on_the_way: {
    status: 'on_the_way',
    channels: ['whatsapp'],
    whatsapp: {
      template: `الفني في الطريق إليك الآن 🚚
يمكنك متابعة الحالة لحظة بلحظة من هنا:
{{track_url}}`,
      buttonText: 'تتبّع الفني',
    },
  },

  in_progress: {
    status: 'in_progress',
    channels: ['whatsapp'],
    whatsapp: {
      template: `بدأ تنفيذ أعمال الصيانة 🛠
في حال احتجت أي تواصل أثناء التنفيذ:
{{track_url}}`,
      buttonText: 'التواصل مع الفني',
    },
  },

  completed: {
    status: 'completed',
    channels: ['email', 'whatsapp'],
    email: {
      subject: 'تم الانتهاء من أعمال الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تم الانتهاء من أعمال الصيانة بنجاح.
يرجى مراجعة الأعمال واعتماد الإغلاق.`,
      buttonText: 'اعتماد الإغلاق',
    },
    whatsapp: {
      template: `تم الانتهاء من الصيانة ✅
يرجى مراجعة الأعمال واعتماد الإغلاق:
{{track_url}}`,
      buttonText: 'اعتماد الإغلاق',
    },
  },

  closed: {
    status: 'closed',
    channels: ['email'],
    email: {
      subject: 'تم إغلاق طلب الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تم إغلاق طلب الصيانة بنجاح.
نشكرك على ثقتك في UberFix.`,
      buttonText: 'تقييم الخدمة',
    },
  },
};

// ==========================================
// Mapping Functions
// ==========================================
const stageToNotificationStatus = (stage: string): NotificationStatus | null => {
  const mapping: Record<string, NotificationStatus> = {
    'submitted': 'received',
    'acknowledged': 'reviewed',
    'assigned': 'reviewed',
    'scheduled': 'scheduled',
    'in_progress': 'in_progress',
    'inspection': 'in_progress',
    'completed': 'completed',
    'closed': 'closed',
    'paid': 'closed',
  };
  return mapping[stage] || null;
};

// Stages that don't trigger notifications
const SILENT_STAGES = ['draft', 'waiting_parts', 'on_hold', 'cancelled', 'billed'];

// ==========================================
// Helper Functions
// ==========================================
const buildTrackUrl = (orderId: string): string => {
  const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://uberfix.shop';
  return `${baseUrl}/track/${orderId}`;
};

const replaceVariables = (template: string, vars: Record<string, string>): string => {
  let result = template;
  Object.entries(vars).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  });
  return result;
};

const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '20' + cleaned.substring(1);
  }
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
};

// ==========================================
// Send Email via Resend
// ==========================================
const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  buttonText: string,
  trackUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.log('⚠️ RESEND_API_KEY not configured, skipping email');
      return { success: false, error: 'Email not configured' };
    }

    const resend = new Resend(resendApiKey);
    
    const htmlBody = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
      <h1 style="color: #2563eb; margin: 0; font-size: 28px;">UberFix</h1>
      <p style="color: #666; font-size: 14px; margin-top: 5px;">نظام إدارة الصيانة</p>
    </div>
    
    <div style="color: #333; line-height: 1.8; white-space: pre-line; font-size: 16px;">
      ${body}
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${trackUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        ${buttonText}
      </a>
    </div>
    
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    
    <p style="color: #999; font-size: 12px; text-align: center;">
      هذه رسالة آلية من نظام UberFix. لا ترد على هذا البريد.
      <br>
      <a href="${trackUrl}" style="color: #2563eb;">تتبع طلبك</a>
    </p>
  </div>
</body>
</html>`;

    const result = await resend.emails.send({
      from: 'UberFix <noreply@uberfix.shop>',
      to: [to],
      subject: subject,
      html: htmlBody,
    });

    console.log('✅ Email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// Send WhatsApp via Twilio
// ==========================================
const sendWhatsApp = async (
  supabase: ReturnType<typeof createClient>,
  to: string,
  message: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      console.log('⚠️ Twilio credentials not configured, skipping WhatsApp');
      return { success: false, error: 'WhatsApp not configured' };
    }

    const formattedTo = formatPhoneNumber(to);
    const formData = new URLSearchParams();
    formData.append('To', `whatsapp:${formattedTo}`);
    formData.append('From', `whatsapp:${fromNumber}`);
    formData.append('Body', message);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('✅ WhatsApp sent successfully:', result.sid);
      
      // Log the message
      await supabase.from('message_logs').insert({
        request_id: requestId,
        recipient: formattedTo,
        message_content: message,
        message_type: 'whatsapp',
        provider: 'twilio',
        status: 'sent',
        external_id: result.sid,
        sent_at: new Date().toISOString(),
        metadata: { type: 'notification', trigger: 'status_change' }
      });

      return { success: true };
    } else {
      console.error('❌ WhatsApp send failed:', result);
      return { success: false, error: result.message || 'Failed to send' };
    }
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// Send SMS as Fallback
// ==========================================
const sendSMS = async (
  supabase: ReturnType<typeof createClient>,
  to: string,
  message: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: 'SMS not configured' };
    }

    const formattedTo = formatPhoneNumber(to);
    // Truncate for SMS
    const smsMessage = message.replace(/\n+/g, ' ').substring(0, 160);

    const formData = new URLSearchParams();
    formData.append('To', formattedTo);
    formData.append('From', fromNumber);
    formData.append('Body', smsMessage);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SMS sent:', result.sid);
      
      await supabase.from('message_logs').insert({
        request_id: requestId,
        recipient: formattedTo,
        message_content: smsMessage,
        message_type: 'sms',
        provider: 'twilio',
        status: 'sent',
        external_id: result.sid,
        sent_at: new Date().toISOString(),
      });

      return { success: true };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ==========================================
// Main Handler
// ==========================================
const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: NotificationRequest = await req.json();
    console.log('📤 Notification request:', body);

    const { 
      request_id, 
      event_type, 
      new_stage,
      scheduled_date,
      scheduled_time,
      send_sms = false,
    } = body;

    // Validate request
    if (!request_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing request_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch request details
    const { data: request, error: fetchError } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('id', request_id)
      .single();

    if (fetchError || !request) {
      console.error('Request not found:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine stage
    const stage = new_stage || request.workflow_stage || 'submitted';
    
    // Check if this is a silent stage
    if (SILENT_STAGES.includes(stage)) {
      console.log(`📵 Stage ${stage} is silent, skipping notification`);
      return new Response(
        JSON.stringify({ success: true, message: 'Silent stage, no notification sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get notification status
    let notificationStatus = stageToNotificationStatus(stage);
    
    // Handle special event types
    if (event_type === 'request_created') {
      notificationStatus = 'received';
    } else if (event_type === 'technician_on_way') {
      notificationStatus = 'on_the_way';
    }

    if (!notificationStatus) {
      console.log(`📵 No notification template for stage: ${stage}`);
      return new Response(
        JSON.stringify({ success: true, message: 'No template for this stage' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const template = NOTIFICATION_TEMPLATES[notificationStatus];
    if (!template) {
      return new Response(
        JSON.stringify({ success: false, error: 'Template not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build variables
    const trackUrl = buildTrackUrl(request_id);
    const shortOrderId = request_id.substring(0, 8).toUpperCase();
    const variables: Record<string, string> = {
      customer_name: request.client_name || 'عميلنا العزيز',
      order_id: shortOrderId,
      track_url: trackUrl,
      date: scheduled_date || '',
      time: scheduled_time || '',
    };

    const results: Array<{ channel: string; success: boolean; error?: string }> = [];

    // Send notifications based on template channels
    for (const channel of template.channels) {
      if (channel === 'email' && template.email && request.client_email) {
        const emailBody = replaceVariables(template.email.bodyTemplate, variables);
        const emailResult = await sendEmail(
          request.client_email,
          template.email.subject,
          emailBody,
          template.email.buttonText,
          trackUrl
        );
        results.push({ channel: 'email', ...emailResult });
      }

      if (channel === 'whatsapp' && template.whatsapp && request.client_phone) {
        const whatsappMessage = replaceVariables(template.whatsapp.template, variables);
        const whatsappResult = await sendWhatsApp(
          supabase,
          request.client_phone,
          whatsappMessage,
          request_id
        );
        results.push({ channel: 'whatsapp', ...whatsappResult });

        // Send SMS as fallback if WhatsApp fails
        if (!whatsappResult.success && send_sms) {
          const smsResult = await sendSMS(
            supabase,
            request.client_phone,
            whatsappMessage,
            request_id
          );
          results.push({ channel: 'sms', ...smsResult });
        }
      }
    }

    // Also send in-app notification
    if (request.created_by) {
      const statusLabels: Record<NotificationStatus, string> = {
        received: 'تم استلام طلب الصيانة',
        reviewed: 'تمت مراجعة الطلب',
        scheduled: 'تم تحديد الموعد',
        on_the_way: 'الفني في الطريق',
        in_progress: 'جاري التنفيذ',
        completed: 'تم الانتهاء',
        closed: 'تم الإغلاق',
      };

      await supabase.from('notifications').insert({
        recipient_id: request.created_by,
        title: statusLabels[notificationStatus],
        message: `طلب رقم ${shortOrderId}`,
        type: notificationStatus === 'completed' ? 'success' : 'info',
        entity_type: 'maintenance_request',
        entity_id: request_id,
        whatsapp_sent: results.some(r => r.channel === 'whatsapp' && r.success),
      });
      results.push({ channel: 'in_app', success: true });
    }

    // Notify staff for important events
    if (['received', 'completed', 'closed'].includes(notificationStatus)) {
      const { data: staffUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'manager', 'dispatcher']);

      if (staffUsers && staffUsers.length > 0) {
        const staffNotifications = staffUsers
          .filter(u => u.user_id !== request.created_by)
          .map(u => ({
            recipient_id: u.user_id,
            title: `طلب جديد - ${shortOrderId}`,
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
        template: notificationStatus 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Notification handler error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
