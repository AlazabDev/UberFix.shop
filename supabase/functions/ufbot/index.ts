import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Tool definition for creating maintenance requests
const tools = [
  {
    type: "function",
    function: {
      name: "create_maintenance_request",
      description: "إنشاء طلب صيانة جديد بعد جمع كل البيانات المطلوبة من العميل. استخدم هذه الأداة فقط عندما يكون لديك على الأقل: اسم العميل، رقم الهاتف، العنوان، ووصف المشكلة.",
      parameters: {
        type: "object",
        properties: {
          client_name: { type: "string", description: "اسم العميل الكامل" },
          client_phone: { type: "string", description: "رقم هاتف العميل" },
          client_email: { type: "string", description: "بريد العميل الإلكتروني (اختياري)" },
          location: { type: "string", description: "عنوان الموقع الكامل" },
          service_type: {
            type: "string",
            description: "نوع الخدمة المطلوبة",
            enum: ["plumbing", "electrical", "ac", "painting", "carpentry", "cleaning", "general", "appliance", "pest_control", "landscaping"]
          },
          title: { type: "string", description: "عنوان مختصر للطلب (مثال: إصلاح تسريب مياه)" },
          description: { type: "string", description: "وصف تفصيلي للمشكلة" },
          priority: {
            type: "string",
            description: "مستوى الأولوية",
            enum: ["low", "medium", "high"]
          }
        },
        required: ["client_name", "client_phone", "location", "title", "description"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_request_status",
      description: "التحقق من حالة طلب صيانة موجود باستخدام رقم الطلب أو اسم العميل",
      parameters: {
        type: "object",
        properties: {
          search_term: { type: "string", description: "رقم الطلب أو اسم العميل للبحث" }
        },
        required: ["search_term"],
        additionalProperties: false
      }
    }
  }
];

const SERVICE_TYPE_LABELS: Record<string, string> = {
  plumbing: "سباكة",
  electrical: "كهرباء",
  ac: "تكييف",
  painting: "دهانات",
  carpentry: "نجارة",
  cleaning: "تنظيف",
  general: "صيانة عامة",
  appliance: "أجهزة منزلية",
  pest_control: "مكافحة حشرات",
  landscaping: "حدائق وتنسيق"
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header if available
    let userId: string | null = null;
    let userRole: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
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

    // Fetch knowledge context
    const { data: knowledgeFiles } = await supabase
      .from('ufbot_knowledge_files')
      .select('title, text_content')
      .eq('is_active', true)
      .not('text_content', 'is', null)
      .limit(20);

    const { data: knowledgeEntries } = await supabase
      .from('ufbot_knowledge_entries')
      .select('category, question, answer')
      .eq('is_active', true)
      .order('sort_order')
      .limit(50);

    // Fetch live data for authenticated users
    let liveDataContext = '';
    if (userId && userRole) {
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

      const { count: pendingCount } = await supabase.from('maintenance_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: inProgressCount } = await supabase.from('maintenance_requests').select('id', { count: 'exact', head: true }).eq('status', 'in_progress');
      const { count: completedCount } = await supabase.from('maintenance_requests').select('id', { count: 'exact', head: true }).eq('status', 'completed');

      liveDataContext += `\n## إحصائيات:\n- انتظار: ${pendingCount || 0} | تنفيذ: ${inProgressCount || 0} | مكتملة: ${completedCount || 0}\n`;
    }

    let knowledgeContext = '';
    if (knowledgeFiles?.length) {
      knowledgeContext += '\n## ملفات المعرفة:\n';
      knowledgeFiles.forEach(f => {
        knowledgeContext += `### ${f.title}:\n${(f.text_content || '').slice(0, 2000)}\n\n`;
      });
    }
    if (knowledgeEntries?.length) {
      knowledgeContext += '\n## الأسئلة والأجوبة:\n';
      knowledgeEntries.forEach(e => {
        knowledgeContext += e.question ? `س: ${e.question}\nج: ${e.answer}\n\n` : `[${e.category}]: ${e.answer}\n\n`;
      });
    }

    const servicesList = Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => `${k}: ${v}`).join(', ');

    const systemPrompt = `أنت UFBot - المساعد الذكي لمنصة UberFix لإدارة الصيانة.

## هويتك:
- اسمك UFBot مساعد ذكي متخصص في خدمات الصيانة والعقارات
- تجيب بالعربية دائماً بأسلوب مهني وودي ومختصر

## قدراتك الأساسية:
1. **إنشاء طلبات صيانة**: يمكنك جمع بيانات العميل عبر المحادثة وإنشاء طلب صيانة مباشرة
2. **الاستعلام عن الطلبات**: يمكنك البحث عن حالة طلبات الصيانة
3. **الإجابة عن الأسئلة**: باستخدام قاعدة المعرفة والبيانات الحية

## تعليمات إنشاء طلب صيانة (مهم جداً):
- عندما يطلب العميل خدمة صيانة أو يعبر عن مشكلة، ابدأ بجمع البيانات بشكل تدريجي ومحادثي
- البيانات المطلوبة بالترتيب:
  1. **نوع المشكلة/الخدمة** - اسأل عن نوع المشكلة إذا لم يذكرها
  2. **وصف المشكلة** - تفاصيل عن المشكلة
  3. **اسم العميل** - الاسم الكامل
  4. **رقم الهاتف** - للتواصل
  5. **العنوان** - الموقع الكامل
- لا تطلب كل البيانات دفعة واحدة، بل اسأل سؤالاً واحداً أو اثنين في كل رسالة
- كن مرناً: إذا أعطاك العميل بعض البيانات تلقائياً، لا تعد لسؤاله عنها
- بعد جمع كل البيانات المطلوبة، لخص الطلب واسأل العميل للتأكيد قبل الإرسال
- عند التأكيد، استخدم أداة create_maintenance_request لإنشاء الطلب
- أنواع الخدمات المتاحة: ${servicesList}

## تعليمات الرد:
- أجب بإيجاز ووضوح
- استخدم الإيموجي باعتدال لجعل المحادثة ودية
- إذا لم تعرف الإجابة، اقترح التواصل مع الدعم
- لا تختلق معلومات

## دور المستخدم: ${userRole || 'زائر'}
${knowledgeContext}
${liveDataContext}`;

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...chatMessages.slice(-15)
    ];

    // First call: may trigger tool use (non-streaming)
    const firstResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: aiMessages,
        tools,
        stream: false,
      }),
    });

    if (!firstResponse.ok) {
      if (firstResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (firstResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'خدمة الذكاء الاصطناعي غير متاحة حالياً' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const errorText = await firstResponse.text();
      console.error('AI API error:', firstResponse.status, errorText);
      throw new Error(`AI API error: ${firstResponse.status}`);
    }

    const firstResult = await firstResponse.json();
    const choice = firstResult.choices?.[0];

    // Check if the model wants to call a tool
    if (choice?.finish_reason === 'tool_calls' || choice?.message?.tool_calls?.length) {
      const toolCalls = choice.message.tool_calls;
      const toolResults: any[] = [];

      for (const tc of toolCalls) {
        const args = JSON.parse(tc.function.arguments);
        let toolResult = '';

        if (tc.function.name === 'create_maintenance_request') {
          try {
            // Get default company/branch
            const { data: company } = await supabase
              .from('companies').select('id').order('created_at').limit(1).maybeSingle();
            const { data: branch } = await supabase
              .from('branches').select('id').eq('company_id', company!.id).order('created_at').limit(1).maybeSingle();

            if (!company?.id || !branch?.id) {
              toolResult = JSON.stringify({ success: false, error: 'لم يتم العثور على بيانات الشركة' });
            } else {
              // Generate tracking number
              const trackingNumber = `UF-${Date.now().toString(36).toUpperCase()}`;

              const { data: newRequest, error: insertError } = await supabase
                .from('maintenance_requests')
                .insert({
                  company_id: company.id,
                  branch_id: branch.id,
                  title: args.title,
                  description: args.description,
                  client_name: args.client_name,
                  client_phone: args.client_phone,
                  client_email: args.client_email || null,
                  location: args.location,
                  service_type: args.service_type || 'general',
                  priority: args.priority || 'medium',
                  status: 'pending',
                  channel: 'chatbot',
                  created_by: userId || null,
                })
                .select('id, title, status, created_at')
                .single();

              if (insertError) {
                console.error('Insert error:', insertError);
                toolResult = JSON.stringify({ success: false, error: `فشل في إنشاء الطلب: ${insertError.message}` });
              } else {
                // Send WhatsApp notification to client
                if (args.client_phone) {
                  try {
                    const serviceLabel = SERVICE_TYPE_LABELS[args.service_type || 'general'] || 'صيانة عامة';
                    const whatsappMessage = `✅ تم استلام طلب الصيانة بنجاح!\n\n📋 رقم التتبع: ${trackingNumber}\n🔧 الخدمة: ${serviceLabel}\n📝 ${args.title}\n📍 ${args.location}\n\nسيتم التواصل معك قريباً لتحديد موعد الزيارة.\n\nشكراً لثقتك في UberFix 🏠`;

                    const whatsappRes = await fetch(
                      `${supabaseUrl}/functions/v1/send-whatsapp-meta`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${supabaseServiceKey}`,
                        },
                        body: JSON.stringify({
                          to: args.client_phone,
                          message: whatsappMessage,
                          requestId: newRequest.id,
                        }),
                      }
                    );
                    const whatsappResult = await whatsappRes.json();
                    if (whatsappResult.success) {
                      console.log('✅ WhatsApp notification sent for request:', newRequest.id);
                    } else {
                      console.error('⚠️ WhatsApp notification failed:', whatsappResult.error);
                    }
                  } catch (waErr) {
                    console.error('⚠️ WhatsApp notification error:', waErr);
                  }
                }

                toolResult = JSON.stringify({
                  success: true,
                  request_id: newRequest.id,
                  tracking_number: trackingNumber,
                  title: newRequest.title,
                  status: 'pending',
                  whatsapp_sent: !!args.client_phone,
                  message: `تم إنشاء طلب الصيانة بنجاح! رقم التتبع: ${trackingNumber}`
                });
              }
            }
          } catch (err) {
            console.error('Tool execution error:', err);
            toolResult = JSON.stringify({ success: false, error: 'حدث خطأ أثناء إنشاء الطلب' });
          }
        } else if (tc.function.name === 'check_request_status') {
          try {
            const { data: found } = await supabase
              .from('maintenance_requests')
              .select('id, title, status, priority, service_type, created_at, client_name')
              .or(`title.ilike.%${args.search_term}%,client_name.ilike.%${args.search_term}%`)
              .order('created_at', { ascending: false })
              .limit(5);

            if (found?.length) {
              toolResult = JSON.stringify({
                success: true,
                results: found.map(r => ({
                  title: r.title,
                  status: r.status,
                  priority: r.priority,
                  service: SERVICE_TYPE_LABELS[r.service_type] || r.service_type,
                  date: r.created_at
                }))
              });
            } else {
              toolResult = JSON.stringify({ success: true, results: [], message: 'لم يتم العثور على طلبات مطابقة' });
            }
          } catch (err) {
            toolResult = JSON.stringify({ success: false, error: 'خطأ في البحث' });
          }
        }

        toolResults.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: toolResult,
        });
      }

      // Second call: stream the final response after tool execution
      const secondMessages = [
        ...aiMessages,
        choice.message,
        ...toolResults
      ];

      const streamResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: secondMessages,
          stream: true,
        }),
      });

      if (!streamResponse.ok) {
        const errText = await streamResponse.text();
        console.error('Second AI call error:', streamResponse.status, errText);
        throw new Error('AI follow-up error');
      }

      return new Response(streamResponse.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

    // No tool call — stream the text response directly
    // Since we used non-streaming for tool detection, convert to SSE format
    const content = choice?.message?.content || 'عذراً، لم أتمكن من معالجة طلبك.';
    const ssePayload = `data: ${JSON.stringify({
      choices: [{ delta: { content }, finish_reason: 'stop' }]
    })}\n\ndata: [DONE]\n\n`;

    return new Response(ssePayload, {
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
