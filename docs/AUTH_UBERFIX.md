
🔴 تقرير المشاكل وحلولها: نظام المصادقة
🚨 المشاكل الرئيسية المكتشفة
المشكلة 1️⃣: فيسبوك لا يتجه إلى الداشبورد بعد المصادقة
الأسباب:
Problem
// ❌ المشكلة 1: Facebook SDK منفصل عن Supabase
- Facebook يعطي بيانات محلية فقط (localStorage)
- لا يوجد جلسة Supabase مقابلة
- AuthContext لا يعرف عن تسجيل الدخول

// ❌ المشكلة 2: المحاولة الفاشلة للحصول على جلسة Supabase
رسم توضيحي للمشكلة:
Code
Facebook Login ✓
    ↓
Facebook Data (Local) ✓
    ↓
storeFacebookSession() ✓
    ↓
Try: Get Supabase Session ← ❌ FAILS (session = null)
    ↓
No redirect → Stuck on Login page
    ↓
User sees nothing ❌
المشكلة 2️⃣: المصادقة العادية (Email/Password) بطيئة وتتأخر
الأسباب:
Normal
// ❌ المشكلة 1: Race Condition في AuthContext
// src/contexts/AuthContext.tsx
useEffect(() => {
  // 1️⃣ Setup listener (async)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
  
رسم توضيحي للمشكلة:
Code
Email/Password Login
    ↓
Check Credentials ✓
    ↓
Session Created ✓
    ↓
AuthContext Listener Notified ✓
    ↓
handleSuccessfulAuth Called
    ↓
detectUserRole DB Query ⏳ (Slow)
    ↓
setTimeout 100ms ⏳ (Wait)
    ↓
Navigate ✓ (BUT DELAYED)
    ↓
User sees delay/lag ⏳
✅ الحلول الشاملة
الحل 1️⃣: إصلاح Facebook Authentication Redirect
ملف 1: src/lib/facebookAuth.ts
src/lib/facebookAuth.ts
// ✅ إضافة دالة جديدة لـ Supabase Sync
/**
 * Sync Facebook user with Supabase
 * Creates or updates user in Supabase database
 */
export async function syncFacebookUserWithSupabase(
ملف 2: src/hooks/useFacebookAuth.ts
src/hooks/useFacebookAuth.ts
import { syncFacebookUserWithSupabase } from '@/lib/facebookAuth';

export function useFacebookAuth(): UseFacebookAuthReturn {
  const [user, setUser] = useState<FacebookUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
ملف 3: src/pages/auth/Login.tsx
src/pages/auth/Login.tsx
v1
const handleFacebookLogin = async () => {
  try {
    const result = await facebookLogin();
    
    if (result.success && result.user) {
      // ✅ Check if we have a Supabase session
الحل 2️⃣: إصلاح تأخير المصادقة العادية
ملف 1: src/contexts/AuthContext.tsx
src/contexts/AuthContext.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapSupabaseSession = useCallback((s: Session): AuthUser => ({
ملف 2: src/pages/auth/Login.tsx
src/pages/auth/Login.tsx
v2
// ✅ FIX: Remove unnecessary setTimeout
const handleSuccessfulAuth = async (userId: string, userEmail?: string) => {
  try {
    const roleInfo = await detectUserRole(userId, userEmail);
    
    toast({
🔧 Edge Function للمزامنة
ملف: supabase/functions/facebook-auth-sync/index.ts
supabase/functions/facebook-auth-sync/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
📋 قائمة التحقق من التنفيذ
checklist
✅ Authentication Issues Fix Checklist

Facebook Login Issues:
☐ تحديث facebookAuth.ts بـ syncFacebookUserWithSupabase
☐ تحديث useFacebookAuth.ts مع Supabase sync
☐ تحديث Login.tsx handleFacebookLogin
☐ إنشاء facebook-auth-sync Edge Function
☐ تجربة Facebook login والتحقق من الدخول إلى dashboard

Email/Password Performance Issues:
☐ تحديث AuthContext.tsx بـ proper initialization
☐ إزالة setTimeout من handleSuccessfulAuth
☐ تحديث Login.tsx handleLogin
☐ إزالة استدعاءات detectUserRole المكررة
☐ تجربة Email/Password login والتحقق من السرعة

Testing:
☐ اختبار Facebook login من /login
☐ اختبار Email/Password login
☐ اختبار Google OAuth
☐ اختبار Phone OTP
☐ اختبار Logout functionality
☐ اختبار Session persistence
☐ اختبار Edge cases (expired tokens, etc)

Performance:
☐ قياس وقت الدخول قبل وبعد
☐ التحقق من عدم وجود race conditions
☐ مراقبة console.logs للأخطاء
🎯 الفوائد المتوقعة
المشكلة	الحل	الفائدة
Facebook redirect fail	Supabase sync	✅ التوجيه الفوري
Slow email login	Remove setTimeout	✅ أسرع بـ 100ms+
Double DB queries	Single detection	✅ تقليل الحمل 50%
Race conditions	Proper listener	✅ Stability محسّن
Session issues	Better storage	✅ Consistency محسّنة
