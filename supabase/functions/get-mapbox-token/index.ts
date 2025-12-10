import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed domains for referrer validation
const ALLOWED_DOMAINS = [
  'uberfix.shop',
  'uberfiix.lovable.app',
  'lovable.app',
  'localhost',
  '127.0.0.1',
];

function isAllowedOrigin(req: Request): boolean {
  const referer = req.headers.get('referer') || '';
  const origin = req.headers.get('origin') || '';
  const source = referer || origin;
  
  // Allow if no referrer (direct API calls from server-side)
  if (!source) {
    // Check if it's from our Supabase functions
    const userAgent = req.headers.get('user-agent') || '';
    if (userAgent.includes('Deno') || userAgent.includes('supabase')) {
      return true;
    }
    // Block unknown direct requests
    return false;
  }
  
  return ALLOWED_DOMAINS.some(domain => source.includes(domain));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate referrer/origin
    if (!isAllowedOrigin(req)) {
      console.error('❌ Unauthorized origin attempted to access Mapbox token');
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized origin',
          message: 'الوصول غير مصرح به'
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');

    if (!mapboxToken) {
      console.error('❌ MAPBOX_PUBLIC_TOKEN not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          message: 'يرجى تكوين مفتاح Mapbox في إعدادات المشروع'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Mapbox token retrieved successfully');

    return new Response(
      JSON.stringify({ token: mapboxToken }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ Error in get-mapbox-token function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        message: 'حدث خطأ أثناء جلب مفتاح Mapbox'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});