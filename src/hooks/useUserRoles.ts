import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'manager' | 'staff' | 'technician' | 'vendor' | 'customer' | 'dispatcher' | 'finance';

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
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  hasPermission: (resource: string, action: string) => Promise<boolean>;
}

export const useUserRoles = (): UserRoles => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRoles();

    const channel = supabase
      .channel('user-roles-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles'
        },
        () => {
          fetchUserRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role) {
        setRoles([profile.role as AppRole]);
      } else {
        setRoles([]);
      }
    } catch (error) {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

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
    hasRole,
    hasAnyRole,
    hasPermission
  };
};
