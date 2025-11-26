import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/hooks/useUserSettings";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const PlatformSettings = () => {
  const { permissions } = useUserSettings();
  const [monthlyBudget, setMonthlyBudget] = useState<string>("0");

  const handleBudgetSave = () => {
    // Budget settings removed
  };

  const togglePermission = (_key: keyof import("@/hooks/useUserSettings").PlatformPermissions) =>
    (_val: boolean) => {
      // Permissions are read-only based on role
    };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات المنصة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Monthly Budget */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">الميزانية الشهرية</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0.00"
                  className="max-w-xs"
                />
                <div className="px-3 py-2 bg-muted rounded-md flex items-center">EGP</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              حدد ميزانيتك الشهرية لطلبات الصيانة والخدمات
            </p>
          </div>

          {/* Maintenance Request Permissions */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">صلاحيات طلبات الصيانة</Label>
            
            <div className="space-y-4">
              <PermissionItem
                label="السماح للمشرف باختيار الموعد"
                description="إذا تم التفعيل، يمكن للمشرف الشركة اختيار الموعد عند تقديم طلب صيانة"
                checked={permissions?.can_choose_appointment_date ?? true}
                disabled
              />

              <PermissionItem
                label="السماح للمشرف بتقديم الطلبات دون موافقة مدير الصيانة"
                description="إذا تم التفعيل، يمكن للمشرف الشركة عرض التفاصيل المالية لطلبات الصيانة بما في ذلك التكاليف، ومعلومات التسعير."
                checked={permissions?.can_submit_without_manager_approval ?? false}
                onChange={togglePermission("can_submit_without_manager_approval")}
              />

              <PermissionItem
                label="السماح للمشرف بإلغاء طلبات الصيانة"
                description="إذا تم التفعيل، يمكن للمشرف الشركة إلغاء طلبات الصيانة المقدمة من المستخدمين."
                checked={permissions?.can_cancel_requests ?? false}
                onChange={togglePermission("can_cancel_requests")}
              />

              <PermissionItem
                label="السماح للمشرف بالموافقة/رفض أسعار طلبات الصيانة"
                description="إذا تم التفعيل، يمكن للمشرف بالموافقة أو رفض طلبات الصيانة الموجهة إلى خدمات تتبع عند الطلب."
                checked={permissions?.can_reject_prices ?? false}
                onChange={togglePermission("can_reject_prices")}
              />

              <PermissionItem
                label="السماح للمشرف بإنشاء عقارات"
                description="إذا تم التفعيل، يمكن للمشرف الشركة إنشاء عقارات جديدة."
                checked={permissions?.can_create_properties ?? false}
                onChange={togglePermission("can_create_properties")}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <InfoIcon className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">تنبيهات الصلاحيات</p>
                  <p>
                    السماح للمشرف بتقديم الطلبات دون موافقة مدير الصيانة تتطلب كلاً من السماح للمشرف باختيار الفحص و السماح للمشرف باختيار موعد الزيارة ليكون مفعلاً.
                  </p>
                  <p className="mt-2">
                    السماح للمشرف بالموافقة/رفض أسعار طلبات الصيانة يتطلب السماح للمشرف بتقديم الطلبات دون موافقة مدير الصيانة ليكون مفعلاً.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleBudgetSave}>حفظ</Button>
        </CardContent>
      </Card>
    </div>
  );
};

interface PermissionItemProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}

const PermissionItem = ({ label, description, checked, disabled, onChange }: PermissionItemProps) => (
  <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <Label className="font-medium">{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
    <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
  </div>
);
