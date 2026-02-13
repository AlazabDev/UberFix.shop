/**
 * Secure OAuth Helper
 * 
 * يدعم:
 * - Lovable domains (lovable.app, lovableproject.com, localhost)
 * - Custom domains (uberfix.shop, alazab.com)
 * 
 * على custom domains يستخدم skipBrowserRedirect لتجنب auth-bridge
 */

import { supabase } from '@/integrations/supabase/client';
import type { Provider } from '@supabase/supabase-js';

const ALLOWED_OAUTH_HOSTS = [
  'accounts.google.com',
  'www.facebook.com',
  'facebook.com',
  'github.com',
  'zrrffsjbfkphridqyais.supabase.co',
];

const LOVABLE_DOMAINS = ['lovable.app', 'lovableproject.com', 'localhost'];

function isCustomDomain(): boolean {
  const hostname = window.location.hostname;
  return !LOVABLE_DOMAINS.some(d => hostname.includes(d));
}

function validateOAuthUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ALLOWED_OAUTH_HOSTS.some(h => u.hostname === h || u.hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

function getRedirectUrl(path: string = '/auth/callback'): string {
  return `${window.location.origin}${path}`;
}

interface OAuthResult {
  success: boolean;
  error?: Error;
}

async function signInWithProvider(
  provider: Provider,
  redirectPath: string,
  options?: { queryParams?: Record<string, string>; scopes?: string }
): Promise<OAuthResult> {
  const redirectTo = getRedirectUrl(redirectPath);

  try {
    if (isCustomDomain()) {
      // Custom domain: bypass auth-bridge
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: options?.queryParams,
          scopes: options?.scopes,
        },
      });

      if (error) throw error;

      if (data?.url) {
        if (!validateOAuthUrl(data.url)) {
          throw new Error('Invalid OAuth redirect URL');
        }
        window.location.href = data.url;
        return { success: true };
      }

      throw new Error('No OAuth URL returned');
    } else {
      // Lovable domain: normal flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: options?.queryParams,
          scopes: options?.scopes,
        },
      });

      if (error) throw error;
      return { success: true };
    }
  } catch (error) {
    console.error(`OAuth error (${provider}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown OAuth error'),
    };
  }
}

/**
 * تسجيل دخول بـ Google
 */
export async function secureGoogleSignIn(redirectPath: string = '/auth/callback'): Promise<OAuthResult> {
  return signInWithProvider('google', redirectPath, {
    queryParams: { access_type: 'offline', prompt: 'consent' },
  });
}

/**
 * تسجيل دخول بـ Facebook عبر Supabase OAuth
 */
export async function secureFacebookSignIn(redirectPath: string = '/auth/callback'): Promise<OAuthResult> {
  return signInWithProvider('facebook', redirectPath, {
    scopes: 'email,public_profile',
  });
}
