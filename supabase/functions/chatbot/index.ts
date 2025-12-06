import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// قاعدة المعرفة للنظام
const KNOWLEDGE_BASE = `
أنت مساعد ذكي متخصص في نظام إدارة الصيانة UberFix. إليك المعلومات الأساسية:

## حول النظام:
- نظام إدارة الصيانة الذكي يساعد في تنظيم طلبات الصيانة
- يدعم إدارة العقارات والفنيين والمواعيد
- يوفر تتبع حالة الطلبات وإرسال التنبيهات

## الوظائف الرئيسية:
1. إنشاء طلبات صيانة جديدة
2. تتبع حالة الطلبات
3. إدارة الفنيين والمقاولين
4. جدولة المواعيد
5. إصدار الفواتير
6. إنشاء التقارير

## حالات الطلبات:
- قيد الانتظار: طلب جديد لم يتم تعيين فني له
- قيد التنفيذ: تم تعيين فني وبدء العمل
- مكتمل: تم إنهاء العمل
- ملغي: تم إلغاء الطلب

## إرشادات الرد:
- اجب باللغة العربية دائماً
- كن مفيداً ومساعداً
- قدم إجابات واضحة ومفصلة
- إذا لم تعرف الإجابة، اطلب المزيد من التفاصيل
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { message } = body;

    // Enhanced input validation
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'الرسالة مطلوبة ويجب أن تكون نص صحيح' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Limit message length to prevent abuse
    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'الرسالة طويلة جداً. الحد الأقصى 2000 حرف' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize message
    const sanitizedMessage = message.slice(0, 2000).trim();

    console.log('User message received:', sanitizedMessage.substring(0, 50));

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'خدمة الذكاء الاصطناعي غير مهيأة حالياً' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: KNOWLEDGE_BASE
          },
          {
            role: 'user',
            content: sanitizedMessage
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً' }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'خدمة الذكاء الاصطناعي غير متاحة حالياً' }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received successfully');

    const botResponse = data.choices?.[0]?.message?.content || 'عذراً، لم أتمكن من فهم طلبك. يرجى المحاولة مرة أخرى.';

    return new Response(
      JSON.stringify({ response: botResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chatbot function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'حدث خطأ في المساعد الذكي. يرجى المحاولة لاحقاً'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
