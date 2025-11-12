import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type AppRole = 'admin' | 'manager' | 'staff' | 'technician' | 'vendor' | 'customer' | 'dispatcher' | 'finance';

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'مدير',
  manager: 'مشرف',
  staff: 'موظف',
  technician: 'فني',
  vendor: 'مورد',
  customer: 'عميل',
  dispatcher: 'منسق',
  finance: 'مالي',
};

const PERMISSION_LABELS: Record<string, string> = {
  'maintenance_requests.create': 'إنشاء طلبات الصيانة',
  'maintenance_requests.read': 'عرض طلبات الصيانة',
  'maintenance_requests.update': 'تعديل طلبات الصيانة',
  'maintenance_requests.delete': 'حذف طلبات الصيانة',
  'vendors.create': 'إضافة موردين',
  'vendors.read': 'عرض الموردين',
  'vendors.update': 'تعديل الموردين',
  'vendors.delete': 'حذف الموردين',
  'properties.create': 'إضافة عقارات',
  'properties.read': 'عرض العقارات',
  'properties.update': 'تعديل العقارات',
  'properties.delete': 'حذف العقارات',
  'users.manage': 'إدارة المستخدمين',
  'settings.manage': 'إدارة الإعدادات',
  'reports.view': 'عرض التقارير',
  'audit.view': 'عرض سجل المراجعة',
};

export function PermissionsManagement() {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role');

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group permissions by role
  const permissionsByRole = permissions?.reduce((acc, perm) => {
    const role = perm.role as AppRole;
    if (!acc[role]) acc[role] = [];
    acc[role].push(perm);
    return acc;
  }, {} as Record<AppRole, typeof permissions>);

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        الصلاحيات الحالية لكل دور في النظام. لتعديل الصلاحيات، استخدم استعلامات SQL مباشرة على جدول role_permissions.
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const rolePerms = permissionsByRole?.[role as AppRole] || [];
          return (
            <Card key={role}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  {label}
                  <Badge variant="secondary">{rolePerms.length}</Badge>
                </CardTitle>
                <CardDescription>
                  {rolePerms.length} صلاحية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {rolePerms.length > 0 ? (
                    rolePerms.map((perm) => (
                      <div
                        key={`${perm.role}-${perm.resource}-${perm.action}`}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">
                            {PERMISSION_LABELS[`${perm.resource}.${perm.action}`] || `${perm.resource}.${perm.action}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {perm.resource} • {perm.action}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      لا توجد صلاحيات محددة
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">كيفية إضافة صلاحيات جديدة</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
            لإضافة صلاحية جديدة، استخدم الاستعلام التالي في Supabase SQL Editor:
          </p>
          <pre className="bg-background border rounded p-3 text-xs overflow-x-auto" dir="ltr">
{`INSERT INTO role_permissions (role, resource, action)
VALUES ('admin', 'resource_name', 'action_name');`}
          </pre>
          <p className="text-xs text-muted-foreground mt-2">
            مثال: resource_name = 'invoices', action_name = 'create'
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
