import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';
import { verifyAuth, unauthorizedResponse } from '../_shared/auth.ts';
import { rateLimit, createRateLimitResponse } from '../_shared/rateLimiter.ts';

// Allowed origins for additional validation
const ALLOWED_ORIGINS = [
  'https://uberfix.shop',
  'https://uberfiix.lovable.app',
  'https://lovableproject.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const responseHeaders = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: responseHeaders });
  }

  try {
    // Verify authentication
    const auth = await verifyAuth(req);
    if (!auth.isAuthenticated || !auth.user) {
      console.log('⚠️ Unauthorized request for maps key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'يجب تسجيل الدخول' }),
        { status: 401, headers: { ...responseHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting per user (30 requests per minute)
    const isAllowed = rateLimit(auth.user.id, { windowMs: 60000, maxRequests: 30 });
    if (!isAllowed) {
      console.log(`⚠️ Rate limit exceeded for user: ${auth.user.id}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too Many Requests', 
          message: 'تم تجاوز الحد المسموح، يرجى الانتظار' 
        }),
        { 
          status: 429, 
          headers: { 
            ...responseHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      );
    }

    // Get API key from secrets
    let apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    let keySource = 'primary';

    if (!apiKey) {
      console.log('⚠️ Primary key not found, trying fallback...');
      apiKey = Deno.env.get('GOOGLE_MAP_API_KEY');
      keySource = 'fallback';
    }

    if (!apiKey) {
      console.error('❌ No Google Maps API keys found in secrets');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          message: 'يرجى تكوين مفتاح Google Maps API في Supabase Secrets'
        }),
        { 
          status: 500,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log access for audit
    console.log(`✅ API key retrieved by user: ${auth.user.id} (${keySource})`);

    return new Response(
      JSON.stringify({ apiKey, keySource }),
      { 
        headers: { 
          ...responseHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=300' // Cache for 5 minutes
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
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
