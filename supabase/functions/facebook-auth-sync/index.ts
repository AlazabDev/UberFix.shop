import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacebookAuthRequest {
  facebookId: string;
  email?: string;
  name: string;
  pictureUrl?: string;
  accessToken: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { facebookId, email, name, pictureUrl, accessToken }: FacebookAuthRequest = await req.json();

    if (!facebookId || !name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: facebookId and name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Facebook user already exists
    const { data: existingFbUser, error: fetchError } = await supabaseAdmin
      .from('facebook_users')
      .select('*')
      .eq('facebook_id', facebookId)
      .single();

    let supabaseUserId: string | null = null;
    let isNewUser = false;

    if (existingFbUser) {
      // Update existing Facebook user
      supabaseUserId = existingFbUser.supabase_user_id;

      await supabaseAdmin
        .from('facebook_users')
        .update({
          name,
          email,
          picture_url: pictureUrl,
          access_token: accessToken,
          last_login_at: new Date().toISOString(),
        })
        .eq('facebook_id', facebookId);

    } else {
      isNewUser = true;

      // Create Supabase auth user if email is provided
      if (email) {
        // Check if email already exists in auth.users
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);

        if (existingUser) {
          supabaseUserId = existingUser.id;
        } else {
          // Create new Supabase user with random password (Facebook handles auth)
          const randomPassword = crypto.randomUUID() + crypto.randomUUID();
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: randomPassword,
            email_confirm: true,
            user_metadata: {
              full_name: name,
              avatar_url: pictureUrl,
              provider: 'facebook',
              facebook_id: facebookId,
            }
          });

          if (!createError && newUser.user) {
            supabaseUserId = newUser.user.id;
          }
        }
      }

      // Create Facebook user record
      const { error: insertError } = await supabaseAdmin
        .from('facebook_users')
        .insert({
          facebook_id: facebookId,
          email,
          name,
          picture_url: pictureUrl,
          access_token: accessToken,
          supabase_user_id: supabaseUserId,
        });

      if (insertError) {
        console.error('Error inserting Facebook user:', insertError);
        throw insertError;
      }
    }

    // Generate a session token for the user if they have a Supabase user
    let sessionToken: string | null = null;
    if (supabaseUserId) {
      // Create a custom session using signInWithPassword alternative
      // Since we can't directly create session, we'll use a workaround
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email!,
      });

      if (sessionData && !sessionError) {
        sessionToken = sessionData.properties?.hashed_token || null;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        isNewUser,
        supabaseUserId,
        facebookId,
        name,
        email,
        pictureUrl,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Facebook auth sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
