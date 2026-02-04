/**
 * Facebook SDK Direct Authentication
 * Provides direct Facebook login without Supabase proxy for better UX
 */

// Facebook SDK types
declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string;
        autoLogAppEvents: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options?: { scope: string; return_scopes?: boolean }
      ) => void;
      logout: (callback: () => void) => void;
      getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void;
      api: (
        path: string,
        params: { fields: string; access_token?: string },
        callback: (response: FacebookUserData | FacebookErrorResponse) => void
      ) => void;
    };
    fbAsyncInit: () => void;
  }
}

export interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
    data_access_expiration_time: number;
  };
}

export interface FacebookUserData {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
      width: number;
      height: number;
    };
  };
}

export interface FacebookErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
  };
}

export interface FacebookAuthResult {
  success: boolean;
  user?: FacebookUserData;
  accessToken?: string;
  error?: string;
}

// Facebook App ID from index.html
const FACEBOOK_APP_ID = '724370950034089';

/**
 * Check if Facebook SDK is loaded
 */
export function isFacebookSDKLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.FB !== 'undefined';
}

/**
 * Wait for Facebook SDK to load
 */
export function waitForFacebookSDK(timeout = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isFacebookSDKLoaded()) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isFacebookSDKLoaded()) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Facebook SDK failed to load'));
      }
    }, 100);
  });
}

/**
 * Get current Facebook login status
 */
export function getFacebookLoginStatus(): Promise<FacebookLoginResponse> {
  return new Promise((resolve, reject) => {
    if (!isFacebookSDKLoaded()) {
      reject(new Error('Facebook SDK not loaded'));
      return;
    }
    
    window.FB.getLoginStatus((response) => {
      resolve(response);
    });
  });
}

/**
 * Login with Facebook SDK directly
 * Shows Meta login popup for user authentication
 */
export function loginWithFacebook(scopes = 'email,public_profile'): Promise<FacebookAuthResult> {
  return new Promise(async (resolve) => {
    try {
      await waitForFacebookSDK();
      
      window.FB.login(
        (response) => {
          if (response.status === 'connected' && response.authResponse) {
            // Get user data after successful login
            window.FB.api(
              '/me',
              { fields: 'id,name,email,picture.type(large)', access_token: response.authResponse.accessToken },
              (userResponse) => {
                if ('error' in userResponse) {
                  resolve({
                    success: false,
                    error: userResponse.error.message,
                  });
                } else {
                  resolve({
                    success: true,
                    user: userResponse as FacebookUserData,
                    accessToken: response.authResponse!.accessToken,
                  });
                }
              }
            );
          } else if (response.status === 'not_authorized') {
            resolve({
              success: false,
              error: 'لم يتم منح التطبيق الإذن للوصول إلى حسابك',
            });
          } else {
            resolve({
              success: false,
              error: 'تم إلغاء تسجيل الدخول',
            });
          }
        },
        { scope: scopes, return_scopes: true }
      );
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      });
    }
  });
}

/**
 * Logout from Facebook
 */
export function logoutFromFacebook(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isFacebookSDKLoaded()) {
      resolve(); // Not logged in via Facebook SDK
      return;
    }

    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        window.FB.logout(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

/**
 * Store Facebook session in localStorage
 */
export function storeFacebookSession(user: FacebookUserData, accessToken: string): void {
  const session = {
    user,
    accessToken,
    loginTime: Date.now(),
    provider: 'facebook' as const,
  };
  
  try {
    localStorage.setItem('facebook_session', JSON.stringify(session));
  } catch (e) {
    console.warn('Failed to store Facebook session:', e);
  }
}

/**
 * Get stored Facebook session
 */
export function getStoredFacebookSession(): { user: FacebookUserData; accessToken: string; loginTime: number } | null {
  try {
    const stored = localStorage.getItem('facebook_session');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to get stored Facebook session:', e);
  }
  return null;
}

/**
 * Clear stored Facebook session
 */
export function clearFacebookSession(): void {
  try {
    localStorage.removeItem('facebook_session');
  } catch (e) {
    console.warn('Failed to clear Facebook session:', e);
  }
}

/**
 * Check if user is logged in via Facebook (direct SDK)
 */
export async function isFacebookLoggedIn(): Promise<boolean> {
  try {
    const status = await getFacebookLoginStatus();
    return status.status === 'connected';
  } catch {
    return false;
  }
}
