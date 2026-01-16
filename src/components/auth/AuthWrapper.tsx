import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, supabaseReady } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthWrapperProps {
  children: React.ReactNode;
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
];

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
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
    return false;
  }, [location.pathname]);

  useEffect(() => {
    if (!supabaseReady) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // إعداد مستمع تغييرات المصادقة أولاً
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      
      // تحديث حالة الجلسة والمستخدم
      setSession(newSession);
      setUser(newSession?.user || null);
      setEmailConfirmed(!!newSession?.user?.email_confirmed_at);
      
      // معالجة تسجيل الخروج
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setEmailConfirmed(false);
      }
    });

    // ثم التحقق من الجلسة الحالية
    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession }, error }) => {
        if (!isMounted) return;
        
        if (error) {
          console.error('خطأ في تحميل الجلسة:', error.message);
          // إذا كانت الجلسة منتهية أو غير صالحة، قم بتسجيل الخروج
          if (error.message.includes('invalid') || error.message.includes('expired')) {
            supabase.auth.signOut();
          }
        }
        
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setEmailConfirmed(!!currentSession?.user?.email_confirmed_at);
        setLoading(false);
      })
      .catch(error => {
        console.error('خطأ في تحميل الجلسة:', error);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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

  // إذا كان Supabase غير جاهز
  if (!supabaseReady) {
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

  // إذا كان المستخدم مسجل لكن البريد غير مؤكد
  if (user && !emailConfirmed && !isPublicRoute()) {
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
            تم إرسال رسالة تأكيد إلى بريدك الإلكتروني <span className="font-semibold text-foreground">{user.email}</span>
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

  // إذا لم يكن هناك مستخدم والمسار يتطلب مصادقة
  // استخدام useEffect لتجنب مشاكل الـ render على الهواتف
  useEffect(() => {
    if (!user && !isPublicRoute()) {
      navigate('/role-selection', { replace: true });
    }
  }, [user, isPublicRoute, navigate]);

  if (!user && !isPublicRoute()) {
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
