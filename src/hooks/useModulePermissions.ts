import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [userRole, setUserRole] = useState<string>('customer');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Get user's profile to check if owner
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        const currentRole = profile?.role || 'customer';
        setUserRole(currentRole);

        // Fetch permissions for user's role
        const { data, error } = await supabase
          .from('module_permissions')
          .select('*')
          .eq('role', currentRole)
          .eq('is_enabled', true);

        if (error) {
          console.error('Error fetching permissions:', error);
        } else {
          setPermissions(data || []);
        }

        // If owner, fetch all permissions for management
        if (currentRole === 'owner') {
          const { data: allData } = await supabase
            .from('module_permissions')
            .select('*')
            .order('role', { ascending: true })
            .order('module_key', { ascending: true });
          
          setAllPermissions(allData || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const isModuleEnabled = (moduleKey: string): boolean => {
    // Owner sees everything
    if (userRole === 'owner') return true;
    
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
    loading,
    isModuleEnabled,
    updatePermission,
    userRole
  };
};
