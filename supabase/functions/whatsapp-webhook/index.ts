import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const FACEBOOK_SECRET = Deno.env.get('FACEBOOK_APP_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// إنشاء Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ==========================================
// التحقق من توقيع Meta (X-Hub-Signature-256)
// ==========================================
async function verifyWebhookSignature(req: Request, rawBody: string): Promise<boolean> {
  if (!FACEBOOK_SECRET) {
    console.warn('FACEBOOK_SECRET not configured - signature verification disabled');
    return true; // السماح بالمرور إذا لم يتم تكوين السر (للاختبار)
  }

  const signature = req.headers.get('x-hub-signature-256');
  if (!signature) {
    console.error('Missing x-hub-signature-256 header');
    return false;
  }

  try {
    // إنشاء HMAC-SHA256 من الـ body باستخدام السر
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(FACEBOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(rawBody)
    );
    
    // تحويل إلى hex string
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = 'sha256=' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // مقارنة آمنة ضد timing attacks
    if (signature.length !== expectedSignature.length) {
      console.error('Signature length mismatch');
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    
    const isValid = result === 0;
    if (!isValid) {
      console.error('Invalid signature - request may be forged');
    }
    
    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  const url = new URL(req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ==========================================
  // GET: التحقق من الـ Webhook (Verification)
  // ==========================================
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log('Webhook verification request:', { mode, token, challenge });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully!');
      return new Response(challenge, { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      console.error('Webhook verification failed:', { mode, token });
      return new Response('Verification failed', { status: 403 });
    }
  }

  // ==========================================
  // POST: استقبال الرسائل والأحداث
  // ==========================================
  if (req.method === 'POST') {
    try {
      // قراءة الـ body كنص للتحقق من التوقيع
      const rawBody = await req.text();
      
      // التحقق من توقيع Meta
      const isValidSignature = await verifyWebhookSignature(req, rawBody);
      if (!isValidSignature) {
        console.error('Invalid webhook signature - rejecting request');
        return new Response('Invalid signature', { 
          status: 401,
          headers: corsHeaders 
        });
      }
      
      console.log('✅ Webhook signature verified successfully');
      
      // تحويل الـ body إلى JSON
      const body = JSON.parse(rawBody);
      console.log('Incoming webhook:', JSON.stringify(body, null, 2));

      // التحقق من أن هذا إشعار من WhatsApp
      if (body.object !== 'whatsapp_business_account') {
        return new Response('Not a WhatsApp event', { status: 400 });
      }

      // معالجة كل entry
      for (const entry of body.entry || []) {
        const changes = entry.changes || [];
        
        for (const change of changes) {
          if (change.field !== 'messages') continue;
          
          const value = change.value;
          const messages = value.messages || [];
          const statuses = value.statuses || [];
          const contacts = value.contacts || [];

          // ==========================================
          // معالجة الرسائل الواردة
          // ==========================================
          for (const message of messages) {
            const from = message.from; // رقم المرسل
            const messageId = message.id;
            const timestamp = message.timestamp;
            const type = message.type;
            
            // الحصول على اسم المرسل
            const contact = contacts.find((c: any) => c.wa_id === from);
            const senderName = contact?.profile?.name || 'Unknown';

            console.log(`New message from ${senderName} (${from}):`, message);

            // استخراج محتوى الرسالة حسب النوع
            let content = '';
            let mediaUrl = null;

            switch (type) {
              case 'text':
                content = message.text?.body || '';
                break;
              case 'image':
                content = message.image?.caption || '[صورة]';
                mediaUrl = message.image?.id;
                break;
              case 'document':
                content = message.document?.caption || '[مستند]';
                mediaUrl = message.document?.id;
                break;
              case 'audio':
                content = '[رسالة صوتية]';
                mediaUrl = message.audio?.id;
                break;
              case 'video':
                content = message.video?.caption || '[فيديو]';
                mediaUrl = message.video?.id;
                break;
              case 'location':
                content = `[موقع: ${message.location?.latitude}, ${message.location?.longitude}]`;
                break;
              case 'interactive':
                // ردود الأزرار والقوائم
                if (message.interactive?.type === 'button_reply') {
                  content = message.interactive.button_reply?.title || '';
                } else if (message.interactive?.type === 'list_reply') {
                  content = message.interactive.list_reply?.title || '';
                }
                break;
              default:
                content = `[${type}]`;
            }

            // حفظ الرسالة في قاعدة البيانات
            const { error: insertError } = await supabase
              .from('message_logs')
              .insert({
                external_id: messageId,
                recipient: from,
                message_content: content,
                message_type: 'whatsapp',
                provider: 'meta',
                status: 'received',
                metadata: {
                  sender_name: senderName,
                  message_type: type,
                  media_id: mediaUrl,
                  timestamp: timestamp,
                  raw: message
                }
              });

            if (insertError) {
              console.error('Error saving message:', insertError);
            }

            // إرسال رد تلقائي (اختياري)
            await sendAutoReply(from, senderName, content, type);
          }

          // ==========================================
          // معالجة حالات الرسائل
          // ==========================================
          for (const status of statuses) {
            const messageId = status.id;
            const statusType = status.status; // sent, delivered, read, failed
            const recipientId = status.recipient_id;
            const timestamp = status.timestamp;

            console.log(`Message ${messageId} status: ${statusType}`);

            // جلب السجل الحالي للحصول على metadata
            const { data: existingRecord } = await supabase
              .from('message_logs')
              .select('metadata')
              .eq('external_id', messageId)
              .single();
            
            // دمج metadata الجديدة مع القديمة
            const currentMetadata = (existingRecord?.metadata as Record<string, unknown>) || {};
            const newMetadata = { 
              ...currentMetadata, 
              [`${statusType}_at`]: timestamp,
              last_status: statusType 
            };

            // تحديث حالة الرسالة في قاعدة البيانات
            const { error: updateError } = await supabase
              .from('message_logs')
              .update({
                status: statusType,
                delivered_at: statusType === 'delivered' ? new Date().toISOString() : undefined,
                metadata: newMetadata
              })
              .eq('external_id', messageId);

            if (updateError) {
              console.error('Error updating message status:', updateError);
            }
          }
        }
      }

      // يجب دائماً إرجاع 200 لـ Meta
      return new Response('EVENT_RECEIVED', { 
        status: 200,
        headers: corsHeaders 
      });

    } catch (error) {
      console.error('Webhook error:', error);
      // حتى في حالة الخطأ، نرجع 200 لتجنب إعادة المحاولة
      return new Response('EVENT_RECEIVED', { 
        status: 200,
        headers: corsHeaders 
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});

// ==========================================
// دالة الرد التلقائي
// ==========================================
async function sendAutoReply(to: string, name: string, message: string, type: string) {
  if (!WHATSAPP_TOKEN) {
    console.log('No WhatsApp token configured, skipping auto-reply');
    return;
  }

  // تجاهل الرسائل غير النصية للرد التلقائي
  if (type !== 'text') return;

  const lowerMessage = message.toLowerCase();
  let replyText = '';

  // ردود تلقائية بسيطة
  if (lowerMessage.includes('مرحبا') || lowerMessage.includes('السلام')) {
    replyText = `أهلاً ${name}! 👋\n\nمرحباً بك في UberFix\nكيف يمكنني مساعدتك اليوم?`;
  } else if (lowerMessage.includes('صيانة') || lowerMessage.includes('طلب')) {
    replyText = `📋 لفتح طلب صيانة جديد، يرجى زيارة:\nhttps://uberfiix.lovable.app/quick-request\n\nأو أرسل لنا تفاصيل المشكلة وسنتواصل معك قريباً.`;
  } else if (lowerMessage.includes('سعر') || lowerMessage.includes('تكلفة')) {
    replyText = `💰 الأسعار تعتمد على نوع الخدمة المطلوبة.\n\nللحصول على عرض سعر، يرجى وصف المشكلة بالتفصيل.`;
  } else {
    // رسالة افتراضية
    replyText = `شكراً لتواصلك مع UberFix! 🔧\n\nتم استلام رسالتك وسيتم الرد عليك قريباً.\n\nلطلب صيانة عاجلة: اتصل على 01234567890`;
  }

  // إرسال الرد (يحتاج تكامل مع send-twilio-message أو Meta API مباشرة)
  try {
    // استخدام Meta API مباشرة
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    if (!phoneNumberId) return;

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: replyText }
        }),
      }
    );

    const result = await response.json();
    console.log('Auto-reply sent:', result);

    // حفظ الرد في قاعدة البيانات
    await supabase.from('message_logs').insert({
      recipient: to,
      message_content: replyText,
      message_type: 'whatsapp',
      provider: 'meta',
      status: 'sent',
      external_id: result.messages?.[0]?.id,
      metadata: { type: 'auto_reply' }
    });

  } catch (error) {
    console.error('Error sending auto-reply:', error);
  }
}
