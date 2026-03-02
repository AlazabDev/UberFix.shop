import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * WhatsApp Flow Data Exchange Endpoint
 * =====================================
 * يستقبل بيانات من WhatsApp Flow ويحولها لطلب صيانة في Supabase
 * 
 * Meta يرسل البيانات مشفرة بـ RSA + AES
 * نقوم بفك التشفير → إنشاء طلب صيانة → إرسال إشعار تأكيد
 */

// استيراد Web Crypto API
const { subtle } = globalThis.crypto;

// تحويل Base64 إلى ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// تحويل ArrayBuffer إلى Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

// استيراد المفتاح الخاص RSA من PEM
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
    .replace(/-----END RSA PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');

  const keyData = base64ToArrayBuffer(pemContents);

  return await subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['decrypt']
  );
}

// فك تشفير بيانات WhatsApp Flow
async function decryptRequest(
  body: string,
  privatePem: string
): Promise<{ decryptedBody: Record<string, unknown>; aesKeyBuffer: ArrayBuffer; initialVectorBuffer: ArrayBuffer }> {
  const { encrypted_aes_key, encrypted_flow_data, initial_vector } = JSON.parse(body);

  const privateKey = await importPrivateKey(privatePem);

  // فك تشفير مفتاح AES باستخدام RSA
  const aesKeyBuffer = await subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    base64ToArrayBuffer(encrypted_aes_key)
  );

  // فك تشفير البيانات باستخدام AES-GCM
  const aesKey = await subtle.importKey(
    'raw',
    aesKeyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const initialVectorBuffer = base64ToArrayBuffer(initial_vector);

  const decryptedData = await subtle.decrypt(
    { name: 'AES-GCM', iv: initialVectorBuffer },
    aesKey,
    base64ToArrayBuffer(encrypted_flow_data)
  );

  const decryptedBody = JSON.parse(new TextDecoder().decode(decryptedData));

  return { decryptedBody, aesKeyBuffer, initialVectorBuffer };
}

// تشفير الاستجابة
async function encryptResponse(
  response: Record<string, unknown>,
  aesKeyBuffer: ArrayBuffer,
  initialVectorBuffer: ArrayBuffer
): Promise<string> {
  // عكس IV لتشفير الاستجابة
  const ivBytes = new Uint8Array(initialVectorBuffer);
  const flippedIv = new Uint8Array(ivBytes.length);
  for (let i = 0; i < ivBytes.length; i++) {
    flippedIv[i] = ~ivBytes[i] & 0xff;
  }

  const aesKey = await subtle.importKey(
    'raw',
    aesKeyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encrypted = await subtle.encrypt(
    { name: 'AES-GCM', iv: flippedIv },
    aesKey,
    new TextEncoder().encode(JSON.stringify(response))
  );

  return arrayBufferToBase64(encrypted);
}

// تحويل الأولوية إلى النظام الداخلي
function mapPriority(priority: string): string {
  switch (priority) {
    case 'urgent': return 'high';
    case 'medium': return 'medium';
    case 'normal': return 'low';
    default: return 'medium';
  }
}

// تنسيق رقم الهاتف المصري
function formatEgyptianPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '20' + cleaned.substring(1);
  if (!cleaned.startsWith('20') && cleaned.length === 10) cleaned = '20' + cleaned;
  return '+' + cleaned;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ==========================================
  // GET → Meta Webhook Verification (Handshake)
  // ==========================================
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ WhatsApp Flow webhook verified');
      return new Response(challenge || '', { status: 200 });
    }

    return new Response('Forbidden', { status: 403 });
  }

  // ==========================================
  // POST → Data Exchange من WhatsApp Flow
  // ==========================================
  try {
    const privatePem = Deno.env.get('WHATSAPP_FLOW_PRIVATE_KEY');
    if (!privatePem) {
      console.error('❌ WHATSAPP_FLOW_PRIVATE_KEY not configured');
      return new Response('Server error', { status: 500 });
    }

    const rawBody = await req.text();
    console.log('📥 WhatsApp Flow request received');

    // فك التشفير
    const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = await decryptRequest(rawBody, privatePem);

    console.log('🔓 Decrypted body:', JSON.stringify(decryptedBody));

    const { action, screen, data, version, flow_token } = decryptedBody as {
      action: string;
      screen: string;
      data: Record<string, unknown>;
      version: string;
      flow_token: string;
    };

    // ==========================================
    // Health Check (ping)
    // ==========================================
    if (action === 'ping') {
      const response = { version, data: { status: 'active' } };
      const encrypted = await encryptResponse(response, aesKeyBuffer, initialVectorBuffer);
      return new Response(encrypted, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // ==========================================
    // INIT → إرسال البيانات الأولية للشاشة
    // ==========================================
    if (action === 'INIT') {
      const response = {
        version,
        screen: 'REQUEST_FORM',
        data: {},
      };
      const encrypted = await encryptResponse(response, aesKeyBuffer, initialVectorBuffer);
      return new Response(encrypted, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // ==========================================
    // data_exchange → استلام بيانات النموذج وإنشاء طلب
    // ==========================================
    if (action === 'data_exchange') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // استخراج بيانات النموذج
      const {
        requester_name,
        maintenance_type,
        branch_name,
        priority,
        description,
      } = data as {
        requester_name: string;
        maintenance_type: string;
        branch_name: string;
        priority: string;
        description: string;
      };

      console.log('📋 Flow data:', { requester_name, maintenance_type, branch_name, priority });

      // استخراج رقم هاتف المرسل من flow_token أو metadata
      const senderPhone = (decryptedBody as Record<string, unknown>).wa_phone as string || '';

      // جلب company_id و branch_id الافتراضيين
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      const { data: branch } = await supabase
        .from('branches')
        .select('id')
        .eq('company_id', company?.id || '')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!company?.id || !branch?.id) {
        console.error('❌ No company/branch found');
        const errorResp = {
          version,
          screen: 'REQUEST_FORM',
          data: { error_message: 'خطأ في النظام. يرجى المحاولة لاحقاً.' },
        };
        const encrypted = await encryptResponse(errorResp, aesKeyBuffer, initialVectorBuffer);
        return new Response(encrypted, { headers: { 'Content-Type': 'text/plain' } });
      }

      // إنشاء طلب الصيانة
      const requestNumber = `WA-${Date.now().toString(36).toUpperCase()}`;
      
      const { data: newRequest, error: insertError } = await supabase
        .from('maintenance_requests')
        .insert({
          title: `${maintenance_type} - ${branch_name}`,
          description: description,
          client_name: requester_name,
          client_phone: senderPhone || null,
          service_type: maintenance_type,
          location: branch_name,
          priority: mapPriority(priority),
          status: 'Open',
          workflow_stage: 'submitted',
          channel: 'whatsapp_flow',
          company_id: company.id,
          branch_id: branch.id,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        const errorResp = {
          version,
          screen: 'REQUEST_FORM',
          data: { error_message: 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.' },
        };
        const encrypted = await encryptResponse(errorResp, aesKeyBuffer, initialVectorBuffer);
        return new Response(encrypted, { headers: { 'Content-Type': 'text/plain' } });
      }

      const requestId = newRequest.id;
      const shortId = requestId.slice(0, 8).toUpperCase();
      console.log('✅ Maintenance request created:', requestId);

      // إرسال إشعار تأكيد عبر WhatsApp للمرسل
      if (senderPhone) {
        try {
          const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
          const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

          if (accessToken && phoneNumberId) {
            const formattedPhone = formatEgyptianPhone(senderPhone).replace('+', '');

            await fetch(
              `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: formattedPhone,
                  type: 'text',
                  text: {
                    body: `✅ تم استلام طلب الصيانة بنجاح!\n\n📋 رقم الطلب: ${shortId}\n✍️ مقدم الطلب: ${requester_name}\n🔧 النوع: ${maintenance_type}\n🏢 الفرع: ${branch_name}\n📋 الأولوية: ${priority === 'urgent' ? '🔴 عاجل' : priority === 'medium' ? '🟡 متوسط' : '🟢 عادي'}\n\nسيتم التواصل معك قريباً لمعاينة الطلب. 🛠️ UberFix`,
                  },
                }),
              }
            );
            console.log('📤 Confirmation sent to:', formattedPhone);
          }
        } catch (notifErr) {
          console.error('⚠️ Failed to send confirmation:', notifErr);
        }
      }

      // إرسال إشعار للإدارة
      try {
        await supabase.functions.invoke('send-maintenance-notification', {
          body: {
            request_id: requestId,
            event_type: 'request_created',
          },
        });
      } catch (adminNotifErr) {
        console.error('⚠️ Failed to notify admin:', adminNotifErr);
      }

      // سجل الرسالة
      await supabase.from('message_logs').insert({
        request_id: requestId,
        recipient: senderPhone || 'whatsapp_flow_user',
        message_type: 'whatsapp',
        message_content: `طلب صيانة جديد من WhatsApp Flow: ${maintenance_type} - ${branch_name}`,
        provider: 'meta',
        status: 'sent',
        metadata: {
          source: 'whatsapp_flow',
          flow_id: '1403208574894392',
          requester_name,
          maintenance_type,
          branch_name,
          priority,
        },
      });

      // الاستجابة → شاشة النجاح
      const successResp = {
        version,
        screen: 'SUCCESS',
        data: {
          extension_message_response: {
            params: {
              flow_token,
              request_number: shortId,
              requester_name: requester_name,
            },
          },
        },
      };

      const encrypted = await encryptResponse(successResp, aesKeyBuffer, initialVectorBuffer);
      return new Response(encrypted, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // ==========================================
    // إجراء غير معروف
    // ==========================================
    console.warn('⚠️ Unknown action:', action);
    const fallback = { version, screen: 'REQUEST_FORM', data: {} };
    const encrypted = await encryptResponse(fallback, aesKeyBuffer, initialVectorBuffer);
    return new Response(encrypted, { headers: { 'Content-Type': 'text/plain' } });

  } catch (error) {
    console.error('❌ WhatsApp Flow error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
