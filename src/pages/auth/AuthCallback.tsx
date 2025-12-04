import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type AuthType = 'signup' | 'recovery' | 'magiclink' | 'email_change' | 'invite' | 'email' | null;

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [message, setMessage] = useState('جاري معالجة طلب المصادقة...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Get all possible tokens
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = (hashParams.get('type') || queryParams.get('type')) as AuthType;
        const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash');
        const error = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

        // Handle errors from Supabase
        if (error) {
          console.error('Auth error:', error, errorDescription);
          toast({
            variant: "destructive",
            title: "خطأ في المصادقة",
            description: decodeURIComponent(errorDescription || error),
          });
          navigate('/login');
          return;
        }

        // Route based on auth type
        if (type === 'recovery') {
          setMessage('جاري تحضير صفحة إعادة تعيين كلمة المرور...');
          
          if (tokenHash) {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery',
            });

            if (verifyError) {
              throw verifyError;
            }

            if (data?.session) {
              navigate('/auth/update-password');
              return;
            }
          }
          
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
            navigate('/auth/update-password');
            return;
          }
        }

        if (type === 'email_change') {
          setMessage('جاري التحقق من تغيير البريد الإلكتروني...');
          navigate(`/auth/verify-email-change${window.location.hash}${window.location.search}`);
          return;
        }

        if (type === 'magiclink') {
          setMessage('جاري تسجيل الدخول عبر الرابط السحري...');
          navigate(`/auth/magic${window.location.hash}${window.location.search}`);
          return;
        }

        // Handle signup confirmation
        if (tokenHash && (type === 'signup' || type === 'email')) {
          setMessage('جاري تأكيد البريد الإلكتروني...');
          
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type === 'signup' ? 'signup' : 'email',
          });

          if (verifyError) {
            console.error('Error verifying OTP:', verifyError);
            toast({
              variant: "destructive",
              title: "خطأ في التحقق",
              description: verifyError.message,
            });
            navigate('/login');
            return;
          }

          if (data?.session) {
            toast({
              title: "تم تأكيد البريد بنجاح",
              description: "مرحباً بك في UberFix",
            });
            navigate('/dashboard');
            return;
          }
        }

        // Handle direct token exchange (general case)
        if (accessToken && refreshToken) {
          setMessage('جاري تسجيل الدخول...');
          
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            toast({
              variant: "destructive",
              title: "خطأ في المصادقة",
              description: sessionError.message,
            });
            navigate('/login');
            return;
          }

          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في UberFix",
          });
          navigate('/dashboard');
          return;
        }

        // No valid auth parameters found
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "لم يتم العثور على معلومات المصادقة",
        });
        navigate('/login');
        
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error instanceof Error ? error.message : "حدث خطأ أثناء معالجة طلب المصادقة",
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

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
