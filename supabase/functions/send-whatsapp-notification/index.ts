import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, status, phone } = await req.json();

    if (!requestId || !status || !phone) {
      throw new Error('Missing required parameters');
    }

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    // Message templates based on status
    const messages: Record<string, string> = {
      'SUBMITTED': `✅ تم استلام طلب الصيانة الخاص بك\nرقم الطلب: ${requestId}\nسيتم التواصل معك قريباً`,
      'ASSIGNED': `👨‍🔧 تم تعيين فني لطلبك\nرقم الطلب: ${requestId}\nالحالة: قيد التنفيذ`,
      'IN_PROGRESS': `🔨 الفني بدأ تنفيذ طلب الصيانة\nرقم الطلب: ${requestId}`,
      'COMPLETED': `✨ تم الانتهاء من طلب الصيانة\nرقم الطلب: ${requestId}\nنشكرك على التعامل معنا`,
      'BILLED': `💵 تم إصدار فاتورة لطلبك\nرقم الطلب: ${requestId}\nيمكنك استعراضها من حسابك`,
    };

    const message = messages[status] || `تحديث على طلب الصيانة رقم: ${requestId}`;

    // Send WhatsApp message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:${TWILIO_PHONE_NUMBER}`,
        To: `whatsapp:${phone}`,
        Body: message,
      }),
    });

    const twilioResponse = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio error: ${JSON.stringify(twilioResponse)}`);
    }

    // Log to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('message_logs').insert({
      recipient: phone,
      message_content: message,
      message_type: 'whatsapp',
      provider: 'twilio',
      status: 'sent',
      external_id: twilioResponse.sid,
      request_id: requestId,
    });

    console.log(`WhatsApp notification sent successfully for request ${requestId}`);

    return new Response(
      JSON.stringify({ success: true, messageId: twilioResponse.sid }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
