import { protectedRoutes } from '@/routes/routes.config';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Lock } from 'lucide-react';

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': ['admin', 'manager', 'staff', 'technician', 'customer'],
  '/sla-dashboard': ['admin', 'manager'],
  '/requests': ['admin', 'manager', 'staff', 'technician', 'customer'],
  '/all-requests': ['admin', 'manager', 'staff'],
  '/vendors': ['admin', 'manager', 'staff'],
  '/reports': ['admin', 'manager', 'finance'],
  '/properties': ['admin', 'manager', 'staff'],
  '/appointments': ['admin', 'manager', 'staff', 'technician'],
  '/invoices': ['admin', 'finance'],
  '/settings': ['admin'],
  '/admin/users': ['admin'],
  '/maintenance-lock-admin': ['admin'],
  '/admin-control-center': ['admin'],
};

export function RouteAccessControl() {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        جميع المسارات المحمية في التطبيق والأدوار المصرح لها بالوصول.
      </div>

      <div className="grid gap-3">
        {protectedRoutes.map((route) => {
          const allowedRoles = ROUTE_PERMISSIONS[route.path] || ['جميع المستخدمين المسجلين'];
          const isAdminOnly = allowedRoles.includes('admin') && allowedRoles.length === 1;

          return (
            <Card key={route.path} className={isAdminOnly ? 'border-amber-200 dark:border-amber-800' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {isAdminOnly ? (
                      <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {route.path}
                      </code>
                      {!route.withLayout && (
                        <Badge variant="outline" className="mr-2">
                          بدون Layout
                        </Badge>
                      )}
                      {isAdminOnly && (
                        <Badge variant="destructive" className="mr-2">
                          المدراء فقط
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {allowedRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">إضافة مسار محمي جديد</h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
            <li>أضف المسار في <code className="bg-background px-1 rounded">src/routes/routes.config.tsx</code></li>
            <li>استخدم مكون <code className="bg-background px-1 rounded">RoleGuard</code> لحماية الصفحة</li>
            <li>حدد الأدوار المسموح بها في <code className="bg-background px-1 rounded">allowedRoles</code></li>
            <li>أضف المسار والأدوار في <code className="bg-background px-1 rounded">ROUTE_PERMISSIONS</code> في هذا المكون</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
