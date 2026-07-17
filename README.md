# وصلة (Wasla)

**وصلة** هي منصة عربية متكاملة (شبيهة بخدمات Linktree) تتيح للمبدعين وأصحاب المشاريع وصناع المحتوى العرب **جمع كل روابطهم وأعمالهم ومنصاتهم في صفحة شخصية واحدة أنيقة** تحمل رابطاً فريداً خاصاً بهم (مثل `wasla.app/maryam`)، يمكن مشاركته بسهولة في السير الذاتية وكل حسابات التواصل الاجتماعي.

> المشروع مبني بالكامل بإطار العمل **Angular** (مكوّنات مستقلة / Standalone) مع توجيه ديناميكي، ويدعم اللغة العربية واتجاه **RTL** وخط **Alexandria**.

---

## ✨ التقنيات المستخدمة (Tech Stack)

| الطبقة | التقنية |
|------|---------|
| واجهة المستخدم | **Angular 22** (Standalone Components + Signals + Control Flow الحديث) |
| التوجيه | **Angular Router** (توجيه ديناميكي لحماية الصفحات) |
| اللغة | **TypeScript** |
| التصميم | SCSS متجاوب بالكامل، RTL، خط Alexandria، تأثيرات وحركات حديثة |
| المصادقة وقاعدة البيانات | **Supabase** (PostgreSQL + مصادقة بريد بلا كلمة مرور عبر Magic Link) |
| النشر | **Vercel** عبر ملف `vercel.json` لضمان عمل روابط التوجيه (SPA) |

> 💡 **وضع العرض التجريبي:** إن لم تضبط بيانات Supabase، تعمل المنصة تلقائياً في وضع محلي يعتمد على `localStorage`، فيُمكنك تجربة كل المزايا (التسجيل، إنشاء الصفحة، إضافة الروابط) بدون خادم.

---

## 🧭 الأقسام والصفحات

| المسار | الصفحة | الوصف |
|------|--------|-------|
| `/` | الصفحة الرئيسية (Landing) | شريط تنقّل، قسم بارز بمعاينة الهاتف، المميزات، خطوات العمل، ونافذة تسجيل الدخول. |
| `/onboarding` | إنشاء الملف الشخصي | تحديد الاسم الظاهر، الرابط الخاص (مع تحقق فوري من توفره)، والنبذة. **محميّة**. |
| `/dashboard` | لوحة التحكم | إدارة الروابط، نسخ رابط الصفحة، معاودة المعاينة، وتعديل بيانات الحساب. **محميّة**. |
| `/:handle` | الصفحة العامة | ما يراه الجمهور: الصورة، الاسم، شارة التحقق، النبذة، وقائمة الروابط. |

**حماية الصفحات (Auth Guards):** لا يمكن الوصول إلى `/dashboard` و `/onboarding` دون تسجيل دخول؛ ويُحوَّل الزائر تلقائياً إلى الصفحة الرئيسية (أو إلى صفحة الإعداد إن لم يكن لديه ملف شخصي بعد).

---

## 📁 بنية المشروع

```
src/
├── environments/            # إعدادات Supabase (إنتاج/تطوير)
│   ├── environment.ts
│   └── environment.development.ts
├── app/
│   ├── app.config.ts        # مزوّدات التطبيق (Router)
│   ├── app.routes.ts        # المسارات وحرّاسها
│   ├── app.ts / .html / .scss
│   ├── core/
│   │   ├── guards/          # auth.guard.ts · onboarding.guard.ts
│   │   ├── models/          # profile.model.ts · link.model.ts
│   │   └── services/        # supabase · auth · profile · link · ui
│   ├── features/
│   │   ├── landing/         # الصفحة الرئيسية
│   │   ├── onboarding/      # إنشاء الملف الشخصي
│   │   ├── dashboard/       # لوحة التحكم
│   │   └── profile/         # الصفحة العامة (:handle)
│   └── shared/components/   # navbar · footer · auth-modal
├── index.html               # RTL + خط Alexandria + بيانات وصفية
├── styles.scss              # نظام التصميم العام (المتغيرات والأزرار والحقول)
└── main.ts
vercel.json                  # إعدادات النشر على Vercel
supabase/schema.sql          # مخطط قاعدة البيانات وسياسات الوصول (RLS)
```

---

## 🚀 البدء

```bash
# 1) تثبيت الحزم
npm install

# 2) تشغيل خادم التطوير (يعمل وضع العرض التجريبي تلقائياً بدون Supabase)
npm start
# ثم افتح: http://localhost:4200

# 3) بناء نسخة الإنتاج
npm run build      # المخرجات في dist/wasla/browser
```

---

## 🔐 ربط Supabase (اختياري للإنتاج)

1. أنشئ مشروعاً على [supabase.com](https://supabase.com).
2. شغّل سكربت `supabase/schema.sql` داخل **SQL Editor** لإنشاء جداول `profiles` و `links` وسياسات الوصول.
3. في إعدادات المشروع → **Authentication → URL Configuration** أضف `http://localhost:4200` و رابط الإنتاج إلى "Redirect URLs".
4. انسخ رابط المشروع (Project URL) والمفتاح العام (anon key)، ثم ضعهما في:
   - `src/environments/environment.ts` (للإنتاج)
   - `src/environments/environment.development.ts` (للتطوير)

```ts
export const environment = {
  production: true,
  appUrl: 'https://wasla.app',
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR-ANON-KEY',
};
```

> عند ضبط القيمتين، تتحوّل المنصة تلقائياً من وضع التخزين المحلي إلى Supabase الحقيقي (مصادقة Magic Link + قاعدة بيانات PostgreSQL).

---

## 🌐 النشر على Vercel

تم تجهيز المشروع مسبقاً عبر `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/wasla/browser",
  "framework": "angular",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

اربط المستودع في Vercel وستُبنى الصفحات تلقائياً. أضف متغيّري البيئة `SUPABASE_URL` و `SUPABASE_ANON_KEY` عند الحاجة (أو عدّل ملف `environment.ts` مباشرة قبل النشر).

---

## 🧩 كيف تعمل المصادقة؟

- يدخل المستخدم بريده الإلكتروني في **نافذة تسجيل الدخول** (Auth Modal).
- يُرسَل **رابط سحري (Magic Link)** عبر `signInWithOtp` من Supabase؛ وعند فتحه يُسجَّل الدخول تلقائياً.
- في وضع العرض التجريبي يُسجَّل الدخول فوراً لتجربة سريعة.
- حرّاس المسارات (`authGuard` / `onboardingGuard`) ينتظرون اكتمال قراءة الجلسة قبل اتخاذ القرار، فلا يُرمى المستخدم المسجَّل خارج الصفحات المحميّة عند التحديث.

---

## 📝 ملاحظات

- التصميم متجاوب بالكامل ويدعم RTL باستخدام الخصائص المنطقية (مثل `margin-inline`).
- كل المكوّنات **Standalone** مع تحميل كسول (Lazy Loading) للصفحات لتقليل حجم الحزمة الأولية.
- الكود مُحصَّن بأنواع TypeScript الصارمة وتحقّق قوالب AOT.

صُنع بحب 💜 لربط المحتوى العربي.
