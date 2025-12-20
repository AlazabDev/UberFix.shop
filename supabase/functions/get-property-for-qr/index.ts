import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { rateLimit } from '../_shared/rateLimiter.ts';

/**
 * Public endpoint for QR code property lookup
 * This is intentionally public but with restrictions:
 * 1. Rate limiting by IP
 * 2. Only returns safe, non-sensitive property data
 * 3. Logs access for monitoring
 */

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const propertyId = url.searchParams.get('propertyId');

    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: 'Property ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(propertyId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid property ID format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Rate limiting by IP (10 requests per minute for public endpoint)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    const isAllowed = rateLimit(`qr_${clientIP}`, { windowMs: 60000, maxRequests: 10 });
    if (!isAllowed) {
      console.warn(`⚠️ Rate limit exceeded for QR lookup from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests',
          message: 'يرجى الانتظار قبل المحاولة مرة أخرى'
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch property data - ONLY safe, non-sensitive fields
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .select(`
        id,
        name,
        address,
        type,
        city_id,
        district_id,
        cities:city_id(id, name_ar),
        districts:district_id(id, name_ar)
      `)
      .eq('id', propertyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching property:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch property' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!property) {
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log QR access for monitoring (async, don't wait)
    supabaseAdmin.from('audit_logs').insert({
      action: 'QR_PROPERTY_LOOKUP',
      table_name: 'properties',
      record_id: propertyId,
      new_values: {
        ip: clientIP,
        timestamp: new Date().toISOString()
      }
    }).then(() => {}).catch(e => console.warn('Failed to log QR access:', e));

    // Return only safe data - NO coordinates, NO sensitive info
    return new Response(
      JSON.stringify({ 
        property: {
          id: property.id,
          name: property.name,
          address: property.address,
          type: property.type,
          city: property.cities?.name_ar,
          district: property.districts?.name_ar
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in get-property-for-qr:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
