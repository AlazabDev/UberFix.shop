import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';

export interface ModulePermission {
  id: string;
  role: string;
  module_key: string;
  module_name: string;
  is_enabled: boolean;
}

export const useModulePermissions = () => {
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [allPermissions, setAllPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use the centralized useUserRoles hook which properly checks owner email whitelist
  const { roles, loading: rolesLoading, isOwner, isManager, isTechnician, isCustomer } = useUserRoles();

  // Determine actual role from useUserRoles
  const getUserRole = (): string => {
    if (isOwner) return 'owner';
    if (isManager) return 'manager';
    if (isTechnician) return 'technician';
    return 'customer';
  };

  const userRole = getUserRole();

  useEffect(() => {
    const fetchPermissions = async () => {
      // Wait for roles to load first
      if (rolesLoading) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Owner sees everything - no need to fetch permissions
        if (isOwner) {
          // Fetch all permissions for management
          const { data: allData } = await supabase
            .from('module_permissions')
            .select('*')
            .order('role', { ascending: true })
            .order('module_key', { ascending: true });
          
          setAllPermissions(allData || []);
          setLoading(false);
          return;
        }

        // Fetch permissions for user's actual role
        const { data, error } = await supabase
          .from('module_permissions')
          .select('*')
          .eq('role', userRole)
          .eq('is_enabled', true);

        if (error) {
          console.error('Error fetching permissions:', error);
        } else {
          setPermissions(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [rolesLoading, isOwner, userRole]);

  const isModuleEnabled = (moduleKey: string): boolean => {
    // Owner sees everything always
    if (isOwner) return true;
    
    const permission = permissions.find(p => p.module_key === moduleKey);
    return permission?.is_enabled ?? false;
  };

  const updatePermission = async (id: string, isEnabled: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('module_permissions')
        .update({ is_enabled: isEnabled })
        .eq('id', id);

      if (error) {
        console.error('Error updating permission:', error);
        return false;
      }

      // Update local state
      setAllPermissions(prev => 
        prev.map(p => p.id === id ? { ...p, is_enabled: isEnabled } : p)
      );
      
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  return {
    permissions,
    allPermissions,
    loading: loading || rolesLoading,
    isModuleEnabled,
    updatePermission,
    userRole
  };
};
