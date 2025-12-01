import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VersionHistoryRequest {
  table: string;
  id: string;
  limit?: number;
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

    // Parse request
    const { table, id, limit = 10 }: VersionHistoryRequest = 
      req.method === 'GET' 
        ? Object.fromEntries(new URL(req.url).searchParams)
        : await req.json();

    console.log(`Version history request for ${table}:${id} by user ${user.id}`);

    // Validate input
    if (!table || !id) {
      throw new Error('Missing required fields: table, id');
    }

    // Get version history
    const { data, error } = await supabaseClient.rpc('get_version_history', {
      p_table_name: table,
      p_record_id: id,
      p_limit: limit,
    });

    if (error) {
      console.error('Version history error:', error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} versions for ${table}:${id}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
        count: data?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Version history error:', error);
    
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
