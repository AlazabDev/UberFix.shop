import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, supabaseReady } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { getStoredFacebookSession, FacebookUserData } from '@/lib/facebookAuth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

// Unified auth user type
interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider: 'supabase' | 'facebook';
  supabaseUser?: User;
  facebookUser?: FacebookUserData;
  emailConfirmed?: boolean;
}

// المسارات التي لا تتطلب مصادقة
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/role-selection',
  '/forgot-password',
  '/auth/callback',
  '/auth/update-password',
  '/auth/verify-email-change',
  '/auth/reauth',
  '/auth/magic',
  '/about',
  '/privacy-policy',
  '/terms-of-service',
  '/services',
  '/gallery',
  '/faq',
  '/user-guide',
  '/blog',
  '/pwa-settings',
  '/quick-request',
  '/quick-request-from-map',
  '/track-orders',
  '/completed-services',
  '/whatsapp-status',
  '/technicians/register',
  '/technicians/registration/wizard',
  '/technicians/registration/thank-you',
  '/service-request',
];

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // التحقق مما إذا كان المسار الحالي عام
  const isPublicRoute = useCallback(() => {
    const path = location.pathname;
    // التحقق من المسارات العامة الثابتة
    if (PUBLIC_ROUTES.includes(path)) return true;
    // التحقق من المسارات الديناميكية
    if (path.startsWith('/qr/')) return true;
    if (path.startsWith('/quick-request/')) return true;
    if (path.startsWith('/track/')) return true;
    if (path.startsWith('/blog/')) return true;
    if (path.startsWith('/projects')) return true;
    if (path.startsWith('/service-request')) return true;
    return false;
  }, [location.pathname]);

  // CRITICAL: All hooks must be called BEFORE any early returns
  // This useEffect handles redirect for unauthenticated users
  // تحويل المستخدم غير المصادق إلى صفحة تسجيل الدخول الموحدة (ليس role-selection)
  useEffect(() => {
    if (!loading && !authUser && !isPublicRoute()) {
      navigate('/login', { replace: true });
    }
  }, [loading, authUser, isPublicRoute, navigate]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // Check Supabase session first
      if (supabaseReady) {
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (!isMounted) return;
          
          if (error) {
            console.error('خطأ في تحميل الجلسة:', error.message);
            if (error.message.includes('invalid') || error.message.includes('expired')) {
              await supabase.auth.signOut();
            }
          }
          
          if (currentSession?.user) {
            setSession(currentSession);
            setAuthUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              name: currentSession.user.user_metadata?.full_name || currentSession.user.email,
              avatarUrl: currentSession.user.user_metadata?.avatar_url,
              provider: 'supabase',
              supabaseUser: currentSession.user,
              emailConfirmed: !!currentSession.user.email_confirmed_at,
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('خطأ في تحميل الجلسة:', error);
        }
      }

      // If no Supabase session, check Facebook session
      const fbSession = getStoredFacebookSession();
      if (fbSession && isMounted) {
        setAuthUser({
          id: fbSession.user.id,
          email: fbSession.user.email,
          name: fbSession.user.name,
          avatarUrl: fbSession.user.picture?.data?.url,
          provider: 'facebook',
          facebookUser: fbSession.user,
          emailConfirmed: true, // Facebook users are always considered confirmed
        });
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for Supabase auth changes
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (supabaseReady) {
      const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (!isMounted) return;
        
        if (newSession?.user) {
          setSession(newSession);
          setAuthUser({
            id: newSession.user.id,
            email: newSession.user.email,
            name: newSession.user.user_metadata?.full_name || newSession.user.email,
            avatarUrl: newSession.user.user_metadata?.avatar_url,
            provider: 'supabase',
            supabaseUser: newSession.user,
            emailConfirmed: !!newSession.user.email_confirmed_at,
          });
        } else if (event === 'SIGNED_OUT') {
          // Check if there's still a Facebook session
          const fbSession = getStoredFacebookSession();
          if (fbSession) {
            setAuthUser({
              id: fbSession.user.id,
              email: fbSession.user.email,
              name: fbSession.user.name,
              avatarUrl: fbSession.user.picture?.data?.url,
              provider: 'facebook',
              facebookUser: fbSession.user,
              emailConfirmed: true,
            });
          } else {
            setAuthUser(null);
          }
          setSession(null);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // شاشة التحميل
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا كان Supabase غير جاهز وليس هناك جلسة Facebook
  if (!supabaseReady && !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <div className="space-y-3 max-w-md">
          <p className="text-lg font-semibold text-foreground">لا يمكن الاتصال بقاعدة البيانات</p>
          <p className="text-muted-foreground text-sm">
            يرجى المحاولة مرة أخرى لاحقاً.
          </p>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم مسجل عبر Supabase لكن البريد غير مؤكد
  if (authUser && authUser.provider === 'supabase' && !authUser.emailConfirmed && !isPublicRoute()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">تأكيد البريد الإلكتروني مطلوب</h2>
          <p className="text-muted-foreground">
            تم إرسال رسالة تأكيد إلى بريدك الإلكتروني <span className="font-semibold text-foreground">{authUser.email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            الرجاء التحقق من بريدك الإلكتروني والضغط على رابط التأكيد لإكمال عملية التسجيل.
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/login', { replace: true });
            }}
            className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم والمسار يتطلب مصادقة - show loading while redirecting
  if (!authUser && !isPublicRoute()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحويل...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
