import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { verifyAuth } from '../_shared/auth.ts';
import { rateLimit } from '../_shared/rateLimiter.ts';

// Allowed origins for additional validation
const ALLOWED_ORIGINS = [
  'https://uberfix.shop',
  'https://uberfiix.lovable.app',
  'https://lovable.app',
  'https://lovableproject.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

serve(async (req) => {
  const origin = req.headers.get('origin') || '';
  const responseHeaders = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.some(o => origin.includes(o)) ? origin : ALLOWED_ORIGINS[0],
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: responseHeaders });
  }

  try {
    // Verify authentication
    const auth = await verifyAuth(req);
    if (!auth.isAuthenticated || !auth.user) {
      console.error('❌ Unauthorized attempt to access Mapbox token');
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'يجب تسجيل الدخول للوصول إلى هذه الخدمة'
        }),
        { 
          status: 401,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' }
        }
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

    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');

    if (!mapboxToken) {
      console.error('❌ MAPBOX_PUBLIC_TOKEN not found in secrets');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          message: 'يرجى تكوين مفتاح Mapbox في Supabase Secrets'
        }),
        { 
          status: 500,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Mapbox token retrieved by user: ${auth.user.id}`);

    return new Response(
      JSON.stringify({ token: mapboxToken }),
      { 
        headers: { 
          ...responseHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=300' // Cache for 5 minutes
        }
      }
    );
  } catch (error) {
    console.error('❌ Error in get-mapbox-token:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        message: 'حدث خطأ أثناء جلب مفتاح Mapbox'
      }),
      { 
        status: 500,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
