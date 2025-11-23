import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'technician' | 'customer';

interface UserRoleData {
  roles: AppRole[];
  isAdmin: boolean;
  isTechnician: boolean;
  isCustomer: boolean;
  loading: boolean;
}

/**
 * Hook لإدارة أدوار المستخدم
 * يجلب الأدوار من قاعدة البيانات ويوفر وظائف مساعدة للتحقق من الصلاحيات
 */
export function useUserRole(user: User | null): UserRoleData {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    async function fetchUserRoles() {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
        } else {
          setRoles(data?.map(r => r.role as AppRole) || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching roles:', err);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRoles();
  }, [user?.id]);

  return {
    roles,
    isAdmin: roles.includes('admin'),
    isTechnician: roles.includes('technician'),
    isCustomer: roles.includes('customer'),
    loading,
  };
}

/**
 * دالة مساعدة للتحقق من وجود دور معين
 */
export async function checkUserRole(userId: string, role: AppRole): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle();

    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * دالة لإضافة دور لمستخدم (للمسؤولين فقط)
 */
export async function addUserRole(userId: string, role: AppRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });

    return !error;
  } catch {
    return false;
  }
}

/**
 * دالة لإزالة دور من مستخدم (للمسؤولين فقط)
 */
export async function removeUserRole(userId: string, role: AppRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    return !error;
  } catch {
    return false;
  }
}
