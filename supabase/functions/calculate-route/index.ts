import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RouteRequest {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_MAPS_DIRECTIONS_API_KEY');
    
    if (!apiKey) {
      console.error('❌ Google Maps Directions API key not found');
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          message: 'مفتاح Google Maps Directions API غير متوفر'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { origin, destination }: RouteRequest = await req.json();

    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      console.error('❌ Invalid request: missing coordinates');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request',
          message: 'يجب توفير إحداثيات البداية والنهاية'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`📍 Calculating route from (${origin.lat}, ${origin.lng}) to (${destination.lat}, ${destination.lng})`);

    // Call Google Maps Directions API
    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.append('origin', `${origin.lat},${origin.lng}`);
    url.searchParams.append('destination', `${destination.lat},${destination.lng}`);
    url.searchParams.append('mode', 'driving');
    url.searchParams.append('language', 'ar');
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('❌ Google Maps API error:', data.status, data.error_message);
      return new Response(
        JSON.stringify({ 
          error: data.status,
          message: data.error_message || 'فشل حساب المسار'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!data.routes || data.routes.length === 0) {
      console.warn('⚠️ No routes found');
      return new Response(
        JSON.stringify({ 
          error: 'No routes found',
          message: 'لم يتم العثور على مسار'
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    const routeInfo = {
      distance: leg.distance.text,
      distanceValue: leg.distance.value, // in meters
      duration: leg.duration.text,
      durationValue: leg.duration.value, // in seconds
      eta: new Date(Date.now() + leg.duration.value * 1000).toISOString(),
      polyline: route.overview_polyline.points,
      startAddress: leg.start_address,
      endAddress: leg.end_address,
      steps: leg.steps.map((step: any) => ({
        distance: step.distance.text,
        duration: step.duration.text,
        instruction: step.html_instructions,
        polyline: step.polyline.points,
      })),
    };

    console.log(`✅ Route calculated: ${routeInfo.distance}, ${routeInfo.duration}`);

    return new Response(
      JSON.stringify(routeInfo),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in calculate-route function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        message: 'حدث خطأ أثناء حساب المسار'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
