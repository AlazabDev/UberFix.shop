/**
 * Secure OAuth Helper for Custom Domains
 * Bypasses Lovable's auth-bridge on custom domains to prevent redirect vulnerabilities
 */

import { supabase } from '@/integrations/supabase/client';
import type { Provider } from '@supabase/supabase-js';

// Allowed OAuth provider hosts for security validation
const ALLOWED_OAUTH_HOSTS = [
  'accounts.google.com',
  'www.facebook.com',
  'facebook.com',
  'github.com',
  'zrrffsjbfkphridqyais.supabase.co', // Supabase project URL
];

// Lovable preview domains
const LOVABLE_DOMAINS = ['lovable.app', 'lovableproject.com', 'localhost'];

/**
 * Check if the app is running on a custom domain
 */
export function isCustomDomain(): boolean {
  const hostname = window.location.hostname;
  return !LOVABLE_DOMAINS.some(domain => hostname.includes(domain));
}

/**
 * Validate OAuth redirect URL to prevent open redirect attacks
 */
function validateOAuthUrl(url: string): boolean {
  try {
    const oauthUrl = new URL(url);
    return ALLOWED_OAUTH_HOSTS.some(host => oauthUrl.hostname === host || oauthUrl.hostname.endsWith('.' + host));
  } catch {
    return false;
  }
}

/**
 * Get the appropriate redirect URL based on environment
 */
export function getRedirectUrl(path: string = '/auth/callback'): string {
  return `${window.location.origin}${path}`;
}

interface SecureOAuthOptions {
  provider: Provider;
  redirectTo?: string;
  queryParams?: Record<string, string>;
  scopes?: string;
}

interface SecureOAuthResult {
  success: boolean;
  error?: Error;
}

/**
 * Securely sign in with OAuth provider
 * Handles custom domain detection and bypasses auth-bridge when necessary
 */
export async function secureSignInWithOAuth(options: SecureOAuthOptions): Promise<SecureOAuthResult> {
  const { provider, redirectTo = getRedirectUrl(), queryParams, scopes } = options;

  try {
    // Check if we're on a custom domain
    const onCustomDomain = isCustomDomain();

    if (onCustomDomain) {
      // Bypass auth-bridge by getting OAuth URL directly
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true, // Prevents automatic redirect by auth-bridge
          queryParams,
          scopes,
        },
      });

      if (error) {
        throw error;
      }

      // Validate OAuth URL before redirect (security: prevent open redirect)
      if (data?.url) {
        if (!validateOAuthUrl(data.url)) {
          throw new Error('Invalid OAuth redirect URL - potential security risk');
        }
        
        // Manual redirect to the validated OAuth URL
        window.location.href = data.url;
        return { success: true };
      }

      throw new Error('No OAuth URL returned from provider');
    } else {
      // For Lovable domains, use the normal flow (auth-bridge handles it)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams,
          scopes,
        },
      });

      if (error) {
        throw error;
      }

      return { success: true };
    }
  } catch (error) {
    console.error('Secure OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown OAuth error'),
    };
  }
}

/**
 * Sign in with Google securely
 */
export async function secureGoogleSignIn(redirectPath: string = '/auth/callback'): Promise<SecureOAuthResult> {
  return secureSignInWithOAuth({
    provider: 'google',
    redirectTo: getRedirectUrl(redirectPath),
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  });
}

/**
 * Sign in with Facebook via Supabase (backup for SDK issues)
 */
export async function secureFacebookSignIn(redirectPath: string = '/auth/callback'): Promise<SecureOAuthResult> {
  return secureSignInWithOAuth({
    provider: 'facebook',
    redirectTo: getRedirectUrl(redirectPath),
    scopes: 'email,public_profile',
  });
}
