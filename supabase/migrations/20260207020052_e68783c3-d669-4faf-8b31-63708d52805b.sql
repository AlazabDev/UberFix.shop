-- إنشاء ملفات شخصية للمستخدمين الحاليين الذين ليس لديهم ملف
-- مع تجنب الـ constraint violations
INSERT INTO public.profiles (id, email, name, avatar_url, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
  'user',
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.email = u.email)
ON CONFLICT DO NOTHING;