import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings2, Database, Globe, Mail } from 'lucide-react';

export function SystemSettings() {
  const { data: appSettings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();

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

  const settingsGroups = [
    {
      title: 'الإعدادات العامة',
      icon: Settings2,
      settings: [
        { label: 'اسم التطبيق', value: appSettings?.app_name },
        { label: 'اللغة الافتراضية', value: appSettings?.default_language },
        { label: 'المنطقة الزمنية', value: appSettings?.timezone },
        { label: 'العملة الافتراضية', value: appSettings?.default_currency },
        { label: 'وضع السمة', value: appSettings?.theme_mode },
      ],
    },
    {
      title: 'إعدادات الخريطة',
      icon: Globe,
      settings: [
        { label: 'تفعيل خرائط جوجل', value: appSettings?.google_maps_enabled, isBool: true },
        { label: 'عرض الفنيين على الخريطة', value: appSettings?.show_technicians_on_map, isBool: true },
        { label: 'نمط الخريطة', value: appSettings?.map_style },
      ],
    },
    {
      title: 'الإشعارات',
      icon: Mail,
      settings: [
        { label: 'إشعارات البريد', value: appSettings?.enable_email_notifications, isBool: true },
        { label: 'إشعارات SMS', value: appSettings?.enable_sms_notifications, isBool: true },
        { label: 'الإشعارات الداخلية', value: appSettings?.enable_in_app_notifications, isBool: true },
        { label: 'تفعيل التذكيرات', value: appSettings?.enable_reminders, isBool: true },
      ],
    },
    {
      title: 'إعدادات الصيانة',
      icon: Database,
      settings: [
        { label: 'السماح بالتسجيل الذاتي', value: appSettings?.allow_self_registration, isBool: true },
        { label: 'يتطلب موافقة المدير', value: appSettings?.require_manager_approval, isBool: true },
        { label: 'السماح بتقييم الفنيين', value: appSettings?.enable_technician_rating, isBool: true },
        { label: 'السماح بتعديل بعد البدء', value: appSettings?.allow_edit_after_start, isBool: true },
        { label: 'مدة تنفيذ الطلب القصوى (ساعة)', value: appSettings?.max_execution_time },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        الإعدادات العامة للنظام. لتعديل الإعدادات، استخدم صفحة الإعدادات أو استعلامات SQL مباشرة.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.title}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {group.title}
                </CardTitle>
                <CardDescription>
                  {group.settings.length} إعدادات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.settings.map((setting) => (
                    <div key={setting.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{setting.label}</span>
                      {setting.isBool ? (
                        <Badge variant={setting.value ? 'default' : 'secondary'}>
                          {setting.value ? 'مفعل' : 'غير مفعل'}
                        </Badge>
                      ) : (
                        <span className="text-sm font-medium">{setting.value || 'غير محدد'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Link */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">تعديل الإعدادات</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            لتعديل هذه الإعدادات، انتقل إلى صفحة <a href="/settings" className="underline font-medium">الإعدادات</a> أو استخدم SQL Editor في Supabase لتحديث جدول <code className="bg-background px-1 rounded">app_settings</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
