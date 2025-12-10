import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting storage (in-memory for edge function instance)
const verifyAttempts = new Map<string, { count: number; firstAttempt: number }>();

// Rate limit: 5 attempts per phone per 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const VERIFY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(phone: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();
  const key = `verify:${phone}`;
  const attempts = verifyAttempts.get(key);

  if (!attempts) {
    verifyAttempts.set(key, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  // Reset if window has passed
  if (now - attempts.firstAttempt > VERIFY_WINDOW_MS) {
    verifyAttempts.set(key, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  // Check if limit exceeded
  if (attempts.count >= MAX_VERIFY_ATTEMPTS) {
    const remainingTime = Math.ceil((VERIFY_WINDOW_MS - (now - attempts.firstAttempt)) / 1000);
    return { allowed: false, remainingTime };
  }

  // Increment count
  attempts.count++;
  verifyAttempts.set(key, attempts);
  return { allowed: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      throw new Error('Phone and OTP are required');
    }

    // Check rate limit BEFORE attempting verification
    const rateCheck = checkRateLimit(phone);
    if (!rateCheck.allowed) {
      console.log(`⚠️ Rate limit exceeded for phone: ${phone.slice(0, 6)}***`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `محاولات كثيرة جداً. الرجاء الانتظار ${rateCheck.remainingTime} ثانية.`,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find valid OTP
    const { data: otpRecord, error: otpError } = await supabaseClient
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('otp_code', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) throw otpError;

    if (!otpRecord) {
      console.log(`❌ Invalid OTP attempt for phone: ${phone.slice(0, 6)}***`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Mark OTP as verified
    await supabaseClient
      .from('otp_verifications')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', otpRecord.id);

    console.log('✅ OTP verified successfully for:', phone.slice(0, 6) + '***');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'تم التحقق بنجاح',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
