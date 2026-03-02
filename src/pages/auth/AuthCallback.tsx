import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { detectUserRole } from '@/lib/roleRedirect';

/**
 * OAuth Callback Handler
 * 
 * التدفق المبسط:
 * 1. Supabase client يعالج tokens من URL تلقائياً
 * 2. AuthContext يستقبل الجلسة عبر onAuthStateChange
 * 3. نحن فقط ننتظر AuthContext.user ثم نوجه حسب الدور
 * 
 * الحالات الخاصة (recovery, email_change, magiclink, signup):
 * - تُعالج يدوياً قبل الانتظار
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [message, setMessage] = useState('جاري معالجة طلب المصادقة...');
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);
  const specialHandledRef = useRef(false);

  // ✅ Step 1: Handle special auth types (recovery, email_change, etc.)
  useEffect(() => {
    if (specialHandledRef.current) return;

    const handleSpecialTypes = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      const type = hashParams.get('type') || queryParams.get('type');
      const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash');
      const errorParam = hashParams.get('error') || queryParams.get('error');
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
      const errorCode = hashParams.get('error_code') || queryParams.get('error_code');

      console.log('🔍 Auth Callback:', { type, hasTokenHash: !!tokenHash, error: errorParam });

      // Handle errors from OAuth provider
      if (errorParam) {
        specialHandledRef.current = true;
        let errorMsg = decodeURIComponent(errorDescription || errorParam);
        if (errorParam === 'access_denied' || errorCode === 'otp_expired') {
          errorMsg = 'انتهت صلاحية الرابط. يرجى طلب رابط جديد.';
        }
        setError(errorMsg);
        return;
      }

      // Recovery (password reset)
      if (type === 'recovery') {
        specialHandledRef.current = true;
        setMessage('جاري تحضير صفحة إعادة تعيين كلمة المرور...');

        if (tokenHash) {
          const { data, error: e } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });
          if (e) { setError(e.message); return; }
          if (data?.session) { navigate('/auth/update-password', { replace: true }); return; }
        }

        // Fallback: let Supabase auto-detect handle it, wait for session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) { navigate('/auth/update-password', { replace: true }); return; }

        setError('رابط إعادة تعيين كلمة المرور غير صالح.');
        return;
      }

      // Email change
      if (type === 'email_change') {
        specialHandledRef.current = true;
        navigate(`/auth/verify-email-change${window.location.hash}${window.location.search}`, { replace: true });
        return;
      }

      // Magic link
      if (type === 'magiclink') {
        specialHandledRef.current = true;
        navigate(`/auth/magic${window.location.hash}${window.location.search}`, { replace: true });
        return;
      }

      // Email confirmation (signup)
      if (tokenHash && (type === 'signup' || type === 'email')) {
        specialHandledRef.current = true;
        setMessage('جاري تأكيد البريد الإلكتروني...');

        const { data, error: e } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type === 'signup' ? 'signup' : 'email',
        });

        if (e) { setError(e.message); return; }
        // Session will be picked up by AuthContext → Step 2 handles redirect
        return;
      }

      // OAuth flow (Google/Facebook) - tokens in URL are auto-processed by Supabase client
      // No special handling needed, Step 2 will handle redirect when AuthContext gets the user
    };

    handleSpecialTypes().catch((err) => {
      console.error('❌ Auth callback error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء المصادقة');
    });
  }, [navigate]);

  // ✅ Step 2: When AuthContext has a user, redirect by role
  useEffect(() => {
    if (handledRef.current || authLoading || !user) return;
    handledRef.current = true;

    setMessage('جاري تحديد صلاحياتك...');

    detectUserRole(user.id, user.email)
      .then((roleInfo) => {
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: roleInfo.isNewUser
            ? 'مرحباً بك! يرجى اختيار نوع حسابك'
            : 'مرحباً بك في UberFix',
        });
        navigate(roleInfo.redirectPath, { replace: true });
      })
      .catch(() => {
        navigate('/dashboard', { replace: true });
      });
  }, [authLoading, user, navigate, toast]);

  // ✅ Step 3: Timeout - if no user after 15 seconds, show error
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!handledRef.current && !specialHandledRef.current) {
        setError('لم يتم العثور على معلومات المصادقة. يرجى المحاولة مرة أخرى.');
      }
    }, 15000);
    return () => clearTimeout(timeout);
  }, []);

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
