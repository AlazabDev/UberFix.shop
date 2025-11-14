import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FacebookAuthResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: string;
    signedRequest: string;
    userID: string;
  };
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export function useFacebookAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFBReady, setIsFBReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // انتظار تحميل Facebook SDK
    const checkFBReady = setInterval(() => {
      if (window.FB) {
        setIsFBReady(true);
        clearInterval(checkFBReady);
        
        // التحقق من حالة تسجيل الدخول عند التحميل
        checkLoginStatus();
      }
    }, 100);

    return () => clearInterval(checkFBReady);
  }, []);

  const checkLoginStatus = () => {
    if (!window.FB) return;

    window.FB.getLoginStatus((response: FacebookAuthResponse) => {
      if (response.status === 'connected') {
        // المستخدم مسجل دخول بـ Facebook ومتصل بالتطبيق
        handleFacebookResponse(response);
      }
    });
  };

  const handleFacebookResponse = async (response: FacebookAuthResponse) => {
    if (response.status === 'connected' && response.authResponse) {
      try {
        const { accessToken } = response.authResponse;
        
        // استخدام Supabase لتسجيل الدخول بـ Facebook
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'facebook',
          token: accessToken,
        });

        if (error) {
          toast({
            title: 'خطأ في تسجيل الدخول',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'تم تسجيل الدخول بنجاح',
            description: 'مرحباً بك في نظام إدارة الصيانة',
          });
          navigate('/dashboard');
        }
      } catch (error: any) {
        toast({
          title: 'حدث خطأ',
          description: error.message || 'حاول مرة أخرى لاحقاً',
          variant: 'destructive',
        });
      }
    }
  };

  const loginWithFacebook = () => {
    if (!window.FB) {
      toast({
        title: 'خطأ',
        description: 'Facebook SDK لم يتم تحميله بعد',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    window.FB.login(
      (response: FacebookAuthResponse) => {
        setIsLoading(false);
        
        if (response.status === 'connected') {
          handleFacebookResponse(response);
        } else if (response.status === 'not_authorized') {
          toast({
            title: 'تسجيل الدخول ملغى',
            description: 'يجب السماح للتطبيق بالوصول لحسابك',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'تسجيل الدخول ملغى',
            description: 'لم يتم تسجيل الدخول بـ Facebook',
            variant: 'destructive',
          });
        }
      },
      { 
        scope: 'public_profile,email',
        return_scopes: true 
      }
    );
  };

  return {
    loginWithFacebook,
    isLoading,
    isFBReady,
  };
}
