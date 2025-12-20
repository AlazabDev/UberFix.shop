import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Authentication utilities for Edge Functions
 */

interface AuthResult {
  user: { id: string; email?: string } | null;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Verify user authentication from request
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      user: null,
      error: 'Missing Authorization header',
      isAuthenticated: false
    };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return {
      user: null,
      error: error?.message || 'Invalid or expired token',
      isAuthenticated: false
    };
  }

  return {
    user: { id: user.id, email: user.email },
    error: null,
    isAuthenticated: true
  };
}

/**
 * Get Supabase admin client (service role)
 */
export function getAdminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

/**
 * Check if user has specific role
 */
export async function hasRole(
  supabase: SupabaseClient,
  userId: string,
  roles: string[]
): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', roles)
    .limit(1);

  return !error && data && data.length > 0;
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({ error: 'Unauthorized', message }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message: string = 'Access denied'): Response {
  return new Response(
    JSON.stringify({ error: 'Forbidden', message }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
