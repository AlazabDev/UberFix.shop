/**
 * Role-Based Redirect Logic
 * 
 * المعمارية الصحيحة لـ OAuth:
 * 1. Identity First: المستخدم يسجل دخول (بدون role)
 * 2. Detect Role: نجلب الدور من DB
 * 3. Smart Redirect: نوجه للـ dashboard المناسب
 */

import { supabase } from '@/integrations/supabase/client';
import { isAuthorizedOwner } from '@/config/owners';

export type UserRole = 'owner' | 'admin' | 'manager' | 'technician' | 'vendor' | 'customer' | 'staff' | 'dispatcher' | 'finance';

// خريطة التوجيه حسب الدور
const ROLE_DASHBOARDS: Record<UserRole, string> = {
  owner: '/dashboard',
  admin: '/dashboard',
  manager: '/dashboard',
  technician: '/technicians/dashboard',
  vendor: '/dashboard',
  customer: '/dashboard',
  staff: '/dashboard',
  dispatcher: '/dashboard',
  finance: '/dashboard',
};

// الصفحة الافتراضية للمستخدمين الجدد
const DEFAULT_DASHBOARD = '/dashboard';

// صفحة اختيار الدور للمستخدمين الجدد
export const ROLE_SELECTION_PATH = '/role-selection';

export interface DetectedUserRole {
  roles: UserRole[];
  primaryRole: UserRole | null;
  isNewUser: boolean;
  redirectPath: string;
}

/**
 * اكتشاف دور المستخدم من قاعدة البيانات
 * يُستدعى بعد نجاح المصادقة
 */
export async function detectUserRole(userId: string, userEmail?: string): Promise<DetectedUserRole> {
  // التحقق من المالك المصرح له
  if (userEmail && isAuthorizedOwner(userEmail.toLowerCase())) {
    return {
      roles: ['owner'],
      primaryRole: 'owner',
      isNewUser: false,
      redirectPath: ROLE_DASHBOARDS.owner,
    };
  }

  try {
    // جلب الأدوار من جدول user_roles
    const { data: userRolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (!rolesError && userRolesData && userRolesData.length > 0) {
      const roles = userRolesData.map(r => r.role as UserRole);
      const primaryRole = determinePrimaryRole(roles);
      
      return {
        roles,
        primaryRole,
        isNewUser: false,
        redirectPath: ROLE_DASHBOARDS[primaryRole] || DEFAULT_DASHBOARD,
      };
    }

    // إذا لم يوجد في user_roles، تحقق من profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.role && profile.role !== 'owner') {
      const role = profile.role as UserRole;
      return {
        roles: [role],
        primaryRole: role,
        isNewUser: false,
        redirectPath: ROLE_DASHBOARDS[role] || DEFAULT_DASHBOARD,
      };
    }

    // مستخدم جديد بدون دور - يحتاج اختيار الدور
    return {
      roles: [],
      primaryRole: null,
      isNewUser: true,
      redirectPath: ROLE_SELECTION_PATH,
    };

  } catch (error) {
    console.error('Error detecting user role:', error);
    // في حالة الخطأ، نعتبره مستخدم جديد
    return {
      roles: [],
      primaryRole: null,
      isNewUser: true,
      redirectPath: ROLE_SELECTION_PATH,
    };
  }
}

/**
 * تحديد الدور الرئيسي من قائمة الأدوار
 * الأولوية: owner > admin > manager > technician > vendor > customer
 */
function determinePrimaryRole(roles: UserRole[]): UserRole {
  const priority: UserRole[] = ['owner', 'admin', 'manager', 'dispatcher', 'finance', 'staff', 'technician', 'vendor', 'customer'];
  
  for (const role of priority) {
    if (roles.includes(role)) {
      return role;
    }
  }
  
  return roles[0] || 'customer';
}

/**
 * الحصول على مسار التوجيه للدور المحدد
 */
export function getRoleRedirectPath(role: UserRole | null): string {
  if (!role) return DEFAULT_DASHBOARD;
  return ROLE_DASHBOARDS[role] || DEFAULT_DASHBOARD;
}

/**
 * التحقق مما إذا كان المسار يتطلب دور معين
 */
export function isRoleAllowedForPath(path: string, userRoles: UserRole[]): boolean {
  // المسارات العامة متاحة للجميع
  const publicPaths = ['/dashboard', '/profile', '/settings'];
  if (publicPaths.some(p => path.startsWith(p))) return true;
  
  // التحقق من المسارات الخاصة بالأدوار
  if (path.startsWith('/technician') && !userRoles.includes('technician') && !userRoles.includes('owner') && !userRoles.includes('admin')) {
    return false;
  }
  if (path.startsWith('/vendor') && !userRoles.includes('vendor') && !userRoles.includes('owner') && !userRoles.includes('admin')) {
    return false;
  }
  if (path.startsWith('/customer') && !userRoles.includes('customer') && !userRoles.includes('owner') && !userRoles.includes('admin')) {
    return false;
  }
  
  return true;
}
