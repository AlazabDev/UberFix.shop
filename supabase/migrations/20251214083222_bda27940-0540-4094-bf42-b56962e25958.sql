-- Create module_permissions table to control which modules are visible to each role
CREATE TABLE IF NOT EXISTS public.module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    module_key TEXT NOT NULL,
    module_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role, module_key)
);

-- Enable RLS
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Only owner can manage module permissions (owner = admin with special flag)
CREATE POLICY "owner_manage_module_permissions" ON public.module_permissions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'owner'
        )
    );

-- Anyone authenticated can read their own role's permissions
CREATE POLICY "read_own_role_permissions" ON public.module_permissions
    FOR SELECT TO authenticated
    USING (
        role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'owner'
        )
    );

-- Insert default module permissions for each role
-- Customer modules
INSERT INTO public.module_permissions (role, module_key, module_name, is_enabled) VALUES
    ('customer', 'dashboard', 'لوحة التحكم', true),
    ('customer', 'requests', 'طلبات الصيانة', true),
    ('customer', 'properties', 'العقارات', true),
    ('customer', 'appointments', 'المواعيد', true),
    ('customer', 'invoices', 'الفواتير', true),
    ('customer', 'inbox', 'صندوق البريد', true),
    ('customer', 'settings', 'الإعدادات', true)
ON CONFLICT (role, module_key) DO NOTHING;

-- Technician modules
INSERT INTO public.module_permissions (role, module_key, module_name, is_enabled) VALUES
    ('technician', 'technician_dashboard', 'لوحة الفني', true),
    ('technician', 'technician_tasks', 'المهام', true),
    ('technician', 'technician_wallet', 'المحفظة', true),
    ('technician', 'technician_earnings', 'الأرباح', true),
    ('technician', 'inbox', 'صندوق البريد', true),
    ('technician', 'settings', 'الإعدادات', true)
ON CONFLICT (role, module_key) DO NOTHING;

-- Manager modules
INSERT INTO public.module_permissions (role, module_key, module_name, is_enabled) VALUES
    ('manager', 'dashboard', 'لوحة التحكم', true),
    ('manager', 'requests', 'طلبات الصيانة', true),
    ('manager', 'all_requests', 'كل الطلبات', true),
    ('manager', 'vendors', 'الموردين والفنيين', true),
    ('manager', 'reports', 'التقارير والإحصائيات', true),
    ('manager', 'properties', 'العقارات', true),
    ('manager', 'appointments', 'المواعيد', true),
    ('manager', 'invoices', 'الفواتير', true),
    ('manager', 'inbox', 'صندوق البريد', true),
    ('manager', 'service_map', 'خريطة الخدمات', true),
    ('manager', 'settings', 'الإعدادات', true),
    ('manager', 'technician_approval', 'موافقات الفنيين', true)
ON CONFLICT (role, module_key) DO NOTHING;

-- Owner gets ALL modules
INSERT INTO public.module_permissions (role, module_key, module_name, is_enabled) VALUES
    ('owner', 'dashboard', 'لوحة التحكم', true),
    ('owner', 'requests', 'طلبات الصيانة', true),
    ('owner', 'all_requests', 'كل الطلبات', true),
    ('owner', 'vendors', 'الموردين والفنيين', true),
    ('owner', 'reports', 'التقارير والإحصائيات', true),
    ('owner', 'properties', 'العقارات', true),
    ('owner', 'appointments', 'المواعيد', true),
    ('owner', 'invoices', 'الفواتير', true),
    ('owner', 'inbox', 'صندوق البريد', true),
    ('owner', 'service_map', 'خريطة الخدمات', true),
    ('owner', 'documentation', 'التوثيق', true),
    ('owner', 'settings', 'الإعدادات', true),
    ('owner', 'testing', 'اختبار النظام', true),
    ('owner', 'production_report', 'تقرير الإنتاج', true),
    ('owner', 'sla_dashboard', 'لوحة SLA', true),
    ('owner', 'production_monitor', 'مراقب الإنتاج', true),
    ('owner', 'admin_users', 'إدارة المستخدمين', true),
    ('owner', 'technician_approval', 'موافقات الفنيين', true),
    ('owner', 'module_settings', 'إعدادات المديولات', true),
    ('owner', 'technician_dashboard', 'لوحة الفني', true),
    ('owner', 'technician_tasks', 'مهام الفنيين', true),
    ('owner', 'technician_wallet', 'محفظة الفنيين', true),
    ('owner', 'technician_earnings', 'أرباح الفنيين', true)
ON CONFLICT (role, module_key) DO NOTHING;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_module_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_module_permissions_updated_at
    BEFORE UPDATE ON public.module_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_module_permissions_updated_at();