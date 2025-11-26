import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestLocation {
  latitude: number;
  longitude: number;
}

interface Technician {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  total_reviews: number;
  status: string;
  current_latitude: number;
  current_longitude: number;
  service_area_radius: number;
  level: string;
}

// Haversine formula to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate technician score based on multiple factors
function calculateTechnicianScore(
  technician: Technician,
  distance: number,
  requestSpecialization: string
): number {
  let score = 0;

  // Distance factor (closer is better) - 40% weight
  const maxDistance = 50; // km
  const distanceScore = Math.max(0, (1 - distance / maxDistance) * 40);
  score += distanceScore;

  // Rating factor - 30% weight
  const ratingScore = (technician.rating / 5) * 30;
  score += ratingScore;

  // Level factor - 15% weight
  const levelScores: Record<string, number> = {
    'top_rated': 15,
    'platinum': 12,
    'gold': 9,
    'silver': 6,
    'bronze': 3,
    'certified': 0,
  };
  score += levelScores[technician.level] || 0;

  // Specialization match - 10% weight
  if (technician.specialization === requestSpecialization) {
    score += 10;
  }

  // Review count factor (more experienced) - 5% weight
  const reviewScore = Math.min(5, (technician.total_reviews / 20) * 5);
  score += reviewScore;

  return score;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { requestId } = await req.json();

    if (!requestId) {
      return new Response(
        JSON.stringify({ error: 'Request ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request details
    const { data: request, error: requestError } = await supabase
      .from('maintenance_requests')
      .select('latitude, longitude, category_id, service_type')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!request.latitude || !request.longitude) {
      return new Response(
        JSON.stringify({ error: 'Request location is missing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get available technicians
    const { data: technicians, error: techError } = await supabase
      .from('technicians')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .in('status', ['online', 'available'])
      .gte('rating', 4.2)
      .not('current_latitude', 'is', null)
      .not('current_longitude', 'is', null);

    if (techError || !technicians || technicians.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No available technicians found',
          matches: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate scores and filter by radius
    const scoredTechnicians = technicians
      .map((tech: Technician) => {
        const distance = calculateDistance(
          request.latitude!,
          request.longitude!,
          tech.current_latitude,
          tech.current_longitude
        );

        // Check if within service area
        if (distance > tech.service_area_radius) {
          return null;
        }

        const score = calculateTechnicianScore(tech, distance, request.service_type || '');

        return {
          ...tech,
          distance,
          score,
        };
      })
      .filter((tech): tech is NonNullable<typeof tech> => tech !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Get top 3 matches

    if (scoredTechnicians.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No technicians found within service area',
          matches: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign to best match
    const bestMatch = scoredTechnicians[0];

    const { error: assignError } = await supabase
      .from('maintenance_requests')
      .update({
        assigned_vendor_id: bestMatch.id,
        status: 'Assigned',
        workflow_stage: 'ASSIGNED',
      })
      .eq('id', requestId);

    if (assignError) {
      throw assignError;
    }

    // Send notifications to all top 3
    for (const tech of scoredTechnicians) {
      await supabase.from('notifications').insert({
        recipient_id: tech.id,
        title: 'طلب صيانة جديد',
        message: `طلب صيانة جديد على بعد ${tech.distance.toFixed(1)} كم منك`,
        type: 'info',
        entity_type: 'maintenance_request',
        entity_id: requestId,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        assigned_technician: {
          id: bestMatch.id,
          name: bestMatch.name,
          rating: bestMatch.rating,
          distance: bestMatch.distance,
          score: bestMatch.score,
        },
        alternatives: scoredTechnicians.slice(1).map(t => ({
          id: t.id,
          name: t.name,
          rating: t.rating,
          distance: t.distance,
          score: t.score,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error assigning technician:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
