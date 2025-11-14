import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Unlock, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface AppControl {
  is_locked: boolean;
  message: string | null;
  updated_at: string;
}

interface LockHistory {
  id: string;
  is_locked: boolean;
  message: string | null;
  changed_by: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function MaintenanceLockAdmin() {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  // جلب حالة القفل الحالية
  const { data: appControl, isLoading } = useQuery({
    queryKey: ["app-control-admin"],
    queryFn: async (): Promise<AppControl> => {
      const { data, error } = await supabase
        .from("app_control")
        .select("is_locked, message, updated_at")
        .eq("id", "global")
        .single();

      if (error) throw error;
      return data;
    },
  });

  // جلب سجل التاريخ
  const { data: history } = useQuery({
    queryKey: ["app-control-history"],
    queryFn: async (): Promise<LockHistory[]> => {
      const { data, error } = await supabase
        .from("app_control_history")
        .select("id, is_locked, message, changed_by, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // جلب معلومات المستخدمين
      const withProfiles = await Promise.all(
        (data || []).map(async (entry) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", entry.changed_by)
            .single();

          return {
            ...entry,
            profiles: profile || { full_name: "", email: "" },
          };
        })
      );

      return withProfiles;
    },
  });

  // تحديث القفل
  const updateLockMutation = useMutation({
    mutationFn: async ({ isLocked, msg }: { isLocked: boolean; msg: string }) => {
      const { error } = await supabase
        .from("app_control")
        .update({
          is_locked: isLocked,
          message: msg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "global");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-control-admin"] });
      queryClient.invalidateQueries({ queryKey: ["app-control-history"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-lock"] });
      toast.success("تم تحديث حالة القفل بنجاح");
      setMessage("");
    },
    onError: (error) => {
      toast.error("فشل تحديث القفل: " + error.message);
    },
  });

  const handleActivateLock = () => {
    if (!message.trim()) {
      toast.error("يرجى إدخال رسالة القفل");
      return;
    }
    updateLockMutation.mutate({ isLocked: true, msg: message });
  };

  const handleDeactivateLock = () => {
    updateLockMutation.mutate({ isLocked: false, msg: "" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة قفل الصيانة</h1>
          <p className="text-muted-foreground">
            التحكم في قفل النظام وعرض سجل التغييرات
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* حالة القفل الحالية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {appControl?.is_locked ? (
                  <Lock className="w-5 h-5 text-destructive" />
                ) : (
                  <Unlock className="w-5 h-5 text-green-600" />
                )}
                الحالة الحالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">حالة النظام:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appControl?.is_locked
                        ? "bg-destructive/10 text-destructive"
                        : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                    }`}
                  >
                    {appControl?.is_locked ? "مقفل" : "مفتوح"}
                  </span>
                </div>

                {appControl?.is_locked && appControl.message && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">الرسالة الحالية:</p>
                    <p className="text-sm">{appControl.message}</p>
                  </div>
                )}

                {appControl?.updated_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    آخر تحديث: {format(new Date(appControl.updated_at), "PPp", { locale: ar })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* التحكم بالقفل */}
          <Card>
            <CardHeader>
              <CardTitle>التحكم في القفل</CardTitle>
              <CardDescription>تفعيل أو إلغاء قفل النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!appControl?.is_locked ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="lock-message">رسالة القفل</Label>
                      <Textarea
                        id="lock-message"
                        placeholder="نقوم الآن بصيانة مجدولة لتحسين أداء النظام..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleActivateLock}
                      disabled={updateLockMutation.isPending}
                      variant="destructive"
                      className="w-full"
                    >
                      <Lock className="w-4 h-4 ml-2" />
                      تفعيل القفل
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleDeactivateLock}
                    disabled={updateLockMutation.isPending}
                    variant="default"
                    className="w-full"
                  >
                    <Unlock className="w-4 h-4 ml-2" />
                    إلغاء القفل وفتح النظام
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* سجل التاريخ */}
        <Card>
          <CardHeader>
            <CardTitle>سجل تاريخ القفل</CardTitle>
            <CardDescription>آخر 20 تغيير على حالة القفل</CardDescription>
          </CardHeader>
          <CardContent>
            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="mt-1">
                      {entry.is_locked ? (
                        <Lock className="w-5 h-5 text-destructive" />
                      ) : (
                        <Unlock className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-medium ${
                            entry.is_locked ? "text-destructive" : "text-green-600"
                          }`}
                        >
                          {entry.is_locked ? "تفعيل القفل" : "إلغاء القفل"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(entry.created_at), "PPp", { locale: ar })}
                        </span>
                      </div>

                      {entry.message && (
                        <p className="text-sm text-muted-foreground bg-background/50 p-2 rounded">
                          {entry.message}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {entry.profiles?.full_name || entry.profiles?.email || "غير معروف"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                لا يوجد سجل تاريخ حتى الآن
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
