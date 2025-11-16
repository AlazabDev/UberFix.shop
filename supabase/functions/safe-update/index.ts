import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateRequest {
  table: string;
  id: string;
  payload: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { table, id, payload }: UpdateRequest = await req.json();

    console.log(`Update request for ${table}:${id} by user ${user.id}`);

    // Validate input
    if (!table || !id || !payload) {
      throw new Error('Missing required fields: table, id, payload');
    }

    // Route to appropriate update function
    let result;
    switch (table) {
      case 'properties':
        result = await supabaseClient.rpc('update_property', {
          p_id: id,
          p_payload: payload,
        });
        break;

      case 'maintenance_requests':
        result = await supabaseClient.rpc('update_maintenance_request', {
          p_id: id,
          p_payload: payload,
        });
        break;

      case 'projects':
        result = await supabaseClient.rpc('update_project', {
          p_id: id,
          p_payload: payload,
        });
        break;

      case 'vendors':
        result = await supabaseClient.rpc('update_vendor', {
          p_id: id,
          p_payload: payload,
        });
        break;

      case 'profiles':
        result = await supabaseClient.rpc('update_user_profile', {
          p_id: id,
          p_payload: payload,
        });
        break;

      default:
        throw new Error(`Unsupported table: ${table}`);
    }

    if (result.error) {
      console.error('Update error:', result.error);
      throw result.error;
    }

    console.log(`Successfully updated ${table}:${id}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: result.data,
        message: 'Record updated successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Safe update error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
