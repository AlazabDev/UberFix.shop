import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    console.log('🚨 Twilio Fallback triggered:', body);

    // Log the error details
    const errorLog = {
      timestamp: new Date().toISOString(),
      from: body.From,
      to: body.To,
      messageSid: body.MessageSid,
      errorCode: body.ErrorCode,
      errorMessage: body.ErrorMessage,
      originalUrl: body.OriginalUrl,
      body: JSON.stringify(body),
    };

    console.error('Twilio Fallback Error:', errorLog);

    // رد تلقائي للمستخدم
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>عذراً، حدث خطأ مؤقت في النظام. سيتم التواصل معك قريباً.</Message>
</Response>`;

    return new Response(twiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error in fallback function:', error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>نعتذر عن المشكلة التقنية. يرجى المحاولة لاحقاً.</Message>
</Response>`;

    return new Response(errorTwiml, {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml',
      },
    });
  }
});
