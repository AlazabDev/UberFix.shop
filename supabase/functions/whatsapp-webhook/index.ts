import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * WhatsApp Webhook - UberFix
 * ==============================
 * نظام متكامل لاستقبال ومعالجة رسائل WhatsApp
 * 
 * الوظائف:
 * 1. التحقق من webhook (GET)
 * 2. استقبال الرسائل والردود (POST)
 * 3. تحديث حالات التسليم
 * 4. الرد التلقائي الذكي
 * 5. ربط الرسائل بطلبات الصيانة
 */

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const FACEBOOK_SECRET = Deno.env.get('FACEBOOK_APP_SECRET');
const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// إنشاء Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ==========================================
// قوالب الرسائل
// ==========================================
const MESSAGE_TEMPLATES = {
  welcome: (name: string) => 
    `مرحباً ${name}! 👋\n\nأهلاً بك في UberFix - خدمة الصيانة السريعة.\n\nكيف يمكننا مساعدتك اليوم?\n\n📋 أرسل "طلب" لفتح طلب صيانة جديد\n📍 أرسل "حالة" لمتابعة طلباتك\n📞 أرسل "تواصل" للتحدث مع فريق الدعم`,

  request_received: (requestId: string, title: string) =>
    `✅ *تم استلام طلبك بنجاح*\n\n📋 رقم الطلب: ${requestId.slice(0, 8)}\n📝 ${title}\n\n⏳ سيتم مراجعة طلبك وإبلاغك بالتحديثات.\n\nللمتابعة أرسل "حالة"`,

  status_pending: (title: string) =>
    `⏳ *طلب قيد الانتظار*\n\n📝 ${title}\n\nطلبك في قائمة الانتظار وسيتم معالجته قريباً.`,

  status_assigned: (title: string, techName?: string) =>
    `👷 *تم تعيين فني*\n\n📝 ${title}\n${techName ? `👤 الفني: ${techName}\n` : ''}\nسيتم التواصل معك لتحديد موعد الزيارة.`,

  status_scheduled: (title: string, date?: string, time?: string) =>
    `📅 *تم جدولة الموعد*\n\n📝 ${title}\n${date ? `📆 التاريخ: ${date}\n` : ''}${time ? `⏰ الوقت: ${time}\n` : ''}\nسيصلك إشعار قبل الموعد بساعة.`,

  status_in_progress: (title: string) =>
    `🔧 *جاري العمل*\n\n📝 ${title}\n\nالفني يعمل على حل المشكلة الآن.\nسيتم إعلامك عند الانتهاء.`,

  status_completed: (title: string) =>
    `✅ *تم إتمام الخدمة*\n\n📝 ${title}\n\n🎉 تم إتمام طلب الصيانة بنجاح!\n\n⭐ نرجو تقييم الخدمة من 1-5\nمثال: "تقييم 5"`,

  status_cancelled: (title: string) =>
    `❌ *تم إلغاء الطلب*\n\n📝 ${title}\n\nتم إلغاء طلب الصيانة.\nللمساعدة، أرسل "تواصل"`,

  appointment_reminder: (title: string, time: string) =>
    `⏰ *تذكير بموعد الصيانة*\n\n📝 ${title}\n⏰ الموعد: ${time}\n\nالفني في الطريق إليك!`,

  rate_thanks: (rating: number) =>
    `شكراً لتقييمك! ⭐ ${rating}/5\n\nنسعى دائماً لتقديم أفضل خدمة.\nشكراً لثقتك بـ UberFix!`,

  help: () =>
    `📚 *دليل المساعدة*\n\n📋 "طلب" - فتح طلب صيانة جديد\n📍 "حالة" - متابعة طلباتك\n⭐ "تقييم X" - تقييم الخدمة (1-5)\n📞 "تواصل" - التحدث مع الدعم\n❓ "مساعدة" - عرض هذا الدليل`,

  default: () =>
    `شكراً لتواصلك مع UberFix! 🔧\n\nللمساعدة، أرسل "مساعدة"\n\nأو قم بزيارة:\nhttps://uberfix.shop/quick-request`
};

// ==========================================
// التحقق من توقيع Meta
// ==========================================
async function verifyWebhookSignature(req: Request, rawBody: string): Promise<boolean> {
  if (!FACEBOOK_SECRET) {
    console.warn('⚠️ FACEBOOK_SECRET not configured - signature verification disabled');
    return true;
  }

  const signature = req.headers.get('x-hub-signature-256');
  if (!signature) {
    console.error('❌ Missing x-hub-signature-256 header');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(FACEBOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = 'sha256=' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // مقارنة آمنة
    if (signature.length !== expectedSignature.length) return false;
    
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    
    return result === 0;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// ==========================================
// إرسال رسالة WhatsApp
// ==========================================
async function sendWhatsAppMessage(
  to: string, 
  message: string, 
  options?: { 
    buttons?: Array<{id: string, title: string}>,
    requestId?: string 
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error('❌ WhatsApp credentials not configured');
    return { success: false, error: 'WhatsApp not configured' };
  }

  try {
    // تنسيق الرقم
    let formattedTo = to.replace(/\D/g, '');
    if (formattedTo.startsWith('0')) {
      formattedTo = '2' + formattedTo; // مصر
    }
    if (!formattedTo.startsWith('2')) {
      formattedTo = '2' + formattedTo;
    }

    let body: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      to: formattedTo,
      type: 'text',
      text: { body: message }
    };

    // إضافة أزرار تفاعلية إذا وجدت
    if (options?.buttons && options.buttons.length > 0) {
      body = {
        messaging_product: 'whatsapp',
        to: formattedTo,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: message },
          action: {
            buttons: options.buttons.slice(0, 3).map(btn => ({
              type: 'reply',
              reply: { id: btn.id, title: btn.title.slice(0, 20) }
            }))
          }
        }
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ WhatsApp API error:', result);
      return { success: false, error: result.error?.message || 'Failed to send message' };
    }

    const messageId = result.messages?.[0]?.id;
    console.log('✅ WhatsApp message sent:', messageId);

    // حفظ في قاعدة البيانات
    await supabase.from('message_logs').insert({
      recipient: formattedTo,
      message_content: message,
      message_type: 'whatsapp',
      provider: 'meta',
      status: 'sent',
      external_id: messageId,
      request_id: options?.requestId,
      sent_at: new Date().toISOString(),
      metadata: { 
        type: 'outgoing',
        has_buttons: !!options?.buttons
      }
    });

    return { success: true, messageId };
  } catch (error) {
    console.error('❌ Send message error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ==========================================
// البحث عن طلبات العميل
// ==========================================
async function findCustomerRequests(phone: string): Promise<Array<{id: string, title: string, status: string}>> {
  // تنظيف الرقم
  const cleanPhone = phone.replace(/\D/g, '');
  const phoneVariants = [
    cleanPhone,
    `+${cleanPhone}`,
    `+2${cleanPhone}`,
    cleanPhone.startsWith('2') ? cleanPhone.slice(1) : cleanPhone,
    cleanPhone.startsWith('20') ? '0' + cleanPhone.slice(2) : cleanPhone
  ];

  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('id, title, status, created_at')
    .or(phoneVariants.map(p => `client_phone.ilike.%${p}%`).join(','))
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error finding requests:', error);
    return [];
  }

  return data || [];
}

// ==========================================
// معالجة الرسالة الواردة
// ==========================================
async function processIncomingMessage(
  from: string,
  senderName: string,
  messageContent: string,
  messageType: string
): Promise<void> {
  const lowerContent = messageContent.toLowerCase().trim();

  // تحليل الرسالة وتحديد الإجراء
  if (messageType !== 'text') {
    await sendWhatsAppMessage(from, MESSAGE_TEMPLATES.default());
    return;
  }

  // أوامر خاصة
  if (lowerContent.includes('مرحبا') || lowerContent.includes('السلام') || lowerContent === 'hi' || lowerContent === 'hello') {
    await sendWhatsAppMessage(from, MESSAGE_TEMPLATES.welcome(senderName), {
      buttons: [
        { id: 'new_request', title: '📋 طلب جديد' },
        { id: 'my_status', title: '📍 حالة طلبي' },
        { id: 'contact', title: '📞 تواصل' }
      ]
    });
    return;
  }

  if (lowerContent === 'طلب' || lowerContent === 'new_request' || lowerContent.includes('صيانة جديدة')) {
    await sendWhatsAppMessage(from, 
      `📋 *طلب صيانة جديد*\n\nلفتح طلب صيانة، يرجى:\n\n1️⃣ زيارة الرابط:\nhttps://uberfix.shop/quick-request\n\nأو\n\n2️⃣ أرسل وصفاً للمشكلة وسنفتح لك طلباً.\n\nمثال: "مشكلة في الكهرباء بالمطبخ"`
    );
    return;
  }

  if (lowerContent === 'حالة' || lowerContent === 'my_status' || lowerContent.includes('حالة طلب')) {
    const requests = await findCustomerRequests(from);
    
    if (requests.length === 0) {
      await sendWhatsAppMessage(from, 
        `❌ لم نجد طلبات مرتبطة برقمك.\n\nللمساعدة، أرسل "تواصل"\nأو قم بفتح طلب جديد: "طلب"`
      );
      return;
    }

    const statusEmoji: Record<string, string> = {
      pending: '⏳',
      assigned: '👷',
      in_progress: '🔧',
      completed: '✅',
      cancelled: '❌'
    };

    let statusMessage = `📋 *طلباتك الأخيرة:*\n\n`;
    requests.forEach((req, idx) => {
      statusMessage += `${idx + 1}. ${statusEmoji[req.status] || '📝'} ${req.title}\n   الحالة: ${req.status}\n\n`;
    });

    await sendWhatsAppMessage(from, statusMessage);
    return;
  }

  if (lowerContent.includes('تقييم')) {
    const ratingMatch = lowerContent.match(/تقييم\s*(\d)/);
    if (ratingMatch) {
      const rating = parseInt(ratingMatch[1]);
      if (rating >= 1 && rating <= 5) {
        // حفظ التقييم
        const requests = await findCustomerRequests(from);
        if (requests.length > 0) {
          const latestCompleted = requests.find(r => r.status === 'completed');
          if (latestCompleted) {
            await supabase
              .from('maintenance_requests')
              .update({ rating })
              .eq('id', latestCompleted.id);
          }
        }
        await sendWhatsAppMessage(from, MESSAGE_TEMPLATES.rate_thanks(rating));
        return;
      }
    }
    await sendWhatsAppMessage(from, `⭐ للتقييم، أرسل "تقييم" متبوعاً برقم من 1 إلى 5\nمثال: تقييم 5`);
    return;
  }

  if (lowerContent === 'تواصل' || lowerContent === 'contact' || lowerContent.includes('دعم')) {
    await sendWhatsAppMessage(from, 
      `📞 *فريق الدعم*\n\n📱 اتصل: 01234567890\n📧 البريد: support@uberfix.shop\n\nساعات العمل:\n🕐 السبت - الخميس\n⏰ 9 صباحاً - 9 مساءً\n\nأو اترك رسالتك هنا وسنرد عليك قريباً.`
    );
    return;
  }

  if (lowerContent === 'مساعدة' || lowerContent === 'help' || lowerContent === '?') {
    await sendWhatsAppMessage(from, MESSAGE_TEMPLATES.help());
    return;
  }

  // رسالة افتراضية
  await sendWhatsAppMessage(from, MESSAGE_TEMPLATES.default());
}

// ==========================================
// Main Handler
// ==========================================
serve(async (req) => {
  const url = new URL(req.url);

  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ==========================================
  // GET: Webhook Verification
  // ==========================================
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log('🔐 Webhook verification request:', { 
      mode, 
      receivedToken: token,
      hasStoredToken: !!VERIFY_TOKEN,
      storedTokenLength: VERIFY_TOKEN?.length || 0,
      challenge: challenge?.substring(0, 20) + '...'
    });

    // للتطوير: إذا لم يكن الـ token محدداً، نقبل أي token
    if (!VERIFY_TOKEN) {
      console.warn('⚠️ WHATSAPP_VERIFY_TOKEN not set - accepting any token for development');
      if (mode === 'subscribe' && challenge) {
        console.log('✅ Webhook verified (dev mode)!');
        return new Response(challenge, { 
          status: 200,
          headers: { 'Content-Type': 'text/plain', ...corsHeaders }
        });
      }
    }

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully!');
      return new Response(challenge, { 
        status: 200,
        headers: { 'Content-Type': 'text/plain', ...corsHeaders }
      });
    }

    console.error('❌ Verification failed:', {
      modeMatch: mode === 'subscribe',
      tokenMatch: token === VERIFY_TOKEN,
      receivedTokenLength: token?.length || 0
    });
    return new Response(JSON.stringify({ 
      error: 'Verification failed',
      hint: 'Check WHATSAPP_VERIFY_TOKEN matches your Meta dashboard setting'
    }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  // ==========================================
  // POST: Receive Messages & Status Updates
  // ==========================================
  if (req.method === 'POST') {
    try {
      const rawBody = await req.text();
      
      // Verify signature
      const isValid = await verifyWebhookSignature(req, rawBody);
      if (!isValid) {
        console.error('❌ Invalid signature');
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      const body = JSON.parse(rawBody);
      console.log('📨 Webhook received:', JSON.stringify(body, null, 2));

      if (body.object !== 'whatsapp_business_account') {
        return new Response('Not WhatsApp', { status: 400, headers: corsHeaders });
      }

      // Process entries
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field !== 'messages') continue;

          const value = change.value;
          const messages = value.messages || [];
          const statuses = value.statuses || [];
          const contacts = value.contacts || [];

          // ========== Process Messages ==========
          for (const message of messages) {
            const from = message.from;
            const messageId = message.id;
            const messageType = message.type;
            const timestamp = message.timestamp;

            const contact = contacts.find((c: {wa_id: string}) => c.wa_id === from);
            const senderName = contact?.profile?.name || 'عميل';

            console.log(`📩 Message from ${senderName} (${from}):`, message);

            // Extract content
            let content = '';
            let mediaId = null;

            switch (messageType) {
              case 'text':
                content = message.text?.body || '';
                break;
              case 'image':
                content = message.image?.caption || '[صورة]';
                mediaId = message.image?.id;
                break;
              case 'document':
                content = message.document?.caption || '[مستند]';
                mediaId = message.document?.id;
                break;
              case 'audio':
                content = '[رسالة صوتية]';
                mediaId = message.audio?.id;
                break;
              case 'video':
                content = message.video?.caption || '[فيديو]';
                mediaId = message.video?.id;
                break;
              case 'location':
                content = `[موقع: ${message.location?.latitude}, ${message.location?.longitude}]`;
                break;
              case 'interactive':
                if (message.interactive?.type === 'button_reply') {
                  content = message.interactive.button_reply?.id || '';
                } else if (message.interactive?.type === 'list_reply') {
                  content = message.interactive.list_reply?.id || '';
                }
                break;
              default:
                content = `[${messageType}]`;
            }

            // Save to database
            await supabase.from('message_logs').insert({
              external_id: messageId,
              recipient: from,
              message_content: content,
              message_type: 'whatsapp',
              provider: 'meta',
              status: 'received',
              metadata: {
                sender_name: senderName,
                message_type: messageType,
                media_id: mediaId,
                timestamp,
                type: 'incoming'
              }
            });

            // Process and respond
            await processIncomingMessage(from, senderName, content, messageType);
          }

          // ========== Process Status Updates ==========
          for (const status of statuses) {
            const messageId = status.id;
            const statusType = status.status;
            const recipientId = status.recipient_id;
            const timestamp = status.timestamp;

            console.log(`📊 Status update: ${messageId} -> ${statusType}`);

            // Get existing record
            const { data: existing } = await supabase
              .from('message_logs')
              .select('metadata')
              .eq('external_id', messageId)
              .single();

            const currentMeta = (existing?.metadata as Record<string, unknown>) || {};

            // Update status
            const updateData: Record<string, unknown> = {
              status: statusType,
              metadata: {
                ...currentMeta,
                [`${statusType}_at`]: timestamp,
                last_status: statusType
              }
            };

            if (statusType === 'delivered') {
              updateData.delivered_at = new Date(parseInt(timestamp) * 1000).toISOString();
            }

            await supabase
              .from('message_logs')
              .update(updateData)
              .eq('external_id', messageId);
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

// ==========================================
// Export للاستخدام من وظائف أخرى
// ==========================================
export { sendWhatsAppMessage, MESSAGE_TEMPLATES };
