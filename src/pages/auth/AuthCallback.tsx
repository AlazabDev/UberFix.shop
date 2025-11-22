import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // محاولة الحصول على session من URL (hash أو query params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Supabase يرسل tokens في hash أو query params
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');
        const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash');

        // إذا كان هناك token_hash (لروابط التأكيد)
        if (tokenHash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });

          if (error) {
            console.error('Error verifying OTP:', error);
            toast({
              variant: "destructive",
              title: "خطأ في التحقق",
              description: "فشل التحقق من البريد الإلكتروني. الرجاء المحاولة مرة أخرى.",
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

        // إذا كانت هناك tokens مباشرة
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              variant: "destructive",
              title: "خطأ في المصادقة",
              description: error.message,
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

        // إذا لم يتم العثور على أي معلومات مصادقة
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
          description: "حدث خطأ أثناء معالجة طلب المصادقة",
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">جاري معالجة طلب المصادقة...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
