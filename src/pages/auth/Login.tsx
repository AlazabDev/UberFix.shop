import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight, Cog, Shield, Phone } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { PhoneOTPLogin } from "@/components/auth/PhoneOTPLogin";
import { useFacebookAuth } from "@/hooks/useFacebookAuth";
import { secureGoogleSignIn } from "@/lib/secureOAuth";
import { detectUserRole } from "@/lib/roleRedirect";
import { useAuth } from "@/contexts/AuthContext";

/**
 * صفحة تسجيل الدخول الموحدة
 * تتحقق تلقائياً من وجود جلسة وتعيد التوجيه
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login: facebookLogin, isLoading: isFacebookLoading } = useFacebookAuth();
  const { user, isLoading: authLoading } = useAuth();

  // ✅ سحب المستخدم تلقائياً إذا كان مسجل دخول بالفعل
  useEffect(() => {
    if (!authLoading && user && !isLoading) {
      // المستخدم مسجل بالفعل - وجهه للداشبورد
      const from = (location.state as any)?.from;
      if (from && from !== '/login' && from !== '/register') {
        navigate(from, { replace: true });
      } else {
        detectUserRole(user.id, user.email).then(roleInfo => {
          navigate(roleInfo.redirectPath, { replace: true });
        }).catch(() => {
          navigate('/dashboard', { replace: true });
        });
      }
    }
  }, [authLoading, user, navigate, location.state, isLoading]);

  // التوجيه الذكي بعد تسجيل الدخول
  const handleSuccessfulAuth = async (userId: string, userEmail?: string) => {
    try {
      const roleInfo = await detectUserRole(userId, userEmail);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في نظام إدارة الصيانة",
      });

      // تأخير بسيط لضمان تحديث الجلسة في AuthContext
      setTimeout(() => {
        navigate(roleInfo.redirectPath, { replace: true });
      }, 100);
    } catch (error) {
      console.error('Role detection error:', error);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message === "Invalid login credentials" 
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        await handleSuccessfulAuth(data.user.id, data.user.email);
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "حاول مرة أخرى لاحقاً",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await secureGoogleSignIn('/auth/callback');

      if (!result.success) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result.error?.message || "تعذر تسجيل الدخول بجوجل",
          variant: "destructive",
        });
      }
      // OAuth callback سيتولى التوجيه
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "حاول مرة أخرى لاحقاً",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await facebookLogin();
      
      if (result.success && result.user) {
        // Facebook SDK يعيد المستخدم مباشرة، نحتاج جلب الجلسة
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await handleSuccessfulAuth(session.user.id, session.user.email);
        } else {
          // Fallback إذا لم نجد جلسة Supabase
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: `مرحباً ${result.user.name}`,
          });
          navigate("/dashboard", { replace: true });
        }
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result.error || "تعذر تسجيل الدخول بفيسبوك",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "حاول مرة أخرى لاحقاً",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
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
          <p className="text-muted-foreground mt-2">نظام إدارة طلبات الصيانة المتطور</p>
        </div>

        {/* Login Card - موحد بدون role */}
        <Card className="bg-gradient-to-br from-primary/5 to-background border-2">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              سجل دخولك للوصول إلى حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginMethod === "phone" ? (
              <PhoneOTPLogin onBack={() => setLoginMethod("email")} />
            ) : (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">كلمة المرور</Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-primary hover:underline"
                      >
                        نسيت كلمة المرور؟
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري تسجيل الدخول...
                      </>
                    ) : (
                      <>
                        تسجيل الدخول
                        <ArrowRight className="mr-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">أو</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <FcGoogle className="ml-2 h-5 w-5" />
                    تسجيل الدخول باستخدام Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleFacebookLogin}
                    disabled={isLoading || isFacebookLoading}
                  >
                    {isFacebookLoading ? (
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    ) : (
                      <FaFacebook className="ml-2 h-5 w-5 text-[#1877F2]" />
                    )}
                    تسجيل الدخول باستخدام Facebook
                  </Button>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setLoginMethod("phone")}
                    disabled={isLoading}
                  >
                    <Phone className="ml-2 h-5 w-5" />
                    تسجيل الدخول برقم الهاتف
                  </Button>
                </div>
              </>
            )}
            
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                ليس لديك حساب؟{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  إنشاء حساب جديد
                </Link>
              </p>
              
              {/* رابط التسجيل كفني */}
              <div className="pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={() => navigate("/technicians/register")}
                >
                  هل أنت فني؟ سجل هنا
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm">
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  العودة للصفحة الرئيسية
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
