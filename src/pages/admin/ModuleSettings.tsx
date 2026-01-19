import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useModulePermissions } from "@/hooks/useModulePermissions";
import { toast } from "sonner";
import { 
  Loader2, 
  Settings, 
  Users, 
  Wrench, 
  Briefcase, 
  Crown, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  Shield,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AUTHORIZED_OWNER_EMAILS } from "@/config/owners";

interface ModuleDefinition {
  key: string;
  name: string;
  description: string;
  category: 'general' | 'admin' | 'technician' | 'reports';
}

// Define all available modules
const ALL_MODULES: ModuleDefinition[] = [
  // General modules
  { key: 'dashboard', name: 'لوحة التحكم', description: 'الصفحة الرئيسية للنظام', category: 'general' },
  { key: 'requests', name: 'طلبات الصيانة', description: 'عرض وإدارة طلبات الصيانة الخاصة', category: 'general' },
  { key: 'all_requests', name: 'كل الطلبات', description: 'عرض جميع طلبات الصيانة في النظام', category: 'general' },
  { key: 'inbox', name: 'صندوق البريد', description: 'الرسائل والإشعارات', category: 'general' },
  { key: 'vendors', name: 'الموردين والفنيين', description: 'إدارة الموردين والفنيين', category: 'general' },
  { key: 'properties', name: 'العقارات', description: 'إدارة العقارات والمباني', category: 'general' },
  { key: 'appointments', name: 'المواعيد', description: 'جدولة وإدارة المواعيد', category: 'general' },
  { key: 'invoices', name: 'الفواتير', description: 'إدارة الفواتير والمدفوعات', category: 'general' },
  { key: 'service_map', name: 'خريطة الخدمات', description: 'عرض الخدمات على الخريطة', category: 'general' },
  { key: 'documentation', name: 'التوثيق', description: 'الوثائق والمستندات', category: 'general' },
  { key: 'settings', name: 'الإعدادات', description: 'إعدادات الحساب الشخصي', category: 'general' },
  
  // Reports modules
  { key: 'reports', name: 'التقارير والإحصائيات', description: 'التقارير والإحصائيات العامة', category: 'reports' },
  { key: 'sla_dashboard', name: 'لوحة SLA', description: 'مراقبة مستوى الخدمة', category: 'reports' },
  { key: 'production_report', name: 'تقرير الإنتاج', description: 'تقارير الإنتاجية', category: 'reports' },
  
  // Admin modules
  { key: 'testing', name: 'اختبار النظام', description: 'أدوات اختبار النظام', category: 'admin' },
  { key: 'production_monitor', name: 'مراقب الإنتاج', description: 'مراقبة أداء النظام', category: 'admin' },
  { key: 'admin_users', name: 'إدارة المستخدمين', description: 'إدارة حسابات المستخدمين', category: 'admin' },
  { key: 'technician_approval', name: 'موافقات الفنيين', description: 'مراجعة طلبات انضمام الفنيين', category: 'admin' },
  { key: 'module_settings', name: 'إعدادات المديولات', description: 'التحكم في صلاحيات المديولات', category: 'admin' },
  
  // Technician modules
  { key: 'technician_dashboard', name: 'لوحة الفني', description: 'لوحة تحكم الفني', category: 'technician' },
  { key: 'technician_tasks', name: 'المهام', description: 'مهام الفني المسندة', category: 'technician' },
  { key: 'technician_wallet', name: 'المحفظة', description: 'محفظة الفني والأرصدة', category: 'technician' },
  { key: 'technician_earnings', name: 'الأرباح', description: 'أرباح وإيرادات الفني', category: 'technician' },
];

const roleConfig = {
  customer: {
    label: "العملاء",
    icon: Users,
    color: "bg-blue-500",
    textColor: "text-blue-500",
    description: "المستخدمون الذين يطلبون خدمات الصيانة"
  },
  technician: {
    label: "الفنيون",
    icon: Wrench,
    color: "bg-green-500",
    textColor: "text-green-500",
    description: "الفنيون المسؤولون عن تنفيذ طلبات الصيانة"
  },
  manager: {
    label: "المديرون",
    icon: Briefcase,
    color: "bg-purple-500",
    textColor: "text-purple-500",
    description: "مديرو العمليات والإشراف على الطلبات"
  },
  owner: {
    label: "المالك",
    icon: Crown,
    color: "bg-amber-500",
    textColor: "text-amber-500",
    description: "المالك لديه صلاحية كاملة على كل المديولات"
  }
};

const categoryLabels: Record<string, string> = {
  general: 'المديولات العامة',
  reports: 'التقارير والإحصائيات',
  admin: 'الإدارة والتحكم',
  technician: 'مديولات الفنيين'
};

export default function ModuleSettings() {
  const navigate = useNavigate();
  const { allPermissions, loading: permissionsLoading, updatePermission, userRole } = useModulePermissions();
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('customer');

  // Only owner can access this page
  useEffect(() => {
    if (!permissionsLoading && userRole !== 'owner') {
      toast.error("ليس لديك صلاحية الوصول لهذه الصفحة");
      navigate('/dashboard');
    }
  }, [permissionsLoading, userRole, navigate]);

  const handleToggle = async (id: string, currentValue: boolean) => {
    setUpdating(id);
    const success = await updatePermission(id, !currentValue);
    if (success) {
      toast.success("تم تحديث الصلاحية بنجاح");
    } else {
      toast.error("فشل تحديث الصلاحية");
    }
    setUpdating(null);
  };

  const handleBulkToggle = async (role: string, enable: boolean) => {
    setBulkUpdating(true);
    const rolePermissions = allPermissions.filter(p => p.role === role);
    let successCount = 0;
    
    for (const permission of rolePermissions) {
      if (permission.is_enabled !== enable) {
        const success = await updatePermission(permission.id, enable);
        if (success) successCount++;
      }
    }
    
    if (successCount > 0) {
      toast.success(`تم ${enable ? 'تفعيل' : 'تعطيل'} ${successCount} مديول بنجاح`);
    }
    setBulkUpdating(false);
  };

  const getPermissionsByRole = (role: string) => {
    return allPermissions.filter(p => p.role === role);
  };

  const getModulesByCategory = (role: string, category: string) => {
    const rolePerms = getPermissionsByRole(role);
    return ALL_MODULES.filter(m => m.category === category).map(module => {
      const permission = rolePerms.find(p => p.module_key === module.key);
      return {
        ...module,
        permission,
        isEnabled: permission?.is_enabled ?? false
      };
    });
  };

  const getRoleStats = (role: string) => {
    const permissions = getPermissionsByRole(role);
    const enabled = permissions.filter(p => p.is_enabled).length;
    return { enabled, total: permissions.length };
  };

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'owner') {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إعدادات المديولات والصلاحيات</h1>
            <p className="text-muted-foreground">تحكم في المديولات المتاحة لكل مستوى مستخدم</p>
          </div>
        </div>
      </div>

      {/* Owner Accounts Card */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">حسابات المالك الثابتة</CardTitle>
          </div>
          <CardDescription>
            هذه الحسابات لها كافة الصلاحيات ولا يمكن تعديلها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AUTHORIZED_OWNER_EMAILS.map((email) => (
              <Badge key={email} variant="outline" className="bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700">
                <Crown className="h-3 w-3 ml-1 text-amber-600" />
                {email}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(roleConfig).filter(([key]) => key !== 'owner').map(([key, config]) => {
          const stats = getRoleStats(key);
          return (
            <Card 
              key={key} 
              className={`cursor-pointer transition-all hover:shadow-md ${activeTab === key ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${config.color}/10`}>
                      <config.icon className={`h-5 w-5 ${config.textColor}`} />
                    </div>
                    <span className="font-semibold">{config.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{stats.enabled} مفعّل</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>{stats.total - stats.enabled} معطّل</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {/* Owner Card */}
        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                <span className="font-semibold">المالك</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
              <Lock className="h-4 w-4" />
              <span>كل الصلاحيات</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(roleConfig).filter(([key]) => key !== 'owner').map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <config.icon className="h-4 w-4" />
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(roleConfig).filter(([key]) => key !== 'owner').map(([role, config]) => (
          <TabsContent key={role} value={role} className="space-y-4">
            {/* Bulk Actions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}/10`}>
                      <config.icon className={`h-6 w-6 ${config.textColor}`} />
                    </div>
                    <div>
                      <CardTitle>مديولات {config.label}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkToggle(role, true)}
                      disabled={bulkUpdating}
                    >
                      <Unlock className="h-4 w-4 ml-1" />
                      تفعيل الكل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkToggle(role, false)}
                      disabled={bulkUpdating}
                    >
                      <Lock className="h-4 w-4 ml-1" />
                      تعطيل الكل
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Modules by Category */}
            {['general', 'reports', 'admin', 'technician'].map(category => {
              const modules = getModulesByCategory(role, category);
              if (modules.length === 0) return null;
              
              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{categoryLabels[category]}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {modules.map((module) => (
                      <div
                        key={module.key}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{module.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {module.key}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {module.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {module.isEnabled ? (
                            <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                              <Eye className="h-3 w-3 ml-1" />
                              مفعّل
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                              <EyeOff className="h-3 w-3 ml-1" />
                              معطّل
                            </Badge>
                          )}
                          {module.permission ? (
                            <Switch
                              checked={module.isEnabled}
                              onCheckedChange={() => handleToggle(module.permission!.id, module.isEnabled)}
                              disabled={updating === module.permission.id || bulkUpdating}
                            />
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              غير موجود
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
