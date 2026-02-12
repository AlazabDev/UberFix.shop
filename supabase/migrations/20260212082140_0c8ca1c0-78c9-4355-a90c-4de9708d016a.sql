-- إضافة دور المالك للمستخدم الرئيسي
INSERT INTO public.user_roles (user_id, role)
VALUES ('8690f924-acd6-49d8-9a6f-d10b2608f2ab', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- تحديث دور البروفايل
UPDATE public.profiles 
SET role = 'owner' 
WHERE id = '8690f924-acd6-49d8-9a6f-d10b2608f2ab';