import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { detectUserRole } from '@/lib/roleRedirect';

type AuthType = 'signup' | 'recovery' | 'magiclink' | 'email_change' | 'invite' | 'email' | null;

/**
 * OAuth Callback Handler - نقطة واحدة لاستقبال جميع callbacks
 * 
 * التدفق:
 * 1. Parse URL params
 * 2. Handle specific type (recovery, email_change, magiclink, signup)
 * 3. For OAuth (Google/Facebook): wait for session → detect role → redirect
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('جاري معالجة طلب المصادقة...');
  const [error, setError] = useState<string | null>(null);

  const redirectByRole = async (userId: string, userEmail?: string) => {
    try {
      setMessage('جاري تحديد صلاحياتك...');
      const roleInfo = await detectUserRole(userId, userEmail);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: roleInfo.isNewUser ? "مرحباً بك! يرجى اختيار نوع حسابك" : "مرحباً بك في UberFix",
      });
      
      navigate(roleInfo.redirectPath, { replace: true });
    } catch {
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = (hashParams.get('type') || queryParams.get('type')) as AuthType;
        const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash');
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code');

        // Handle errors
        if (errorParam) {
          let errorMsg = decodeURIComponent(errorDescription || errorParam);
          if (errorParam === 'access_denied' || errorCode === 'otp_expired') {
            errorMsg = 'انتهت صلاحية الرابط. يرجى طلب رابط جديد.';
          }
          if (isMounted) setError(errorMsg);
          return;
        }

        // Recovery (password reset)
        if (type === 'recovery') {
          if (isMounted) setMessage('جاري تحضير صفحة إعادة تعيين كلمة المرور...');
          if (tokenHash) {
            const { data, error: e } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
            if (e) { if (isMounted) setError(e.message); return; }
            if (data?.session) { navigate('/auth/update-password', { replace: true }); return; }
          }
          if (accessToken && refreshToken) {
            const { error: e } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            if (e) { if (isMounted) setError('فشل في تفعيل الجلسة.'); return; }
            navigate('/auth/update-password', { replace: true });
            return;
          }
          if (isMounted) setError('رابط إعادة تعيين كلمة المرور غير صالح.');
          return;
        }

        // Email change
        if (type === 'email_change') {
          navigate(`/auth/verify-email-change${window.location.hash}${window.location.search}`, { replace: true });
          return;
        }

        // Magic link
        if (type === 'magiclink') {
          navigate(`/auth/magic${window.location.hash}${window.location.search}`, { replace: true });
          return;
        }

        // Email confirmation (signup)
        if (tokenHash && (type === 'signup' || type === 'email')) {
          if (isMounted) setMessage('جاري تأكيد البريد الإلكتروني...');
          const { data, error: e } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type === 'signup' ? 'signup' : 'email',
          });
          if (e) { if (isMounted) setError(e.message); return; }
          if (data?.session?.user) {
            await redirectByRole(data.session.user.id, data.session.user.email);
            return;
          }
        }

        // OAuth callback (Google, Facebook) - tokens in URL
        if (accessToken && refreshToken) {
          if (isMounted) setMessage('جاري تسجيل الدخول...');
          const { data, error: e } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (e) { if (isMounted) setError('فشل في تسجيل الدخول. حاول مرة أخرى.'); return; }
          if (data?.session?.user) {
            await redirectByRole(data.session.user.id, data.session.user.email);
            return;
          }
        }

        // No tokens in URL - wait for PKCE/onAuthStateChange to establish session
        if (isMounted) setMessage('جاري التحقق من الجلسة...');
        
        // Use onAuthStateChange listener instead of polling
        const waitForSession = (): Promise<void> => {
          return new Promise((resolve) => {
            // Check immediately first
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session?.user && isMounted) {
                redirectByRole(session.user.id, session.user.email).then(resolve);
                return;
              }
              
              // Listen for session changes (PKCE flow completes async)
              const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                if (!isMounted) { subscription.unsubscribe(); resolve(); return; }
                if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
                  subscription.unsubscribe();
                  redirectByRole(session.user.id, session.user.email).then(resolve);
                }
              });
              
              // Timeout after 8 seconds
              setTimeout(() => {
                subscription.unsubscribe();
                if (isMounted) setError('لم يتم العثور على معلومات المصادقة. يرجى المحاولة مرة أخرى.');
                resolve();
              }, 8000);
            });
          });
        };

        await waitForSession();
      } catch (err) {
        console.error('Auth callback error:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'حدث خطأ أثناء المصادقة');
      }
    };

    handleCallback();

    return () => { isMounted = false; };
  }, [navigate, toast]);

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
            <Button onClick={() => navigate('/login')} variant="default">
              الذهاب لتسجيل الدخول
            </Button>
            <Button onClick={() => navigate('/forgot-password')} variant="outline">
              طلب رابط جديد
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
