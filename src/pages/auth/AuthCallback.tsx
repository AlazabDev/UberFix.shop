import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AuthType = 'signup' | 'recovery' | 'magiclink' | 'email_change' | 'invite' | 'email' | null;

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [message, setMessage] = useState('جاري معالجة طلب المصادقة...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Parse URL parameters from both hash and query string
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Get all possible tokens and parameters
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = (hashParams.get('type') || queryParams.get('type')) as AuthType;
        const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash');
        const token = hashParams.get('token') || queryParams.get('token');
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code');

        console.log('Auth callback params:', { type, tokenHash: !!tokenHash, token: !!token, accessToken: !!accessToken, errorParam, errorCode });

        // Handle errors from Supabase
        if (errorParam) {
          let errorMsg = decodeURIComponent(errorDescription || errorParam);
          
          // Translate common errors
          if (errorParam === 'access_denied' || errorCode === 'otp_expired') {
            errorMsg = 'انتهت صلاحية الرابط. يرجى طلب رابط جديد.';
          } else if (errorCode === 'invalid_credentials') {
            errorMsg = 'الرابط غير صالح أو تم استخدامه مسبقاً.';
          }
          
          console.error('Auth error:', errorParam, errorDescription);
          setError(errorMsg);
          return;
        }

        // Handle recovery flow (password reset)
        if (type === 'recovery') {
          setMessage('جاري تحضير صفحة إعادة تعيين كلمة المرور...');
          
          // Method 1: Using token_hash (newer method)
          if (tokenHash) {
            console.log('Verifying recovery with token_hash');
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery',
            });

            if (verifyError) {
              console.error('Token hash verification failed:', verifyError);
              if (verifyError.message.includes('expired') || verifyError.message.includes('not found')) {
                setError('انتهت صلاحية رابط إعادة تعيين كلمة المرور. يرجى طلب رابط جديد.');
              } else {
                setError(verifyError.message);
              }
              return;
            }

            if (data?.session) {
              console.log('Recovery session established via token_hash');
              navigate('/auth/update-password', { replace: true });
              return;
            }
          }
          
          // Method 2: Direct token exchange
          if (accessToken && refreshToken) {
            console.log('Setting recovery session from tokens');
            const { error: sessionError } = await supabase.auth.setSession({ 
              access_token: accessToken, 
              refresh_token: refreshToken 
            });
            
            if (sessionError) {
              console.error('Session set failed:', sessionError);
              setError('فشل في تفعيل الجلسة. يرجى طلب رابط جديد.');
              return;
            }
            
            navigate('/auth/update-password', { replace: true });
            return;
          }
          
          // No valid recovery tokens found
          setError('رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.');
          return;
        }

        // Handle email change
        if (type === 'email_change') {
          setMessage('جاري التحقق من تغيير البريد الإلكتروني...');
          navigate(`/auth/verify-email-change${window.location.hash}${window.location.search}`, { replace: true });
          return;
        }

        // Handle magic link
        if (type === 'magiclink') {
          setMessage('جاري تسجيل الدخول عبر الرابط السحري...');
          navigate(`/auth/magic${window.location.hash}${window.location.search}`, { replace: true });
          return;
        }

        // Handle signup/email confirmation
        if (tokenHash && (type === 'signup' || type === 'email')) {
          setMessage('جاري تأكيد البريد الإلكتروني...');
          
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type === 'signup' ? 'signup' : 'email',
          });

          if (verifyError) {
            console.error('Email verification error:', verifyError);
            if (verifyError.message.includes('expired')) {
              setError('انتهت صلاحية رابط التأكيد. يرجى إعادة التسجيل.');
            } else {
              setError(verifyError.message);
            }
            return;
          }

          if (data?.session) {
            toast({
              title: "تم تأكيد البريد بنجاح",
              description: "مرحباً بك في UberFix",
            });
            navigate('/dashboard', { replace: true });
            return;
          }
        }

        // Handle OAuth callback (Google, etc.) - check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Existing session found, redirecting to dashboard');
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في UberFix",
          });
          navigate('/dashboard', { replace: true });
          return;
        }

        // Handle direct token exchange (OAuth callback with tokens in URL)
        if (accessToken && refreshToken) {
          setMessage('جاري تسجيل الدخول...');
          
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Token exchange error:', sessionError);
            setError('فشل في تسجيل الدخول. حاول مرة أخرى.');
            return;
          }

          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في UberFix",
          });
          navigate('/dashboard', { replace: true });
          return;
        }

        // No valid auth parameters found
        console.log('No valid auth parameters found');
        setError('لم يتم العثور على معلومات المصادقة الصالحة.');
        
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة طلب المصادقة');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  // Show error state with action buttons
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">خطأ في المصادقة</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => navigate('/forgot-password')} variant="default">
              طلب رابط جديد
            </Button>
            <Button onClick={() => navigate('/login')} variant="outline">
              الذهاب لتسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
