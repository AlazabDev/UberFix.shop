import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * SMS Messaging via Twilio
 * ========================
 * هذه الوظيفة مخصصة فقط لإرسال رسائل SMS عبر Twilio
 * 
 * ملاحظة: WhatsApp يتم إرساله عبر Meta API مباشرة (send-whatsapp-meta)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSMessageRequest {
  to: string;
  message: string;
  type?: 'sms' | 'whatsapp'; // للتوافق مع الطلبات القديمة
  requestId?: string;
}

// التحقق من صحة رقم الهاتف (صيغة دولية)
function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(phone);
}

// التحقق من طول الرسالة
function validateMessage(msg: string): boolean {
  const maxLength = 1600; // SMS limit
  return msg.length > 0 && msg.length <= maxLength;
}

// تنسيق رقم الهاتف
function formatPhoneNumber(phone: string): string {
  let formatted = phone;
  
  if (!phone.startsWith('+')) {
    if (phone.startsWith('01')) {
      formatted = `+2${phone}`;
    } else if (phone.startsWith('201')) {
      formatted = `+${phone}`;
    } else {
      formatted = `+${phone}`;
    }
  }
  
  return formatted;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // التحقق من المستخدم (اختياري)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
        userId = user.id;
        
        // Rate limiting
        const { data: recentMessages } = await supabase
          .from('message_logs')
          .select('created_at')
          .eq('metadata->>sender_id', userId)
          .gte('created_at', new Date(Date.now() - 60000).toISOString());

        if (recentMessages && recentMessages.length >= 10) {
          return new Response(
            JSON.stringify({ success: false, error: 'Rate limit exceeded. Maximum 10 messages per minute.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '+12294082463';

    if (!twilioAccountSid || !twilioAuthToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing Twilio credentials for SMS' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: SMSMessageRequest = await req.json();
    const { to, message, type = 'sms', requestId } = requestData;

    // التحقق من نوع الرسالة - فقط SMS مدعوم
    if (type === 'whatsapp') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WhatsApp messages should use send-whatsapp-meta function instead',
          redirect: 'send-whatsapp-meta'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!to || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: to, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📤 Sending SMS via Twilio:', { to, requestId });

    // تنسيق رقم الهاتف
    const toNumber = formatPhoneNumber(to);

    // التحقق من صحة الرقم
    if (!validatePhoneNumber(toNumber)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phone number format. Use international format: +201234567890' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // التحقق من طول الرسالة
    if (!validateMessage(message)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Message must be between 1 and 1600 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // إعداد الطلب لـ Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData: Record<string, string> = {
      To: toNumber,
      From: twilioPhoneNumber,
      Body: message,
      StatusCallback: `${supabaseUrl}/functions/v1/twilio-delivery-status`
    };

    // تحويل البيانات إلى URL-encoded
    const encodedData = Object.entries(formData)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    // إرسال الطلب إلى Twilio
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`)
      },
      body: encodedData
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('❌ Twilio error:', twilioResult);
      
      // حفظ سجل الخطأ
      await supabase.from('message_logs').insert({
        request_id: requestId,
        recipient: toNumber,
        message_type: 'sms',
        message_content: message,
        provider: 'twilio',
        status: 'failed',
        error_message: twilioResult.message || 'Unknown error',
        metadata: {
          sender_id: userId,
          twilio_error: twilioResult
        }
      });

      return new Response(
        JSON.stringify({ success: false, error: twilioResult.message || 'Failed to send SMS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ SMS sent successfully:', twilioResult.sid);

    // حفظ السجل في قاعدة البيانات
    const { error: dbError } = await supabase.from('message_logs').insert({
      request_id: requestId,
      recipient: toNumber,
      message_type: 'sms',
      message_content: message,
      provider: 'twilio',
      status: twilioResult.status,
      external_id: twilioResult.sid,
      sent_at: new Date().toISOString(),
      metadata: {
        sender_id: userId,
        price: twilioResult.price,
        price_unit: twilioResult.price_unit
      }
    });

    if (dbError) {
      console.error('⚠️ Failed to log message:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageSid: twilioResult.sid,
        status: twilioResult.status,
        to: toNumber,
        type: 'sms',
        provider: 'twilio'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in send-twilio-message (SMS):', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
