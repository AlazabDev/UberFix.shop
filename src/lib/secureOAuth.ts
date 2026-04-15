/**
 * Secure OAuth Helper
 * 
 * يعمل على جميع الدومينات بنفس الطريقة:
 * - Lovable domains (lovable.app, lovableproject.com, localhost)
 * - Custom domains (uberfix.shop, uberfix.alazab.com)
 * 
 * يستخدم التدفق العادي لـ Supabase OAuth بدون skipBrowserRedirect
 */

import { supabase } from '@/integrations/supabase/client';
import type { Provider } from '@supabase/supabase-js';

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
