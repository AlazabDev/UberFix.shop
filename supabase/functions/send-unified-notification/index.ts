import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// قوالب الرسائل
const messageTemplates = {
  request_created: {
    title: "طلب صيانة جديد",
    message: (data: any) => `تم إنشاء طلب صيانة جديد: ${data.request_title}`,
    email_subject: "طلب صيانة جديد - UberFix",
    email_html: (data: any) => `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #2563eb;">طلب صيانة جديد</h2>
        <p>تم إنشاء طلب صيانة جديد:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>العنوان:</strong> ${data.request_title}</p>
          ${data.property_name ? `<p><strong>العقار:</strong> ${data.property_name}</p>` : ''}
          <p><strong>الحالة:</strong> ${data.request_status || 'مفتوح'}</p>
        </div>
        <p>يرجى متابعة الطلب من لوحة التحكم.</p>
      </div>
    `
  },
  status_updated: {
    title: "تحديث حالة الطلب",
    message: (data: any) => `تم تحديث حالة طلب "${data.request_title}" من ${data.old_status} إلى ${data.new_status}`,
    email_subject: "تحديث حالة طلب الصيانة - UberFix",
    email_html: (data: any) => `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #2563eb;">تحديث حالة الطلب</h2>
        <p>تم تحديث حالة طلب الصيانة الخاص بك:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>العنوان:</strong> ${data.request_title}</p>
          <p><strong>الحالة السابقة:</strong> <span style="color: #6b7280;">${data.old_status}</span></p>
          <p><strong>الحالة الجديدة:</strong> <span style="color: #059669;">${data.new_status}</span></p>
          ${data.notes ? `<p><strong>ملاحظات:</strong> ${data.notes}</p>` : ''}
        </div>
      </div>
    `
  },
  vendor_assigned: {
    title: "تم تخصيص فني",
    message: (data: any) => `تم تخصيص الفني ${data.vendor_name} لطلب "${data.request_title}"`,
    email_subject: "تم تخصيص فني لطلبك - UberFix",
    email_html: (data: any) => `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #2563eb;">تم تخصيص فني</h2>
        <p>تم تخصيص فني لطلب الصيانة الخاص بك:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>الطلب:</strong> ${data.request_title}</p>
          <p><strong>الفني:</strong> ${data.vendor_name}</p>
        </div>
        <p>سيتواصل معك الفني قريباً.</p>
      </div>
    `
  },
  sla_warning: {
    title: "⚠️ تنبيه SLA",
    message: (data: any) => `تنبيه: اقتراب موعد استحقاق SLA للطلب "${data.request_title}"`,
    email_subject: "⚠️ تنبيه موعد استحقاق SLA - UberFix",
    email_html: (data: any) => `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #dc2626;">⚠️ تنبيه موعد استحقاق</h2>
        <p>يقترب موعد استحقاق SLA للطلب التالي:</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626;">
          <p><strong>الطلب:</strong> ${data.request_title}</p>
          <p><strong>الموعد النهائي:</strong> ${data.sla_deadline}</p>
        </div>
        <p style="color: #dc2626;"><strong>يرجى اتخاذ الإجراء اللازم فوراً!</strong></p>
      </div>
    `
  },
  request_completed: {
    title: "تم إكمال الطلب",
    message: (data: any) => `تم إكمال طلب الصيانة: ${data.request_title}`,
    email_subject: "تم إكمال طلب الصيانة - UberFix",
    email_html: (data: any) => `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #059669;">✓ تم إكمال الطلب</h2>
        <p>تم إكمال طلب الصيانة الخاص بك بنجاح:</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #059669;">
          <p><strong>الطلب:</strong> ${data.request_title}</p>
          ${data.notes ? `<p><strong>ملاحظات الفني:</strong> ${data.notes}</p>` : ''}
        </div>
        <p>نرجو أن تكون راضياً عن الخدمة. يمكنك تقييم الخدمة من لوحة التحكم.</p>
      </div>
    `
  }
};

const sendInAppNotification = async (
  recipient_id: string,
  title: string,
  message: string,
  type: string,
  entity_id: string
) => {
  try {
    const { error } = await supabase.from('notifications').insert({
      recipient_id,
      title,
      message,
      type: type === 'sla_warning' ? 'warning' : type === 'request_completed' ? 'success' : 'info',
      entity_type: 'maintenance_request',
      entity_id
    });

    if (error) throw error;
    console.log('In-app notification sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending in-app notification:', error);
    return { success: false, error };
  }
};

const sendEmailNotification = async (
  email: string,
  subject: string,
  html: string
) => {
  try {
    const result = await resend.emails.send({
      from: 'UberFix <notifications@uberfix.shop>',
      to: [email],
      subject,
      html
    });

    console.log('Email sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

const sendSMSNotification = async (
  phone: string,
  message: string
) => {
  try {
    // استخدام Twilio لإرسال SMS
    const result = await supabase.functions.invoke('send-twilio-message', {
      body: {
        to: phone,
        message: message
      }
    });

    console.log('SMS sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error };
  }
};

const sendWhatsAppNotification = async (
  phone: string,
  message: string
) => {
  try {
    const result = await supabase.functions.invoke('send-whatsapp', {
      body: {
        to: phone,
        message: message
      }
    });

    console.log('WhatsApp sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return { success: false, error };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: NotificationRequest = await req.json();
    
    console.log('Processing notification:', requestData);

    const template = messageTemplates[requestData.type];
    if (!template) {
      throw new Error(`Unknown notification type: ${requestData.type}`);
    }

    const channels = requestData.channels || ['in_app'];
    const results: any = {
      in_app: null,
      email: null,
      sms: null,
      whatsapp: null
    };

    const title = template.title;
    const message = template.message(requestData.data || {});

    // 1. إرسال إشعار داخل التطبيق (دائماً)
    if (channels.includes('in_app')) {
      results.in_app = await sendInAppNotification(
        requestData.recipient_id,
        title,
        message,
        requestData.type,
        requestData.request_id
      );
    }

    // 2. إرسال بريد إلكتروني
    if (channels.includes('email') && requestData.recipient_email) {
      results.email = await sendEmailNotification(
        requestData.recipient_email,
        template.email_subject,
        template.email_html(requestData.data || {})
      );
    }

    // 3. إرسال SMS
    if (channels.includes('sms') && requestData.recipient_phone) {
      results.sms = await sendSMSNotification(
        requestData.recipient_phone,
        message
      );
    }

    // 4. إرسال WhatsApp
    if (channels.includes('whatsapp') && requestData.recipient_phone) {
      results.whatsapp = await sendWhatsAppNotification(
        requestData.recipient_phone,
        message
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notifications processed',
        results
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-unified-notification:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
