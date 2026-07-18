// بيئة الإنتاج (Vercel).
// عدّل بيانات Supabase الخاصة بمشروعك، أو اتركها فارغة لتعمل المنصة في "وضع العرض التجريبي"
// (تعتمد على تخزين المتصفح localStorage بدون خادم).
// لتفعيل إرسال البريد عبر Resend: أضف RESEND_API_KEY في إعدادات Vercel البيئية.
export const environment = {
  production: true,
  appUrl: 'https://wasla.app',
  supabaseUrl: '',
  supabaseAnonKey: '',
  resendConfigured: false, // يُضبط تلقائياً عند وجود /api/send-magic-link
};
