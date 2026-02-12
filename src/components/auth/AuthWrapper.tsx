import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * AuthWrapper - حارس المسارات المحمية
 * يستخدم AuthContext المركزي بدلاً من إدارة حالة منفصلة
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // تحويل المستخدم غير المصادق إلى صفحة تسجيل الدخول
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isLoading, user, navigate, location.pathname]);

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم مسجل عبر Supabase لكن البريد غير مؤكد
  if (user && user.provider === 'supabase' && !user.emailConfirmed) {
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

  // إذا لم يكن هناك مستخدم - show loading while redirecting
  if (!user) {
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
