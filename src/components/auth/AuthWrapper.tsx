import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setEmailConfirmed(!!currentUser?.email_confirmed_at);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUser = session?.user || null;
        setUser(newUser);
        setEmailConfirmed(!!newUser?.email_confirmed_at);
        setLoading(false);
        
        // التوجيه التلقائي لصفحة الداشبورد بعد نجاح تسجيل الدخول وتأكيد البريد
        if (event === 'SIGNED_IN' && newUser && newUser.email_confirmed_at) {
          navigate('/dashboard', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

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

  // إذا كان المستخدم مسجل لكن البريد غير مؤكد
  if (user && !emailConfirmed) {
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

  if (!user) {
    // توجيه المستخدم غير المسجل إلى صفحة اختيار الدور
    navigate('/role-selection', { replace: true });
    return null;
  }

  return <>{children}</>;
}
