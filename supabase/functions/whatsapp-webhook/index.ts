import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * WhatsApp Webhook - UberFix (v2 - AI-Powered)
 * ==============================================
 * معالجة ذكية للرسائل الواردة باستخدام AI
 * 
 * الميزات:
 * 1. التحقق من webhook (GET)
 * 2. استقبال الرسائل ومعالجتها بالذكاء الاصطناعي
 * 3. إنشاء طلبات صيانة تلقائياً عبر المحادثة
 * 4. تحديث حالات التسليم
 * 5. التعرف على العميل وربطه بطلباته
 * 6. دعم الوسائط (صور/فيديو/صوت/مستندات)
 */

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const FACEBOOK_SECRET = Deno.env.get('FACEBOOK_APP_SECRET');
const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const SERVICE_TYPE_LABELS: Record<string, string> = {
  plumbing: "سباكة", electrical: "كهرباء", ac: "تكييف",
  painting: "دهانات", carpentry: "نجارة", cleaning: "تنظيف",
  general: "صيانة عامة", appliance: "أجهزة منزلية",
  pest_control: "مكافحة حشرات", landscaping: "حدائق"
};

// ==========================================
// التحقق من توقيع Meta
// ==========================================
async function verifyWebhookSignature(req: Request, rawBody: string): Promise<boolean> {
  if (!FACEBOOK_SECRET) return true;
  const signature = req.headers.get('x-hub-signature-256');
  if (!signature) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(FACEBOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = 'sha256=' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    if (signature.length !== expectedSignature.length) return false;
    let result = 0;
    for (let i = 0; i < signature.length; i++) result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    return result === 0;
  } catch { return false; }
}

// ==========================================
// إرسال رسالة WhatsApp
// ==========================================
async function sendWhatsAppMessage(
  to: string, message: string, 
  options?: { buttons?: Array<{id: string, title: string}>, requestId?: string }
): Promise<{ success: boolean; messageId?: string }> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) return { success: false };

  let formattedTo = to.replace(/\D/g, '');
  if (formattedTo.startsWith('0')) formattedTo = '2' + formattedTo;
  if (!formattedTo.startsWith('2')) formattedTo = '2' + formattedTo;

  let body: Record<string, unknown> = {
    messaging_product: 'whatsapp', to: formattedTo, type: 'text', text: { body: message }
  };

  if (options?.buttons?.length) {
    body = {
      messaging_product: 'whatsapp', to: formattedTo, type: 'interactive',
      interactive: {
        type: 'button', body: { text: message },
        action: {
          buttons: options.buttons.slice(0, 3).map(btn => ({
            type: 'reply', reply: { id: btn.id, title: btn.title.slice(0, 20) }
          }))
        }
      }
    };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) { console.error('❌ WhatsApp API error:', result); return { success: false }; }
    
    const messageId = result.messages?.[0]?.id;
    await supabase.from('message_logs').insert({
      recipient: formattedTo, message_content: message, message_type: 'whatsapp',
      provider: 'meta', status: 'sent', external_id: messageId,
      request_id: options?.requestId, sent_at: new Date().toISOString(),
      metadata: { type: 'outgoing', has_buttons: !!options?.buttons }
    });
    return { success: true, messageId };
  } catch (e) { console.error('❌ Send error:', e); return { success: false }; }
}

// ==========================================
// إدارة سياق المحادثة
// ==========================================
async function getConversation(phone: string) {
  const { data } = await supabase
    .from('wa_conversations')
    .select('*')
    .eq('phone_number', phone)
    .maybeSingle();
  return data;
}

async function upsertConversation(phone: string, updates: Record<string, unknown>) {
  const existing = await getConversation(phone);
  if (existing) {
    await supabase.from('wa_conversations')
      .update({ ...updates, last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('phone_number', phone);
  } else {
    await supabase.from('wa_conversations')
      .insert({ phone_number: phone, ...updates, last_message_at: new Date().toISOString() });
  }
}

// ==========================================
// البحث عن طلبات العميل
// ==========================================
async function findCustomerRequests(phone: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const variants = [cleanPhone, `+${cleanPhone}`, `+2${cleanPhone}`,
    cleanPhone.startsWith('2') ? cleanPhone.slice(1) : cleanPhone,
    cleanPhone.startsWith('20') ? '0' + cleanPhone.slice(2) : cleanPhone
  ];
  const { data } = await supabase
    .from('maintenance_requests')
    .select('id, title, status, workflow_stage, priority, service_type, created_at, assigned_technician_id')
    .or(variants.map(p => `client_phone.ilike.%${p}%`).join(','))
    .order('created_at', { ascending: false })
    .limit(5);
  return data || [];
}

// ==========================================
// AI Tools for WhatsApp
// ==========================================
const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_maintenance_request",
      description: "إنشاء طلب صيانة جديد بعد جمع كل البيانات من العميل عبر واتساب",
      parameters: {
        type: "object",
        properties: {
          client_name: { type: "string", description: "اسم العميل" },
          client_phone: { type: "string", description: "رقم هاتف العميل" },
          location: { type: "string", description: "عنوان الموقع" },
          service_type: { type: "string", enum: Object.keys(SERVICE_TYPE_LABELS) },
          title: { type: "string", description: "عنوان مختصر للمشكلة" },
          description: { type: "string", description: "وصف تفصيلي للمشكلة" },
          priority: { type: "string", enum: ["low", "medium", "high"] }
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
      description: "البحث عن حالة طلبات صيانة للعميل",
      parameters: {
        type: "object",
        properties: { phone: { type: "string" } },
        required: ["phone"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "rate_service",
      description: "تسجيل تقييم العميل للخدمة (1-5 نجوم)",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string" },
          rating: { type: "number", description: "التقييم من 1 إلى 5" },
          comment: { type: "string", description: "تعليق العميل (اختياري)" }
        },
        required: ["phone", "rating"],
        additionalProperties: false
      }
    }
  }
];

// ==========================================
// تنفيذ أدوات AI
// ==========================================
async function executeTool(name: string, args: Record<string, unknown>, senderPhone: string): Promise<string> {
  if (name === 'create_maintenance_request') {
    try {
      const { data: company } = await supabase.from('companies').select('id').order('created_at').limit(1).maybeSingle();
      const { data: branch } = await supabase.from('branches').select('id').eq('company_id', company!.id).order('created_at').limit(1).maybeSingle();
      
      if (!company?.id || !branch?.id) return JSON.stringify({ success: false, error: 'لم يتم العثور على بيانات الشركة' });

      const trackingNumber = `UF-${Date.now().toString(36).toUpperCase()}`;
      const { data: newReq, error } = await supabase
        .from('maintenance_requests')
        .insert({
          company_id: company.id, branch_id: branch.id,
          title: args.title as string, description: args.description as string,
          client_name: args.client_name as string, client_phone: args.client_phone as string || senderPhone,
          location: args.location as string, service_type: args.service_type as string || 'general',
          priority: args.priority as string || 'medium', status: 'Open', workflow_stage: 'submitted',
          channel: 'whatsapp',
        })
        .select('id, title').single();

      if (error) return JSON.stringify({ success: false, error: error.message });

      // Update conversation state
      await upsertConversation(senderPhone, {
        conversation_state: 'idle', current_request_id: newReq.id, collected_data: '{}'
      });

      // Send notification via the notification system
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-maintenance-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
          body: JSON.stringify({ request_id: newReq.id, event_type: 'request_created', new_stage: 'submitted', send_whatsapp: true, send_email: true })
        });
      } catch (e) { console.error('Notification error:', e); }

      return JSON.stringify({
        success: true, request_id: newReq.id, tracking_number: trackingNumber,
        title: newReq.title, message: `تم إنشاء الطلب بنجاح! رقم التتبع: ${trackingNumber}`
      });
    } catch (e) { return JSON.stringify({ success: false, error: 'خطأ في إنشاء الطلب' }); }
  }

  if (name === 'check_request_status') {
    const phone = (args.phone as string) || senderPhone;
    const requests = await findCustomerRequests(phone);
    if (!requests.length) return JSON.stringify({ success: true, results: [], message: 'لا توجد طلبات' });
    
    const statusMap: Record<string, string> = {
      'Open': 'مفتوح', 'In Progress': 'قيد التنفيذ', 'Completed': 'مكتمل',
      'Closed': 'مغلق', 'Cancelled': 'ملغي'
    };
    return JSON.stringify({
      success: true,
      results: requests.map(r => ({
        id: r.id.slice(0, 8), title: r.title,
        status: statusMap[r.status] || r.status,
        stage: r.workflow_stage, priority: r.priority,
        service: SERVICE_TYPE_LABELS[r.service_type || ''] || r.service_type,
        date: r.created_at
      }))
    });
  }

  if (name === 'rate_service') {
    const phone = (args.phone as string) || senderPhone;
    const rating = args.rating as number;
    if (rating < 1 || rating > 5) return JSON.stringify({ success: false, error: 'التقييم يجب أن يكون بين 1 و 5' });
    
    const requests = await findCustomerRequests(phone);
    const completed = requests.find(r => r.status === 'Completed');
    if (completed) {
      await supabase.from('maintenance_requests').update({ rating }).eq('id', completed.id);
      return JSON.stringify({ success: true, message: `تم تسجيل التقييم ${rating}/5 بنجاح` });
    }
    return JSON.stringify({ success: false, error: 'لا يوجد طلب مكتمل لتقييمه' });
  }

  return JSON.stringify({ success: false, error: 'أداة غير معروفة' });
}

// ==========================================
// معالجة الرسالة بالذكاء الاصطناعي
// ==========================================
async function processWithAI(
  from: string, senderName: string, content: string, messageType: string, mediaId?: string
): Promise<string> {
  if (!LOVABLE_API_KEY) {
    // Fallback to basic responses
    return `مرحباً ${senderName}! 👋\n\nشكراً لتواصلك مع UberFix.\n\nللأسف خدمة المحادثة الذكية غير متاحة حالياً.\n\nيمكنك تقديم طلب صيانة عبر:\nhttps://uberfix.shop/quick-request`;
  }

  // Get conversation context
  const conversation = await getConversation(from);
  const history = (conversation?.messages_history as Array<{role: string, content: string}>) || [];

  // Get customer's existing requests for context
  const existingRequests = await findCustomerRequests(from);
  let requestsContext = '';
  if (existingRequests.length > 0) {
    const statusMap: Record<string, string> = { 'Open': 'مفتوح', 'In Progress': 'قيد التنفيذ', 'Completed': 'مكتمل', 'Closed': 'مغلق' };
    requestsContext = `\n## طلبات العميل الحالية:\n` + existingRequests.map(r => 
      `- ${r.title} | الحالة: ${statusMap[r.status] || r.status} | الأولوية: ${r.priority || 'عادية'}`
    ).join('\n');
  }

  // Media context
  let mediaContext = '';
  if (messageType === 'image') mediaContext = '\n[العميل أرسل صورة للمشكلة]';
  else if (messageType === 'video') mediaContext = '\n[العميل أرسل فيديو للمشكلة]';
  else if (messageType === 'audio') mediaContext = '\n[العميل أرسل رسالة صوتية]';
  else if (messageType === 'document') mediaContext = '\n[العميل أرسل مستند]';
  else if (messageType === 'location') mediaContext = '\n[العميل أرسل موقعه الجغرافي]';

  const servicesList = Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => `${k}: ${v}`).join(', ');

  const systemPrompt = `أنت مساعد UberFix عبر واتساب - متخصص في خدمات الصيانة.

## تعليماتك:
- أنت تتحدث مع العميل عبر واتساب مباشرة
- أجب بالعربية بأسلوب مهني وودود ومختصر
- رقم هاتف العميل الحالي: ${from}
- اسم العميل: ${senderName}
${requestsContext}
${mediaContext}

## إنشاء طلبات الصيانة:
عندما يطلب العميل خدمة صيانة أو يصف مشكلة:
1. اسأل عن نوع المشكلة إذا لم يوضحها
2. اسأل عن وصف تفصيلي للمشكلة
3. تأكد من اسم العميل (يمكنك استخدام "${senderName}" كاسم افتراضي)
4. رقم الهاتف متوفر تلقائياً: ${from}
5. اسأل عن العنوان/الموقع
6. بعد جمع كل البيانات اسأل عن التأكيد ثم أنشئ الطلب

لا تطلب كل البيانات دفعة واحدة - سؤال أو اثنين في كل رسالة.
أنواع الخدمات: ${servicesList}

## متابعة الطلبات:
إذا سأل العميل عن حالة طلبه، استخدم أداة check_request_status

## التقييم:
إذا أراد العميل تقييم الخدمة، استخدم أداة rate_service

## ملاحظات:
- إذا أرسل العميل صورة أو فيديو، اعتبرها توضيحاً للمشكلة واستمر بجمع باقي البيانات
- كن مختصراً - هذا واتساب وليس بريد إلكتروني
- استخدم الإيموجي باعتدال`;

  // Build messages from history + current
  const aiMessages: Array<{role: string, content: string}> = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-12), // آخر 12 رسالة
    { role: 'user', content: content }
  ];

  try {
    // First call - check for tool use
    const firstRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: aiMessages, tools: AI_TOOLS, stream: false,
      }),
    });

    if (!firstRes.ok) {
      console.error('AI API error:', firstRes.status);
      return `شكراً لتواصلك مع UberFix! 🔧\n\nنعتذر عن التأخير، يمكنك تقديم طلب صيانة عبر:\nhttps://uberfix.shop/quick-request`;
    }

    const firstResult = await firstRes.json();
    const choice = firstResult.choices?.[0];

    let aiResponse = '';

    // Handle tool calls
    if (choice?.finish_reason === 'tool_calls' || choice?.message?.tool_calls?.length) {
      const toolCalls = choice.message.tool_calls;
      const toolResults: any[] = [];

      for (const tc of toolCalls) {
        const args = JSON.parse(tc.function.arguments);
        // Inject sender phone if missing
        if (!args.client_phone) args.client_phone = from;
        if (!args.phone) args.phone = from;
        
        const result = await executeTool(tc.function.name, args, from);
        toolResults.push({ role: 'tool', tool_call_id: tc.id, content: result });
      }

      // Second call for natural response
      const secondRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [...aiMessages, choice.message, ...toolResults],
          stream: false,
        }),
      });

      if (secondRes.ok) {
        const secondResult = await secondRes.json();
        aiResponse = secondResult.choices?.[0]?.message?.content || 'تم تنفيذ طلبك بنجاح!';
      } else {
        aiResponse = 'تم تنفيذ طلبك. سنتواصل معك قريباً!';
      }
    } else {
      aiResponse = choice?.message?.content || 'شكراً لتواصلك! كيف يمكنني مساعدتك؟';
    }

    // Update conversation history
    const updatedHistory = [
      ...history.slice(-12),
      { role: 'user', content },
      { role: 'assistant', content: aiResponse }
    ];

    await upsertConversation(from, {
      sender_name: senderName,
      messages_history: updatedHistory,
      conversation_state: 'active'
    });

    return aiResponse;

  } catch (error) {
    console.error('AI processing error:', error);
    return `مرحباً ${senderName}! شكراً لتواصلك مع UberFix 🔧\n\nيمكنك تقديم طلب صيانة عبر:\nhttps://uberfix.shop/quick-request`;
  }
}

// ==========================================
// Main Handler
// ==========================================
serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // GET: Webhook Verification
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (!VERIFY_TOKEN) {
      if (mode === 'subscribe' && challenge) {
        return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain', ...corsHeaders } });
      }
    }
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified!');
      return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain', ...corsHeaders } });
    }
    return new Response(JSON.stringify({ error: 'Verification failed' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }

  // POST: Receive Messages & Status Updates
  if (req.method === 'POST') {
    try {
      const rawBody = await req.text();
      const isValid = await verifyWebhookSignature(req, rawBody);
      if (!isValid) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

      const body = JSON.parse(rawBody);
      if (body.object !== 'whatsapp_business_account') {
        return new Response('Not WhatsApp', { status: 400, headers: corsHeaders });
      }

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field !== 'messages') continue;
          const value = change.value;

          // ========== Process Messages ==========
          for (const message of value.messages || []) {
            const from = message.from;
            const messageId = message.id;
            const messageType = message.type;
            const timestamp = message.timestamp;
            const contact = (value.contacts || []).find((c: {wa_id: string}) => c.wa_id === from);
            const senderName = contact?.profile?.name || 'عميل';

            console.log(`📩 Message from ${senderName} (${from}): type=${messageType}`);

            // Extract content
            let content = '';
            let mediaId = null;
            switch (messageType) {
              case 'text': content = message.text?.body || ''; break;
              case 'image': content = message.image?.caption || 'أرسلت صورة للمشكلة'; mediaId = message.image?.id; break;
              case 'document': content = message.document?.caption || 'أرسلت مستند'; mediaId = message.document?.id; break;
              case 'audio': content = 'أرسلت رسالة صوتية'; mediaId = message.audio?.id; break;
              case 'video': content = message.video?.caption || 'أرسلت فيديو للمشكلة'; mediaId = message.video?.id; break;
              case 'location': content = `موقعي: ${message.location?.latitude}, ${message.location?.longitude}`; break;
              case 'interactive':
                if (message.interactive?.type === 'button_reply') content = message.interactive.button_reply?.title || message.interactive.button_reply?.id || '';
                else if (message.interactive?.type === 'list_reply') content = message.interactive.list_reply?.title || message.interactive.list_reply?.id || '';
                break;
              default: content = `[${messageType}]`;
            }

            // Save incoming message
            await supabase.from('message_logs').insert({
              external_id: messageId, recipient: from,
              message_content: content, message_type: 'whatsapp', provider: 'meta',
              status: 'received',
              metadata: { sender_name: senderName, message_type: messageType, media_id: mediaId, timestamp, type: 'incoming' }
            });

            // Process with AI and respond
            const aiResponse = await processWithAI(from, senderName, content, messageType, mediaId);
            
            // Get the active request ID for linking
            const conv = await getConversation(from);
            await sendWhatsAppMessage(from, aiResponse, { requestId: conv?.current_request_id });
          }

          // ========== Process Status Updates ==========
          for (const status of value.statuses || []) {
            const statusType = status.status;
            const msgId = status.id;
            const ts = status.timestamp;

            const { data: existing } = await supabase.from('message_logs').select('metadata').eq('external_id', msgId).single();
            const currentMeta = (existing?.metadata as Record<string, unknown>) || {};

            const updateData: Record<string, unknown> = {
              status: statusType,
              metadata: { ...currentMeta, [`${statusType}_at`]: ts, last_status: statusType }
            };
            if (statusType === 'delivered') updateData.delivered_at = new Date(parseInt(ts) * 1000).toISOString();

            await supabase.from('message_logs').update(updateData).eq('external_id', msgId);
          }
        }
      }

      return new Response('EVENT_RECEIVED', { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error('❌ Webhook error:', error);
      return new Response('EVENT_RECEIVED', { status: 200, headers: corsHeaders });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});
