import { supabase } from '@/integrations/supabase/client';

// استخدم الـ URL الأساسي للمشروع
const getOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://uberfiix.lovable.app';
};

// إعدادات محسنة للإنتاج - جميع عمليات المصادقة تذهب إلى /auth/callback
const getAuthConfig = () => {
  const origin = getOrigin();
  return {
    emailRedirectTo: `${origin}/auth/callback`,
    redirectTo: `${origin}/auth/callback`,
    updatePasswordRedirectTo: `${origin}/auth/callback?type=recovery`,
    emailChangeRedirectTo: `${origin}/auth/callback?type=email_change`,
    magicLinkRedirectTo: `${origin}/auth/callback?type=magiclink`,
  };
};

export interface SmartAuthResult {
  ok: boolean;
  mode: 'signup' | 'login' | 'confirm_resent' | 'reset_sent' | 'otp_sent' | 'error';
  data?: any;
  error?: any;
}

export async function smartSignup(
  email: string, 
  password?: string, 
  full_name?: string
): Promise<SmartAuthResult> {
  try {
    const authConfig = getAuthConfig();
    
    // التأكد من وجود كلمة مرور
    if (!password) {
      return { ok: false, mode: 'error', error: { message: 'كلمة المرور مطلوبة' } };
    }

    // 1) جرّب إنشاء حساب جديد
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name },
        emailRedirectTo: authConfig.emailRedirectTo
      }
    });

    if (!signUpErr) {
      return { ok: true, mode: 'signup', data: signUpData };
    }

    // 2) لو الإيميل مستخدم بالفعل
    const msg = (signUpErr.message || '').toLowerCase();
    const isDup =
      msg.includes('already been registered') ||
      msg.includes('user already registered') ||
      msg.includes('user already exists') ||
      msg.includes('already registered');

    if (isDup) {
      // 2.a لو عندك كلمة مرور، حاول تسجيل دخول مباشرة
      if (password) {
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (!loginErr) {
          return { ok: true, mode: 'login', data: loginData };
        }

        const em = (loginErr.message || '').toLowerCase();

        // 2.b الحساب غير مؤكَّد → أعد إرسال بريد التفعيل
        if (em.includes('email') && em.includes('confirm')) {
          await supabase.auth.resend({ 
            type: 'signup', 
            email,
            options: {
              emailRedirectTo: authConfig.emailRedirectTo
            }
          });
          return { ok: false, mode: 'confirm_resent' };
        }

        // 2.c كلمة المرور غير صحيحة → أرسل رابط إعادة التعيين
        if (em.includes('invalid login credentials')) {
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: authConfig.updatePasswordRedirectTo,
            captchaToken: undefined
          });
          return { ok: false, mode: 'reset_sent' };
        }
      }

      // 2.d بدون كلمة مرور؟ أرسل ماجيك لينك للدخول
      await supabase.auth.signInWithOtp({
        email,
        options: { 
          emailRedirectTo: authConfig.emailRedirectTo,
          shouldCreateUser: false // لا ننشئ مستخدم جديد عبر OTP
        }
      });
      return { ok: false, mode: 'otp_sent' };
    }

    // 3) أي خطأ آخر
    return { ok: false, mode: 'error', error: signUpErr };
    
  } catch (error) {
    return { ok: false, mode: 'error', error };
  }
}

export async function smartLogin(email: string, password: string): Promise<SmartAuthResult> {
  try {
    const authConfig = getAuthConfig();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      return { ok: true, mode: 'login', data };
    }
    const msg = (error.message || '').toLowerCase();
    
    // الحساب غير مؤكد
    if (msg.includes('email') && msg.includes('confirm')) {
      await supabase.auth.resend({ 
        type: 'signup', 
        email,
        options: {
          emailRedirectTo: authConfig.emailRedirectTo
        }
      });
      return { ok: false, mode: 'confirm_resent' };
    }

    // إرجاع خطأ كلمة المرور دون إرسال رابط إعادة التعيين تلقائياً
    return { ok: false, mode: 'error', error };
    
  } catch (error) {
    return { ok: false, mode: 'error', error };
  }
}
