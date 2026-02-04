import { useState, useEffect, useCallback } from 'react';
import {
  loginWithFacebook,
  logoutFromFacebook,
  getFacebookLoginStatus,
  isFacebookSDKLoaded,
  waitForFacebookSDK,
  storeFacebookSession,
  clearFacebookSession,
  getStoredFacebookSession,
  FacebookUserData,
  FacebookAuthResult,
} from '@/lib/facebookAuth';

export interface UseFacebookAuthReturn {
  user: FacebookUserData | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  login: () => Promise<FacebookAuthResult>;
  logout: () => Promise<void>;
  checkLoginStatus: () => Promise<void>;
}

/**
 * React hook for Facebook SDK authentication
 * Provides direct Facebook login without Supabase proxy
 */
export function useFacebookAuth(): UseFacebookAuthReturn {
  const [user, setUser] = useState<FacebookUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check login status on mount
  const checkLoginStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First check stored session
      const storedSession = getStoredFacebookSession();
      if (storedSession) {
        // Verify with Facebook SDK
        await waitForFacebookSDK();
        const status = await getFacebookLoginStatus();
        
        if (status.status === 'connected') {
          setUser(storedSession.user);
          setIsLoggedIn(true);
        } else {
          // Session expired, clear stored data
          clearFacebookSession();
          setUser(null);
          setIsLoggedIn(false);
        }
      } else if (isFacebookSDKLoaded()) {
        const status = await getFacebookLoginStatus();
        if (status.status === 'connected') {
          // User is logged in but we don't have their data
          // This shouldn't normally happen, but handle it
          setIsLoggedIn(true);
        }
      }
    } catch (err) {
      console.warn('Error checking Facebook login status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // Login function
  const login = useCallback(async (): Promise<FacebookAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginWithFacebook('email,public_profile');
      
      if (result.success && result.user && result.accessToken) {
        setUser(result.user);
        setIsLoggedIn(true);
        storeFacebookSession(result.user, result.accessToken);
      } else {
        setError(result.error || 'فشل تسجيل الدخول');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await logoutFromFacebook();
      clearFacebookSession();
      setUser(null);
      setIsLoggedIn(false);
      setError(null);
    } catch (err) {
      console.error('Error logging out from Facebook:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isLoggedIn,
    error,
    login,
    logout,
    checkLoginStatus,
  };
}
