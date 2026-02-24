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
  const [processed, setProcessed] = useState(false);

  const redirectByRole = async (userId: string, userEmail?: string) => {
    try {
      setMessage('جاري تحديد صلاحياتك...');
      const roleInfo = await detectUserRole(userId, userEmail);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: roleInfo.isNewUser ? "مرحباً بك! يرجى اختيار نوع حسابك" : "مرحباً بك في UberFix",
      });
      
      // تأخير بسيط للتأكد من تخزين الجلسة
      setTimeout(() => {
        navigate(roleInfo.redirectPath, { replace: true });
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error in redirectByRole:', error);
      navigate('/dashboard', { replace: true });
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let subscription: { unsubscribe: () => void } | null = null;

    const handleCallback = async () => {
      // منع المعالجة المكررة
      if (processed) return;
      
      try {
        // قراءة الباراميترات من URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = (hashParams.get('type') || queryParams.get('type')) as AuthType;
        const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash');
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code');

        console.log('🔍 Auth Callback Params:', { 
          type, 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasTokenHash: !!tokenHash,
          error: errorParam
        });

        // Handle errors
        if (errorParam) {
          let errorMsg = decodeURIComponent(errorDescription || errorParam);
          if (errorParam === 'access_denied' || errorCode === 'otp_expired') {
            errorMsg = 'انتهت صلاحية الرابط. يرجى طلب رابط جديد.';
          }
          if (isMounted) {
            setError(errorMsg);
            setProcessed(true);
          }
          return;
        }

        // ✅ 1. OAuth callback (Google, Facebook) - أولوية قصوى
        if (accessToken && refreshToken) {
          setMessage('جاري تسجيل الدخول باستخدام OAuth...');
          console.log('🔄 Setting OAuth session...');
          
          const { data, error: e } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (e) {
            console.error('❌ OAuth setSession error:', e);
            if (isMounted) {
              setError('فشل في تسجيل الدخول. حاول مرة أخرى.');
              setProcessed(true);
            }
            return;
          }
          
          if (data?.session?.user) {
            console.log('✅ OAuth session set successfully for user:', data.session.user.id);
            setProcessed(true);
            await redirectByRole(data.session.user.id, data.session.user.email);
            return;
          }
        }

        // ✅ 2. Recovery (password reset)
        if (type === 'recovery') {
          if (isMounted) setMessage('جاري تحضير صفحة إعادة تعيين كلمة المرور...');
          
          if (tokenHash) {
            const { data, error: e } = await supabase.auth.verifyOtp({ 
              token_hash: tokenHash, 
              type: 'recovery' 
            });
            if (e) { 
              if (isMounted) setError(e.message); 
              setProcessed(true);
              return; 
            }
            if (data?.session) { 
              setProcessed(true);
              navigate('/auth/update-password', { replace: true }); 
              return; 
            }
          }
          
          if (accessToken && refreshToken) {
            const { error: e } = await supabase.auth.setSession({ 
              access_token: accessToken, 
              refresh_token: refreshToken 
            });
            if (e) { 
              if (isMounted) setError('فشل في تفعيل الجلسة.'); 
              setProcessed(true);
              return; 
            }
            setProcessed(true);
            navigate('/auth/update-password', { replace: true });
            return;
          }
          
          if (isMounted) setError('رابط إعادة تعيين كلمة المرور غير صالح.');
          setProcessed(true);
          return;
        }

        // ✅ 3. Email change
        if (type === 'email_change') {
          setProcessed(true);
          navigate(`/auth/verify-email-change${window.location.hash}${window.location.search}`, { replace: true });
          return;
        }

        // ✅ 4. Magic link
        if (type === 'magiclink') {
          setProcessed(true);
          navigate(`/auth/magic${window.location.hash}${window.location.search}`, { replace: true });
          return;
        }

        // ✅ 5. Email confirmation (signup)
        if (tokenHash && (type === 'signup' || type === 'email')) {
          if (isMounted) setMessage('جاري تأكيد البريد الإلكتروني...');
          
          const { data, error: e } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type === 'signup' ? 'signup' : 'email',
          });
          
          if (e) { 
            if (isMounted) setError(e.message); 
            setProcessed(true);
            return; 
          }
          
          if (data?.session?.user) {
            setProcessed(true);
            await redirectByRole(data.session.user.id, data.session.user.email);
            return;
          }
        }

        // ✅ 6. No tokens in URL - wait for PKCE/onAuthStateChange
        setMessage('جاري التحقق من الجلسة...');
        console.log('🔄 No tokens in URL, waiting for session...');

        // التحقق المبدئي من الجلسة
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession?.user) {
          console.log('✅ Found existing session:', initialSession.user.id);
          setProcessed(true);
          await redirectByRole(initialSession.user.id, initialSession.user.email);
          return;
        }

        // انتظار الجلسة عبر onAuthStateChange
        await new Promise<void>((resolve) => {
          // Set timeout for session establishment
          timeoutId = setTimeout(() => {
            if (isMounted) {
              console.log('⏰ Session timeout reached');
              setError('لم يتم العثور على معلومات المصادقة. يرجى المحاولة مرة أخرى.');
              setProcessed(true);
            }
            if (subscription) subscription.unsubscribe();
            resolve();
          }, 10000); // 10 seconds timeout

          // Listen for auth state changes
          const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('📡 Auth state changed:', event, session?.user?.id);
            
            if (!isMounted) {
              if (subscription) subscription.unsubscribe();
              clearTimeout(timeoutId);
              resolve();
              return;
            }
            
            if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
              console.log('✅ Session established via event:', event);
              clearTimeout(timeoutId);
              if (subscription) subscription.unsubscribe();
              setProcessed(true);
              redirectByRole(session.user.id, session.user.email).then(() => resolve());
            }
          });
          
          subscription = sub;
        });

      } catch (err) {
        console.error('❌ Auth callback error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'حدث خطأ أثناء المصادقة');
          setProcessed(true);
        }
      }
    };

    handleCallback();

    return () => { 
      isMounted = false; 
      if (timeoutId) clearTimeout(timeoutId);
      if (subscription) subscription.unsubscribe();
    };
  }, [navigate, toast, processed]);

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
