import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { rateLimit } from '../_shared/rateLimiter.ts';

/**
 * Public endpoint returning ONLY default company_id + branch_id.
 * Needed for public/unauthenticated request flows without exposing companies/branches tables.
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP (30 requests/min) to prevent enumeration.
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    const isAllowed = rateLimit(`default_ids_${clientIP}`, { windowMs: 60_000, maxRequests: 30 });
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (companyError || !company?.id) {
      console.error('get-default-company-branch: company lookup failed', companyError);
      return new Response(
        JSON.stringify({ error: 'No company found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: branch, error: branchError } = await supabaseAdmin
      .from('branches')
      .select('id')
      .eq('company_id', company.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (branchError || !branch?.id) {
      console.error('get-default-company-branch: branch lookup failed', branchError);
      return new Response(
        JSON.stringify({ error: 'No branch found for company' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ company_id: company.id, branch_id: branch.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in get-default-company-branch:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
