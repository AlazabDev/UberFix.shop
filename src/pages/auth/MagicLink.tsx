import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, CheckCircle, XCircle, Cog } from "lucide-react";

export default function MagicLink() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash');
        const type = hashParams.get('type') || queryParams.get('type');
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

        // Handle magic link token
        if (tokenHash && type === 'magiclink') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'magiclink',
          });

          if (error) {
            throw error;
          }

          if (data?.session) {
            setStatus('success');
            toast({
              title: "تم تسجيل الدخول",
              description: "مرحباً بك في UberFix",
            });
            setTimeout(() => navigate('/dashboard'), 1500);
            return;
          }
        }

        // Handle direct token exchange
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          setStatus('success');
          toast({
            title: "تم تسجيل الدخول",
            description: "مرحباً بك في UberFix",
          });
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }

        // No tokens - show error
        throw new Error('رابط الدخول غير صالح أو منتهي الصلاحية');

      } catch (error) {
        console.error('Magic link error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
        toast({
          variant: "destructive",
          title: "فشل تسجيل الدخول",
          description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        });
      }
    };

    handleMagicLink();
  }, [navigate, toast]);

  const requestNewMagicLink = async () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <div className="relative">
                <span className="text-primary-foreground font-bold text-2xl">A</span>
                <Cog className="absolute -top-1 -right-1 h-4 w-4 text-primary-foreground/80 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">UberFix.shop</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                status === 'loading' ? 'bg-primary/10' :
                status === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {status === 'loading' && <Loader2 className="h-8 w-8 text-primary animate-spin" />}
                {status === 'success' && <CheckCircle className="h-8 w-8 text-green-500" />}
                {status === 'error' && <XCircle className="h-8 w-8 text-red-500" />}
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              {status === 'loading' && "جاري تسجيل الدخول..."}
              {status === 'success' && "تم تسجيل الدخول"}
              {status === 'error' && "الرابط غير صالح"}
            </CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' && "يرجى الانتظار أثناء التحقق من الرابط السحري"}
              {status === 'success' && "مرحباً بك! جاري التوجيه للوحة التحكم..."}
              {status === 'error' && errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'error' && (
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={requestNewMagicLink}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  طلب رابط جديد
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  تسجيل الدخول بكلمة المرور
                </Button>
              </div>
            )}
            {status === 'success' && (
              <div className="text-center">
                <Wand2 className="h-12 w-12 mx-auto text-primary mb-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
