import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermissions } from "@/hooks/useModulePermissions";
import { toast } from "sonner";
import { Loader2, Settings, Users, Wrench, Briefcase, Crown } from "lucide-react";

const roleConfig = {
  customer: {
    label: "العملاء",
    icon: Users,
    color: "bg-blue-500",
    description: "المستخدمون الذين يطلبون خدمات الصيانة"
  },
  technician: {
    label: "الفنيون",
    icon: Wrench,
    color: "bg-green-500",
    description: "الفنيون المسؤولون عن تنفيذ طلبات الصيانة"
  },
  manager: {
    label: "المديرون",
    icon: Briefcase,
    color: "bg-purple-500",
    description: "مديرو العمليات والإشراف على الطلبات"
  },
  owner: {
    label: "المالك",
    icon: Crown,
    color: "bg-amber-500",
    description: "المالك لديه صلاحية كاملة على كل المديولات"
  }
};

export default function ModuleSettings() {
  const navigate = useNavigate();
  const { allPermissions, loading: permissionsLoading, updatePermission, userRole } = useModulePermissions();
  const [updating, setUpdating] = useState<string | null>(null);

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

  const getPermissionsByRole = (role: string) => {
    return allPermissions.filter(p => p.role === role);
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
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">إعدادات المديولات والصلاحيات</h1>
          <p className="text-muted-foreground">تحكم في المديولات المتاحة لكل مستوى مستخدم</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>مستويات المستخدمين</CardTitle>
          <CardDescription>
            التطبيق يعمل على 4 مستويات: العملاء، الفنيون، المديرون، والمالك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(roleConfig).map(([key, config]) => (
              <div key={key} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${config.color}/10`}>
                    <config.icon className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                  <span className="font-semibold">{config.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="customer" className="w-full" dir="rtl">
        <TabsList className="grid w-full grid-cols-4">
          {Object.entries(roleConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <config.icon className="h-4 w-4" />
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(roleConfig).map(([role, config]) => (
          <TabsContent key={role} value={role}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}/10`}>
                    <config.icon className={`h-6 w-6 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <CardTitle>مديولات {config.label}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {role === 'owner' ? (
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-amber-800 dark:text-amber-200">
                      المالك لديه صلاحية الوصول لجميع المديولات ولا يمكن تعديل صلاحياته
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getPermissionsByRole(role).map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{permission.module_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {permission.module_key}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {permission.is_enabled ? "مفعّل" : "معطّل"}
                          </span>
                          <Switch
                            checked={permission.is_enabled}
                            onCheckedChange={() => handleToggle(permission.id, permission.is_enabled)}
                            disabled={updating === permission.id}
                          />
                        </div>
                      </div>
                    ))}
                    {getPermissionsByRole(role).length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد مديولات محددة لهذا المستوى
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
