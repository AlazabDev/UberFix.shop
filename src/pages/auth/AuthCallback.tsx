import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { detectUserRole } from '@/lib/roleRedirect';

type AuthType = 'signup' | 'recovery' | 'magiclink' | 'email_change' | 'invite' | 'email' | null;

/**
 * OAuth Callback Handler
 * 
 * المعمارية الصحيحة:
 * 1. استقبال OAuth callback
 * 2. تأسيس الجلسة
 * 3. اكتشاف الدور من DB
 * 4. التوجيه الذكي حسب الدور
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('جاري معالجة طلب المصادقة...');
  const [error, setError] = useState<string | null>(null);

  // التوجيه الذكي بعد المصادقة
  const handleSmartRedirect = async (userId: string, userEmail?: string) => {
    try {
      setMessage('جاري تحديد صلاحياتك...');
      const roleInfo = await detectUserRole(userId, userEmail);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: roleInfo.isNewUser ? "مرحباً بك! يرجى اختيار نوع حسابك" : "مرحباً بك في UberFix",
      });
      
      navigate(roleInfo.redirectPath, { replace: true });
    } catch (err) {
      console.error('Role detection failed:', err);
      // Fallback to dashboard
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في UberFix",
      });
      navigate('/dashboard', { replace: true });
    }
  };

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
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code');

        console.log('Auth callback params:', { type, tokenHash: !!tokenHash, accessToken: !!accessToken, errorParam, errorCode });

        // Handle errors from Supabase
        if (errorParam) {
          let errorMsg = decodeURIComponent(errorDescription || errorParam);
          
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
          
          if (tokenHash) {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery',
            });

            if (verifyError) {
              setError(verifyError.message.includes('expired') 
                ? 'انتهت صلاحية رابط إعادة تعيين كلمة المرور. يرجى طلب رابط جديد.'
                : verifyError.message);
              return;
            }

            if (data?.session) {
              navigate('/auth/update-password', { replace: true });
              return;
            }
          }
          
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({ 
              access_token: accessToken, 
              refresh_token: refreshToken 
            });
            
            if (sessionError) {
              setError('فشل في تفعيل الجلسة. يرجى طلب رابط جديد.');
              return;
            }
            
            navigate('/auth/update-password', { replace: true });
            return;
          }
          
          setError('رابط إعادة تعيين كلمة المرور غير صالح.');
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
            setError(verifyError.message.includes('expired') 
              ? 'انتهت صلاحية رابط التأكيد. يرجى إعادة التسجيل.'
              : verifyError.message);
            return;
          }

          if (data?.session?.user) {
            await handleSmartRedirect(data.session.user.id, data.session.user.email);
            return;
          }
        }

        // Handle OAuth callback (Google, Facebook, etc.)
        if (accessToken && refreshToken) {
          setMessage('جاري تسجيل الدخول...');
          
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('OAuth token exchange error:', sessionError);
            setError('فشل في تسجيل الدخول. حاول مرة أخرى.');
            return;
          }

          if (sessionData?.session?.user) {
            await handleSmartRedirect(sessionData.session.user.id, sessionData.session.user.email);
            return;
          }
        }

        // Check for existing session
        setMessage('جاري التحقق من الجلسة...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleSmartRedirect(session.user.id, session.user.email);
          return;
        }

        // Retry after 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        if (retrySession?.user) {
          await handleSmartRedirect(retrySession.user.id, retrySession.user.email);
          return;
        }

        // No valid auth parameters found
        setError('لم يتم العثور على معلومات المصادقة الصالحة.');
        
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة طلب المصادقة');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  // Error state
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
