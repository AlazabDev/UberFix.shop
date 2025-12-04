import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Mail, Cog } from "lucide-react";

export default function VerifyEmailChange() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmailChange = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const tokenHash = hashParams.get('token_hash') || queryParams.get('token_hash');
        const type = hashParams.get('type') || queryParams.get('type');
        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

        // Handle token_hash verification
        if (tokenHash && type === 'email_change') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email_change',
          });

          if (error) {
            throw error;
          }

          if (data?.session) {
            setStatus('success');
            toast({
              title: "تم تغيير البريد الإلكتروني",
              description: "تم تحديث بريدك الإلكتروني بنجاح",
            });
            setTimeout(() => navigate('/dashboard'), 2000);
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
            title: "تم تغيير البريد الإلكتروني",
            description: "تم تحديث بريدك الإلكتروني بنجاح",
          });
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        // No valid tokens found
        throw new Error('لم يتم العثور على رمز تحقق صالح');

      } catch (error) {
        console.error('Email change verification error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
        toast({
          variant: "destructive",
          title: "فشل التحقق",
          description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
        });
      }
    };

    verifyEmailChange();
  }, [navigate, toast]);

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
              {status === 'loading' && "جاري التحقق..."}
              {status === 'success' && "تم التحقق بنجاح"}
              {status === 'error' && "فشل التحقق"}
            </CardTitle>
            <CardDescription className="text-center">
              {status === 'loading' && "يرجى الانتظار أثناء التحقق من تغيير البريد الإلكتروني"}
              {status === 'success' && "تم تحديث بريدك الإلكتروني بنجاح، جاري التوجيه..."}
              {status === 'error' && errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'error' && (
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/dashboard')}
                >
                  الذهاب للوحة التحكم
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  تسجيل الدخول
                </Button>
              </div>
            )}
            {status === 'success' && (
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">سيتم توجيهك تلقائياً...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
