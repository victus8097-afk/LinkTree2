// بيئة الإنتاج (Vercel / Coolify).
// المنصة تعمل في "وضع العرض التجريبي" (localStorage) بشكل افتراضي — لا تحتاج أي إعدادات.
//
// لتفعيل Supabase (قاعدة بيانات + جلسات):
//   1. املأ supabaseUrl و supabaseAnonKey بمفاتيح مشروعك
// لتفعيل Resend (إرسال بريد magic link):
//   1. أضف RESEND_API_KEY في متغيرات بيئة Vercel / Coolify
//   2. أضف RESEND_FROM (اختياري) — البريد المرسِل، مثلاً "Wasla <noreply@yourdomain.com>"
//   3. لا تنسَ توثيق نطاقك في لوحة تحكم Resend
//
// لا تغيّر appUrl — المنصة تكتشف الرابط تلقائياً (Vercel *.vercel.app أو Coolify).
export const environment = {
  production: true,
  appUrl: '', // يُكتشف تلقائياً من window.location.origin
  supabaseUrl: '',
  supabaseAnonKey: '',
};
