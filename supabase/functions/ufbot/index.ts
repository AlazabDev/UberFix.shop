import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { messages: chatMessages, session_id } = await req.json();
    const lastMessage = chatMessages?.[chatMessages.length - 1]?.content;

    if (!lastMessage || typeof lastMessage !== 'string' || lastMessage.length > 3000) {
      return new Response(
        JSON.stringify({ error: 'الرسالة مطلوبة (حد أقصى 3000 حرف)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'خدمة الذكاء الاصطناعي غير مهيأة' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for data access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header if available
    let userId: string | null = null;
    let userRole: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      // Skip if it's the anon key itself
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      if (token !== anonKey) {
        const anonClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: authHeader } }
        });
        const { data: { user } } = await anonClient.auth.getUser();
        if (user) {
          userId = user.id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
          userRole = profile?.role || 'customer';
        }
      }
    }

    // 1. Fetch knowledge base files
    const { data: knowledgeFiles } = await supabase
      .from('ufbot_knowledge_files')
      .select('title, text_content')
      .eq('is_active', true)
      .not('text_content', 'is', null)
      .limit(20);

    // 2. Fetch knowledge entries
    const { data: knowledgeEntries } = await supabase
      .from('ufbot_knowledge_entries')
      .select('category, question, answer')
      .eq('is_active', true)
      .order('sort_order')
      .limit(50);

    // 3. Fetch live data context based on user role
    let liveDataContext = '';
    if (userId && userRole) {
      // Maintenance requests summary
      const { data: requests, count: reqCount } = await supabase
        .from('maintenance_requests')
        .select('id, title, status, priority, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10);

      if (requests?.length) {
        liveDataContext += `\n## بيانات طلبات الصيانة الحية (آخر 10):\n`;
        liveDataContext += `إجمالي الطلبات: ${reqCount}\n`;
        requests.forEach(r => {
          liveDataContext += `- ${r.title} | الحالة: ${r.status} | الأولوية: ${r.priority || 'عادي'}\n`;
        });
      }

      // Stats
      const { count: pendingCount } = await supabase
        .from('maintenance_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: inProgressCount } = await supabase
        .from('maintenance_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'in_progress');

      const { count: completedCount } = await supabase
        .from('maintenance_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed');

      liveDataContext += `\n## إحصائيات سريعة:\n`;
      liveDataContext += `- طلبات قيد الانتظار: ${pendingCount || 0}\n`;
      liveDataContext += `- طلبات قيد التنفيذ: ${inProgressCount || 0}\n`;
      liveDataContext += `- طلبات مكتملة: ${completedCount || 0}\n`;

      // Technicians count
      const { count: techCount } = await supabase
        .from('technicians')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      liveDataContext += `- فنيين نشطين: ${techCount || 0}\n`;
    }

    // Build knowledge context
    let knowledgeContext = '';
    if (knowledgeFiles?.length) {
      knowledgeContext += '\n## ملفات المعرفة:\n';
      knowledgeFiles.forEach(f => {
        const content = (f.text_content || '').slice(0, 2000);
        knowledgeContext += `### ${f.title}:\n${content}\n\n`;
      });
    }

    if (knowledgeEntries?.length) {
      knowledgeContext += '\n## الأسئلة والأجوبة:\n';
      knowledgeEntries.forEach(e => {
        if (e.question) {
          knowledgeContext += `س: ${e.question}\nج: ${e.answer}\n\n`;
        } else {
          knowledgeContext += `[${e.category}]: ${e.answer}\n\n`;
        }
      });
    }

    const systemPrompt = `أنت UFBot - المساعد الذكي لمنصة UberFix لإدارة الصيانة.

## هويتك:
- اسمك UFBot وأنت مساعد ذكي متخصص في خدمات الصيانة والعقارات
- تجيب بالعربية دائماً بأسلوب مهني وودي
- تساعد المستخدمين في فهم النظام وتقديم معلومات دقيقة

## تعليمات الرد:
- أجب بإيجاز ووضوح
- استخدم المعلومات من قاعدة المعرفة أدناه عند الإمكان
- إذا كان السؤال عن بيانات حية (طلبات/فواتير)، استخدم البيانات المرفقة
- إذا لم تعرف الإجابة، قل ذلك بصراحة واقترح التواصل مع الدعم
- لا تختلق معلومات غير موجودة في السياق

## دور المستخدم الحالي: ${userRole || 'زائر'}
${knowledgeContext}
${liveDataContext}`;

    // Build messages array with history
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...chatMessages.slice(-10) // last 10 messages for context
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'خدمة الذكاء الاصطناعي غير متاحة حالياً' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    // Stream response back
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('UFBot error:', error);
    return new Response(
      JSON.stringify({ error: 'حدث خطأ في المساعد الذكي. يرجى المحاولة لاحقاً' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
