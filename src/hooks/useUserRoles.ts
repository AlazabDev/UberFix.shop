import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'manager' | 'staff' | 'technician' | 'vendor' | 'customer' | 'dispatcher' | 'finance' | 'owner';

export type { AppRole };

interface UserRoles {
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  isTechnician: boolean;
  isVendor: boolean;
  isCustomer: boolean;
  isDispatcher: boolean;
  isFinance: boolean;
  isOwner: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  hasPermission: (resource: string, action: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// Authorized owner emails - hardcoded for security
const AUTHORIZED_OWNER_EMAILS = [
  'mohamed@alazab.com',
  'admin@alazab.com',
  'uberfix@alazab.com',
  'magdy@alazab.com',
  'ceo@alazab.com',
  'm.uberfix@alazab.com'
];

export const useUserRoles = (): UserRoles => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      // Check if user is authorized owner using auth email directly (more reliable)
      const userEmail = user.email?.toLowerCase();
      const isAuthorizedOwner = userEmail && AUTHORIZED_OWNER_EMAILS.includes(userEmail);
      
      if (isAuthorizedOwner) {
        setRoles(['owner']);
        setLoading(false);
        return;
      }

      // استخدام جدول user_roles بدلاً من profiles.role - أكثر أماناً
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!rolesError && userRolesData && userRolesData.length > 0) {
        // تحويل الأدوار وتصفية owner للمستخدمين غير المصرح لهم
        const fetchedRoles = userRolesData
          .map(r => r.role as AppRole)
          .filter(role => role !== 'owner'); // فقط المالكون المصرح لهم يحصلون على owner
        
        if (fetchedRoles.length > 0) {
          setRoles(fetchedRoles);
          setLoading(false);
          return;
        }
      }

      // إذا لم يوجد في user_roles، تحقق من profiles كخطة بديلة
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role && profile.role !== 'owner') {
        setRoles([profile.role as AppRole]);
      } else {
        // المستخدم الجديد - الدور الافتراضي هو customer
        setRoles(['customer']);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setRoles(['customer']);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserRoles();

    // الاستماع لتغييرات جدول user_roles
    const channel = supabase
      .channel('user-roles-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_roles'
        },
        () => {
          fetchUserRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUserRoles]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (checkRoles: AppRole[]): boolean => {
    return checkRoles.some(role => roles.includes(role));
  };

  const hasPermission = async (resource: string, action: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.role) return false;

      const { data, error } = await supabase
        .from('role_permissions')
        .select('resource, action')
        .eq('role', profile.role)
        .eq('resource', resource)
        .eq('action', action);

      if (error) return false;
      return (data && data.length > 0) || false;
    } catch (error) {
      return false;
    }
  };

  return {
    roles,
    loading,
    isAdmin: hasRole('admin'),
    isManager: hasRole('manager'),
    isStaff: hasRole('staff'),
    isTechnician: hasRole('technician'),
    isVendor: hasRole('vendor'),
    isCustomer: hasRole('customer'),
    isDispatcher: hasRole('dispatcher'),
    isFinance: hasRole('finance'),
    isOwner: hasRole('owner'),
    hasRole,
    hasAnyRole,
    hasPermission,
    refetch: fetchUserRoles
  };
};
