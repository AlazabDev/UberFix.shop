import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * AuthWrapper - حارس المسارات المحمية
 * بسيط وواضح: إذا لا يوجد مستخدم → login، إذا يوجد → عرض المحتوى
 */
export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isLoading, user, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">جاري التحويل...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
