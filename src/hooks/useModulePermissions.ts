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

  // Determine actual role from useUserRoles - must be computed inside render
  const userRole = (() => {
    if (isOwner) return 'owner';
    if (isManager) return 'manager';
    if (isTechnician) return 'technician';
    return 'customer';
  })();

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

        // Always fetch all permissions for sidebar display
        const { data: allData } = await supabase
          .from('module_permissions')
          .select('*')
          .order('role', { ascending: true })
          .order('module_key', { ascending: true });
        
        setAllPermissions(allData || []);

        // Owner sees everything - no need to filter
        if (isOwner) {
          setLoading(false);
          return;
        }

        // Filter permissions for user's actual role
        const rolePermissions = (allData || []).filter(
          p => p.role === userRole && p.is_enabled
        );
        setPermissions(rolePermissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [rolesLoading, isOwner, userRole]);

  const isModuleEnabled = (moduleKey: string): boolean => {
    // Owner sees everything always
    if (isOwner) return true;
    
    // Check in allPermissions for this role and module
    const permission = allPermissions.find(
      p => p.module_key === moduleKey && p.role === userRole
    );
    
    // If permission found, return its is_enabled value
    // If not found, default to TRUE (allow access if not configured)
    return permission?.is_enabled ?? true;
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
