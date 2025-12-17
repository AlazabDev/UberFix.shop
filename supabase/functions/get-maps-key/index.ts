import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://uberfix.shop',
  'https://uberfiix.lovable.app',
  'https://lovableproject.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

// Rate limiting storage (in-memory for single instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // 30 requests per minute per user
const RATE_WINDOW = 60 * 1000; // 1 minute

function getRateLimitHeaders(origin: string): Record<string, string> {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const corsHeaders = getRateLimitHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('⚠️ Unauthorized request - no auth header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'يجب تسجيل الدخول' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user with Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('⚠️ Invalid token:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'جلسة غير صالحة' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting per user
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      console.log(`⚠️ Rate limit exceeded for user: ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too Many Requests', 
          message: 'تم تجاوز الحد المسموح، يرجى الانتظار' 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60'
          } 
        }
      );
    }

    // Get API key
    let apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    let keySource = 'primary';

    if (!apiKey) {
      console.log('⚠️ Primary key not found, trying fallback...');
      apiKey = Deno.env.get('GOOGLE_MAP_API_KEY');
      keySource = 'fallback';
    }

    if (!apiKey) {
      console.error('❌ No Google Maps API keys found');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          message: 'يرجى تكوين مفتاح Google Maps API'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log access for audit
    console.log(`✅ API key retrieved by user: ${user.id} (${keySource})`);

    return new Response(
      JSON.stringify({ apiKey, keySource }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateCheck.remaining.toString()
        }
      }
    );
  } catch (error) {
    console.error('❌ Error in get-maps-key:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        message: 'حدث خطأ أثناء جلب مفتاح API'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
