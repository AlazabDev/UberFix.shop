import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'manager' | 'staff' | 'technician' | 'vendor' | 'customer' | 'dispatcher' | 'finance';

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
          table: 'user_roles',
          filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
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

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      setRoles(data?.map(r => r.role as AppRole) || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
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

      // Check permissions directly from role_permissions table
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          role_permissions!inner(resource, action)
        `)
        .eq('user_id', user.id)
        .eq('role_permissions.resource', resource)
        .eq('role_permissions.action', action);

      if (error) throw error;
      return (data && data.length > 0) || false;
    } catch (error) {
      console.error('Error checking permission:', error);
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
