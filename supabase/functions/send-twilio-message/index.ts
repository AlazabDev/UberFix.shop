import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwilioMessageRequest {
  to: string;
  message: string;
  type?: 'sms' | 'whatsapp';
  requestId?: string;
  templateId?: string;
  variables?: Record<string, string>;
  media_url?: string;
}

// التحقق من صحة رقم الهاتف (صيغة دولية)
function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(phone);
}

// التحقق من طول الرسالة
function validateMessage(msg: string, type: string): boolean {
  const maxLength = type === 'whatsapp' ? 4096 : 1600;
  return msg.length > 0 && msg.length <= maxLength;
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

    // التحقق من المستخدم (اختياري - يمكن استخدامها داخلياً بدون auth)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && user) {
        userId = user.id;
        
        // Rate limiting للمستخدمين المسجلين
        const { data: recentMessages } = await supabase
          .from('message_logs')
          .select('created_at')
          .eq('metadata->>sender_id', userId)
          .gte('created_at', new Date(Date.now() - 60000).toISOString());

        if (recentMessages && recentMessages.length >= 10) {
          throw new Error('Rate limit exceeded. Maximum 10 messages per minute.');
        }
      }
    }

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '+12294082463';
    const twilioWhatsAppNumber = 'whatsapp:+14155238886';

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Missing Twilio credentials');
    }

    const requestData: TwilioMessageRequest = await req.json();
    const { to, message, type = 'sms', requestId, templateId, variables, media_url } = requestData;

    if (!to || !message) {
      throw new Error('Missing required fields: to, message');
    }

    console.log('📤 Sending message:', { to, type, requestId, templateId });

    // تجهيز رقم المرسل والمستقبل
    let fromNumber = type === 'whatsapp' ? twilioWhatsAppNumber : twilioPhoneNumber;
    let toNumber = to;

    // التحقق من صحة رقم الهاتف
    if (!to.startsWith('whatsapp:') && !to.startsWith('+')) {
      if (to.startsWith('01')) {
        toNumber = `+2${to}`;
      } else if (to.startsWith('201')) {
        toNumber = `+${to}`;
      }
    }

    // إضافة بادئة whatsapp إذا لزم الأمر
    if (type === 'whatsapp' && !toNumber.startsWith('whatsapp:')) {
      toNumber = `whatsapp:${toNumber}`;
    }

    // التحقق من صحة الرقم بعد التنسيق
    const cleanNumber = toNumber.replace('whatsapp:', '');
    if (!validatePhoneNumber(cleanNumber)) {
      throw new Error('Invalid phone number format. Use international format: +201234567890');
    }

    // التحقق من طول الرسالة
    if (!validateMessage(message, type)) {
      const maxLength = type === 'whatsapp' ? 4096 : 1600;
      throw new Error(`Message must be between 1 and ${maxLength} characters`);
    }

    // إعداد الجسم الأساسي للرسالة
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    let messageBody = message;
    let formData: Record<string, string> = {
      To: toNumber,
      From: fromNumber,
    };

    // إذا كان هناك قالب WhatsApp
    if (type === 'whatsapp' && templateId) {
      formData['ContentSid'] = templateId;
      if (variables) {
        formData['ContentVariables'] = JSON.stringify(variables);
      }
    } else {
      formData['Body'] = messageBody;
    }

    // إضافة media_url إذا وجد
    if (media_url) {
      formData['MediaUrl'] = media_url;
    }

    // إضافة webhook للحالة
    formData['StatusCallback'] = `${supabaseUrl}/functions/v1/twilio-delivery-status`;

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
        message_type: type,
        message_content: messageBody,
        provider: 'twilio',
        status: 'failed',
        error_message: twilioResult.message || 'Unknown error',
        metadata: {
          sender_id: userId,
          twilio_error: twilioResult,
          has_media: !!media_url,
          template_id: templateId,
        }
      });

      throw new Error(twilioResult.message || 'Failed to send message');
    }

    console.log('✅ Message sent successfully:', twilioResult.sid);

    // حفظ السجل في قاعدة البيانات
    const { error: dbError } = await supabase.from('message_logs').insert({
      request_id: requestId,
      recipient: toNumber,
      message_type: type,
      message_content: messageBody,
      provider: 'twilio',
      status: twilioResult.status,
      external_id: twilioResult.sid,
      sent_at: new Date().toISOString(),
      metadata: {
        sender_id: userId,
        price: twilioResult.price,
        price_unit: twilioResult.price_unit,
        has_media: !!media_url,
        template_id: templateId,
        variables: variables,
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
        type
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in send-twilio-message:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
