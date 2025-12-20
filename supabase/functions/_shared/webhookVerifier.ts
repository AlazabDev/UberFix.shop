/**
 * Webhook signature verification utilities
 * For Twilio, Meta (Facebook/WhatsApp), and other providers
 */

/**
 * Verify Twilio webhook signature
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
export async function verifyTwilioSignature(
  req: Request,
  authToken: string,
  url: string
): Promise<boolean> {
  const signature = req.headers.get('X-Twilio-Signature');
  if (!signature) {
    console.error('Missing X-Twilio-Signature header');
    return false;
  }

  try {
    // Get form data
    const formData = await req.clone().formData();
    const params = new Map<string, string>();
    
    formData.forEach((value, key) => {
      params.set(key, value.toString());
    });

    // Sort parameters alphabetically
    const sortedKeys = Array.from(params.keys()).sort();
    
    // Build the data string: URL + sorted key-value pairs
    let dataString = url;
    for (const key of sortedKeys) {
      dataString += key + params.get(key);
    }

    // Create HMAC-SHA1 signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(authToken),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(dataString)
    );

    // Convert to base64
    const computedSignature = btoa(
      String.fromCharCode(...new Uint8Array(signatureBuffer))
    );

    // Constant-time comparison
    return timingSafeEqual(signature, computedSignature);
  } catch (error) {
    console.error('Twilio signature verification error:', error);
    return false;
  }
}

/**
 * Verify Meta (Facebook/WhatsApp) webhook signature
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
export async function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): Promise<boolean> {
  if (!signatureHeader) {
    console.error('Missing x-hub-signature-256 header');
    return false;
  }

  const signature = signatureHeader.replace('sha256=', '');

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(appSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(rawBody)
    );

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison
    return timingSafeEqual(signature, computedSignature);
  } catch (error) {
    console.error('Meta signature verification error:', error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Log failed verification attempt for security monitoring
 */
export async function logVerificationFailure(
  supabase: any,
  provider: string,
  requestInfo: {
    ip?: string;
    userAgent?: string;
    path?: string;
    reason: string;
  }
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      action: 'WEBHOOK_VERIFICATION_FAILED',
      table_name: 'edge_functions',
      new_values: {
        provider,
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
        path: requestInfo.path,
        reason: requestInfo.reason,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log verification failure:', error);
  }
}
