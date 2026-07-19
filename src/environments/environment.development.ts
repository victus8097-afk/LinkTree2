// بيئة التطوير المحلية (ng serve).
// تعمل في "وضع العرض التجريبي" (localStorage) افتراضياً — اختبر بحرية.
//
// لتفعيل Supabase محلياً: املأ المفاتيح أدناه.
// لتفعيل Resend محلياً: شغّل خادم Vercel محلياً (`npx vercel dev`) وأضف RESEND_API_KEY.
export const environment = {
  production: false,
  appUrl: '', // يُكتشف تلقائياً
  supabaseUrl: '',
  supabaseAnonKey: '',

  // مثال: أزل التعليق وأضف مفاتيح Supabase لتجربة الاتصال الحقيقي
  // supabaseUrl: 'https://xxxxx.supabase.co',
  // supabaseAnonKey: 'eyJ...',
};
