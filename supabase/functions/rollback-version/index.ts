import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RollbackRequest {
  table: string;
  id: string;
  version: number;
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

    // Check if user is admin
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!userRoles) {
      throw new Error('Only administrators can rollback changes');
    }

    // Parse request body
    const { table, id, version }: RollbackRequest = await req.json();

    console.log(`Rollback request for ${table}:${id} to version ${version} by admin ${user.id}`);

    // Validate input
    if (!table || !id || version === undefined) {
      throw new Error('Missing required fields: table, id, version');
    }

    // Perform rollback
    const { data, error } = await supabaseClient.rpc('rollback_to_version', {
      p_table_name: table,
      p_record_id: id,
      p_version: version,
    });

    if (error) {
      console.error('Rollback error:', error);
      throw error;
    }

    console.log(`Successfully rolled back ${table}:${id} to version ${version}`);

    // Log the rollback action
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'ROLLBACK',
      table_name: table,
      record_id: id,
      new_values: {
        rolled_back_to_version: version,
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        message: `Successfully rolled back to version ${version}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Rollback error:', error);
    
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
