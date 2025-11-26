import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppRole, useUserRoles } from '@/hooks/useUserRoles';
import { User } from '@supabase/supabase-js';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  redirectTo?: string;
}

/**
 * مكون لحماية الصفحات حسب الدور
 * يتحقق من أن المستخدم لديه أحد الأدوار المسموح بها للوصول للصفحة
 */
export function RoleGuard({ children, allowedRoles, redirectTo = '/dashboard' }: RoleGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { roles, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // التحقق من المستخدم الحالي
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // إنشاء نسخة مستقرة من allowedRoles
  const allowedRolesStr = useMemo(() => allowedRoles.join(','), [allowedRoles]);

  const handleUnauthorized = useCallback(() => {
    toast({
      title: 'غير مصرح',
      description: 'ليس لديك صلاحية للوصول إلى هذه الصفحة',
      variant: 'destructive',
    });
    navigate(redirectTo);
  }, [toast, navigate, redirectTo]);

  useEffect(() => {
    // إذا لم يكن هناك مستخدم أو الأدوار قيد التحميل، لا نفعل شيء
    if (loading || rolesLoading || !user) return;

    // التحقق من وجود دور مسموح به
    const hasAllowedRole = roles.some(role => allowedRoles.includes(role));

    if (!hasAllowedRole) {
      handleUnauthorized();
    }
    }, [user, roles, loading, rolesLoading, allowedRolesStr, allowedRoles, handleUnauthorized]);

  // إظهار شاشة تحميل أثناء التحقق
  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم، لا نعرض المحتوى (AuthWrapper سيتولى التوجيه)
  if (!user) {
    return null;
  }

  // إذا كان للمستخدم دور مسموح به، نعرض المحتوى
  const hasAllowedRole = roles.some(role => allowedRoles.includes(role));
  if (!hasAllowedRole) {
    return null;
  }

  return <>{children}</>;
}
