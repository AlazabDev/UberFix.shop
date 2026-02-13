
---

# 🔴 تقرير المشاكل وحلولها: نظام المصادقة

## 🚨 المشاكل الرئيسية المكتشفة

### **المشكلة 1️⃣: فيسبوك لا يتجه إلى الداشبورد بعد المصادقة**

#### الأسباب:
```typescript name=Problem Analysis
// ❌ المشكلة 1: Facebook SDK منفصل عن Supabase
- Facebook يعطي بيانات محلية فقط (localStorage)
- لا يوجد جلسة Supabase مقابلة
- AuthContext لا يعرف عن تسجيل الدخول

// ❌ المشكلة 2: المحاولة الفاشلة للحصول على جلسة Supabase
// في src/pages/auth/Login.tsx (سطر 134-148)
const { data: { session } } = await supabase.auth.getSession();
// النتيجة: session = null → لا يتم استدعاء handleSuccessfulAuth

// ❌ المشكلة 3: Facebook sync غير موثوق
// في LoginForm.tsx (سطر 120-140)
// محاولة fetch للـ facebook-auth-sync لكن:
// - الـ endpoint قد لا يكون موجود
// - المحاولة "non-blocking" → تتم بعد navigate!
```

#### رسم توضيحي للمشكلة:
```
Facebook Login ✓
    ↓
Facebook Data (Local) ✓
    ↓
storeFacebookSession() ✓
    ↓
Try: Get Supabase Session ← ❌ FAILS (session = null)
    ↓
No redirect → Stuck on Login page
    ↓
User sees nothing ❌
```

---

### **المشكلة 2️⃣: المصادقة العادية (Email/Password) بطيئة وتتأخر**

#### الأسباب:

```typescript name=Normal Auth Issues
// ❌ المشكلة 1: Race Condition في AuthContext
// src/contexts/AuthContext.tsx
useEffect(() => {
  // 1️⃣ Setup listener (async)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
  
  // 2️⃣ Get existing session (parallel - race condition!)
  const initializeAuth = async () => {
    await supabase.auth.getSession()
  }
  initializeAuth();
})
// المشكلة: استدعاء getSession قبل انتهاء listener التثبيت

// ❌ المشكلة 2: تأخير متعمد غير ضروري
// src/pages/auth/Login.tsx (سطر 56-63)
setTimeout(() => {
  navigate(roleInfo.redirectPath, { replace: true });
}, 100);
// هذا التأخير يسبب:
// - تأخر الملاحظة (100ms)
// - قد يكون أكثر في الاتصالات البطيئة

// ❌ المشكلة 3: استدعاء detectUserRole مرتين
// 1. في handleSuccessfulAuth
// 2. في useEffect لـ AuthContext update
// قاعدة البيانات تُستدعى مرتين ❌

// ❌ المشكلة 4: معالجة الأخطاء غير كاملة
const roleInfo = await detectUserRole(userId, userEmail)
  .catch(() => navigate('/dashboard'))
// إذا فشل detectUserRole، الخطأ يُتجاهل فقط
```

#### رسم توضيحي للمشكلة:
```
Email/Password Login
    ↓
Check Credentials ✓
    ↓
Session Created ✓
    ↓
AuthContext Listener Notified ✓
    ↓
handleSuccessfulAuth Called
    ↓
detectUserRole DB Query ⏳ (Slow)
    ↓
setTimeout 100ms ⏳ (Wait)
    ↓
Navigate ✓ (BUT DELAYED)
    ↓
User sees delay/lag ⏳
```

---

## ✅ الحلول الشاملة

### **الحل 1️⃣: إصلاح Facebook Authentication Redirect**

#### ملف 1: `src/lib/facebookAuth.ts`

```typescript name=src/lib/facebookAuth.ts
// ✅ إضافة دالة جديدة لـ Supabase Sync
/**
 * Sync Facebook user with Supabase
 * Creates or updates user in Supabase database
 */
export async function syncFacebookUserWithSupabase(
  facebookId: string,
  email: string | undefined,
  name: string,
  pictureUrl: string | undefined,
  accessToken: string
): Promise<{ sessionToken?: string; error?: string }> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/facebook-auth-sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          facebookId,
          email: email || `fb_${facebookId}@uberfix.app`,
          name,
          pictureUrl,
          accessToken,
          provider: 'facebook',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { error: error.message || 'Failed to sync with Supabase' };
    }

    const data = await response.json();
    return { sessionToken: data.sessionToken };
  } catch (error) {
    console.error('Facebook sync error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ✅ تحديث دالة لتخزين بيانات الجلسة
export interface FacebookSessionData {
  user: FacebookUserData;
  accessToken: string;
  supabaseSessionToken?: string;
  loginTime: number;
}

export function storeFacebookSession(
  user: FacebookUserData,
  accessToken: string,
  supabaseSessionToken?: string
): void {
  try {
    const sessionData: FacebookSessionData = {
      user,
      accessToken,
      supabaseSessionToken,
      loginTime: Date.now(),
    };
    localStorage.setItem('facebook_session', JSON.stringify(sessionData));
    console.log('Facebook session stored');
  } catch (e) {
    console.warn('Failed to store Facebook session:', e);
  }
}

export function getStoredFacebookSession(): FacebookSessionData | null {
  try {
    const stored = localStorage.getItem('facebook_session');
    if (stored) {
      const data = JSON.parse(stored) as FacebookSessionData;
      // Check if session is not too old (7 days)
      if (Date.now() - data.loginTime < 7 * 24 * 60 * 60 * 1000) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Failed to get Facebook session:', e);
  }
  return null;
}
```

#### ملف 2: `src/hooks/useFacebookAuth.ts`

```typescript name=src/hooks/useFacebookAuth.ts
import { syncFacebookUserWithSupabase } from '@/lib/facebookAuth';

export function useFacebookAuth(): UseFacebookAuthReturn {
  const [user, setUser] = useState<FacebookUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (): Promise<FacebookAuthResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginWithFacebook('email,public_profile');
      
      if (result.success && result.user && result.accessToken) {
        // ✅ NEW: Sync immediately with Supabase
        const syncResult = await syncFacebookUserWithSupabase(
          result.user.id,
          result.user.email,
          result.user.name,
          result.user.picture?.data?.url,
          result.accessToken
        );

        if (syncResult.error) {
          console.warn('Supabase sync warning:', syncResult.error);
          // لا نفشل هنا، نكمل مع Facebook فقط
        }

        setUser(result.user);
        setIsLoggedIn(true);
        storeFacebookSession(
          result.user, 
          result.accessToken,
          syncResult.sessionToken // ✅ Store Supabase token if available
        );

        // ✅ Return success immediately
        return { success: true, user: result.user, accessToken: result.accessToken };
      } else {
        setError(result.error || 'فشل تسجيل الدخول');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isLoggedIn,
    error,
    login,
    logout,
    checkLoginStatus,
  };
}
```

#### ملف 3: `src/pages/auth/Login.tsx`

```typescript name=src/pages/auth/Login.tsx
const handleFacebookLogin = async () => {
  try {
    const result = await facebookLogin();
    
    if (result.success && result.user) {
      // ✅ Check if we have a Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // ✅ We have both FB and Supabase session
        await handleSuccessfulAuth(session.user.id, session.user.email);
      } else {
        // ✅ Only FB session - show message and redirect
        toast({
          title: "تم تسجيل الدخول",
          description: `مرحباً ${result.user.name}`,
        });
        
        // ✅ Use AuthContext to detect role with fallback
        const storedSession = getStoredFacebookSession();
        if (storedSession?.supabaseSessionToken) {
          // ✅ We have Supabase token, detect role
          try {
            const roleInfo = await detectUserRole(
              result.user.id,
              result.user.email
            );
            navigate(roleInfo.redirectPath, { replace: true });
          } catch (error) {
            console.warn('Role detection failed:', error);
            navigate('/dashboard', { replace: true });
          }
        } else {
          // ✅ No Supabase integration, just go to dashboard
          navigate('/dashboard', { replace: true });
        }
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
```

---

### **الحل 2️⃣: إصلاح تأخير المصادقة العادية**

#### ملف 1: `src/contexts/AuthContext.tsx`

```typescript name=src/contexts/AuthContext.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapSupabaseSession = useCallback((s: Session): AuthUser => ({
    id: s.user.id,
    email: s.user.email,
    name: s.user.user_metadata?.full_name || s.user.email,
    avatarUrl: s.user.user_metadata?.avatar_url,
    provider: 'supabase',
    supabaseUser: s.user,
    emailConfirmed: !!s.user.email_confirmed_at,
  }), []);

  const mapFacebookUser = useCallback((fb: FacebookUserData): AuthUser => ({
    id: fb.id,
    email: fb.email,
    name: fb.name,
    avatarUrl: fb.picture?.data?.url,
    provider: 'facebook',
    facebookUser: fb,
    emailConfirmed: true,
  }), []);

  // ✅ FIX: Initialize auth properly
  useEffect(() => {
    let isMounted = true;

    // ✅ Step 1: Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;

        console.log('[Auth] Event:', event);

        if (newSession?.user) {
          setSession(newSession);
          setUser(mapSupabaseSession(newSession));
          // ✅ Important: Set isLoading to false immediately
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          const fbSession = getStoredFacebookSession();
          if (fbSession) {
            setUser(mapFacebookUser(fbSession.user));
          } else {
            setUser(null);
          }
          setSession(null);
          setIsLoading(false);
        }
      }
    );

    // ✅ Step 2: Fetch existing session after listener is set up
    const initializeAuth = async () => {
      try {
        // ✅ Wait for listener to be fully set up first
        await new Promise(resolve => setTimeout(resolve, 0));

        const { data: { session: currentSession }, error } = 
          await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('Session error:', error.message);
          if (error.message.includes('invalid') || error.message.includes('expired')) {
            await supabase.auth.signOut();
          }
          setIsLoading(false);
          return;
        }

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(mapSupabaseSession(currentSession));
          // ✅ User session exists, no need for Facebook check
          setIsLoading(false);
        } else {
          // ✅ No Supabase session, check Facebook
          const fbSession = getStoredFacebookSession();
          if (fbSession && isMounted) {
            setUser(mapFacebookUser(fbSession.user));
          }
          // ✅ Done loading regardless
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [mapSupabaseSession, mapFacebookUser]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    try { 
      localStorage.removeItem('facebook_session');
    } catch {}
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### ملف 2: `src/pages/auth/Login.tsx`

```typescript name=src/pages/auth/Login.tsx
// ✅ FIX: Remove unnecessary setTimeout
const handleSuccessfulAuth = async (userId: string, userEmail?: string) => {
  try {
    const roleInfo = await detectUserRole(userId, userEmail);
    
    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: "مرحباً بك في نظام إدارة الصيانة",
    });

    // ✅ Navigate immediately, no setTimeout
    navigate(roleInfo.redirectPath, { replace: true });
  } catch (error) {
    console.error('Role detection error:', error);
    // ✅ Fallback redirect
    navigate('/dashboard', { replace: true });
  }
};

// ✅ FIX: Use useEffect hook properly
useEffect(() => {
  if (!authLoading && user && !isLoading) {
    const from = (location.state as any)?.from;
    if (from && from !== '/login' && from !== '/register') {
      navigate(from, { replace: true });
    } else {
      // ✅ Detect role and redirect
      detectUserRole(user.id, user.email)
        .then(roleInfo => {
          navigate(roleInfo.redirectPath, { replace: true });
        })
        .catch(() => {
          navigate('/dashboard', { replace: true });
        });
    }
  }
}, [authLoading, user, navigate, location.state, isLoading]);

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
      // ✅ AuthContext will handle redirect via useEffect
      // No need to call handleSuccessfulAuth here
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "جاري التوجيه...",
      });
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
```

---

## 🔧 Edge Function للمزامنة

#### ملف: `supabase/functions/facebook-auth-sync/index.ts`

```typescript name=supabase/functions/facebook-auth-sync/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      facebookId,
      email,
      name,
      pictureUrl,
      accessToken,
      provider,
    } = body;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', facebookId)
      .maybeSingle();

    if (existingUser) {
      // ✅ Update existing user
      await supabase
        .from('profiles')
        .update({
          name,
          avatar_url: pictureUrl,
          provider,
          updated_at: new Date().toISOString(),
        })
        .eq('id', facebookId);
    } else {
      // ✅ Create new user
      await supabase
        .from('profiles')
        .insert({
          id: facebookId,
          email,
          name,
          avatar_url: pictureUrl,
          provider,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User synced successfully',
        userId: facebookId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Facebook sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

---

## 📋 قائمة التحقق من التنفيذ

```checklist
✅ Authentication Issues Fix Checklist

Facebook Login Issues:
☐ تحديث facebookAuth.ts بـ syncFacebookUserWithSupabase
☐ تحديث useFacebookAuth.ts مع Supabase sync
☐ تحديث Login.tsx handleFacebookLogin
☐ إنشاء facebook-auth-sync Edge Function
☐ تجربة Facebook login والتحقق من الدخول إلى dashboard

Email/Password Performance Issues:
☐ تحديث AuthContext.tsx بـ proper initialization
☐ إزالة setTimeout من handleSuccessfulAuth
☐ تحديث Login.tsx handleLogin
☐ إزالة استدعاءات detectUserRole المكررة
☐ تجربة Email/Password login والتحقق من السرعة

Testing:
☐ اختبار Facebook login من /login
☐ اختبار Email/Password login
☐ اختبار Google OAuth
☐ اختبار Phone OTP
☐ اختبار Logout functionality
☐ اختبار Session persistence
☐ اختبار Edge cases (expired tokens, etc)

Performance:
☐ قياس وقت الدخول قبل وبعد
☐ التحقق من عدم وجود race conditions
☐ مراقبة console.logs للأخطاء
```

---

## 🎯 الفوائد المتوقعة

| المشكلة | الحل | الفائدة |
|--------|------|--------|
| Facebook redirect fail | Supabase sync | ✅ التوجيه الفوري |
| Slow email login | Remove setTimeout | ✅ أسرع بـ 100ms+ |
| Double DB queries | Single detection | ✅ تقليل الحمل 50% |
| Race conditions | Proper listener | ✅ Stability محسّن |
| Session issues | Better storage | ✅ Consistency محسّنة |

---

**by Mohamed Azab؟** 🚀
