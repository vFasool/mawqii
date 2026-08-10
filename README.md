# موقعي — MVP

منصة SaaS عربية تتيح لأصحاب الأنشطة التجارية إنشاء موقع احترافي خلال دقائق.

## حالة المشروع: المرحلة 1 من 6 ✅

تم تنفيذها بالكامل في هذا التسليم:

- **إعداد المشروع**: Next.js 14 (App Router) + TypeScript (strict) + Tailwind CSS مع RTL كامل.
- **Database Schema حقيقي** في `supabase/migrations/` — الجداول: `profiles`, `businesses`,
  `business_images`, `templates`, `websites` — مع Row Level Security على كل جدول، بحيث
  لا يستطيع أي مستخدم قراءة أو تعديل بيانات مستخدم آخر (باستثناء المواقع المنشورة، وهي
  علنية بتصميمها).
- **نظام مصادقة حقيقي** عبر Supabase Auth: `/signup`, `/login`, تسجيل خروج، تأكيد بريد
  إلكتروني (`/auth/callback`)، عبر Server Actions حقيقية (وليست محاكاة) مع Zod validation.
- **حماية المسارات** عبر `middleware.ts`: أي زيارة لـ `/dashboard` بدون جلسة صالحة تُعاد
  توجيهها لـ `/login`، والعكس صحيح لمن هو مسجّل دخول بالفعل.
- **Landing Page** كاملة (Hero, أنواع الأنشطة, كيف تعمل, CTA, Footer) — Mobile-first
  ومتجاوبة بالكامل.
- **Dashboard** حقيقي (وليس تجريبيًا): يستعلم فعليًا من جدول `businesses` عبر Supabase
  مع Empty State حقيقي لمن لا يملك أي نشاط بعد.
- **Loading / Error / 404 states** حقيقية على مستوى Next.js (`loading.tsx`, `error.tsx`,
  `not-found.tsx`).
- **حماية مفاتيح API**: `SUPABASE_SERVICE_ROLE_KEY` و `ANTHROPIC_API_KEY` غير مسبوقين
  بـ `NEXT_PUBLIC_` عمدًا، ولا يُستوردان إلا من ملفات تعمل على السيرفر فقط
  (`src/lib/supabase/server.ts`)، فلا يصلان أبدًا لحزمة الـ JS التي تُشحن للمتصفح.

## ⚠️ Placeholders صريحة (ستُبنى في مراحل قادمة، لا تحتوي منطقًا وهميًا)

| المكان | الحالة |
|---|---|
| `/dashboard/create` | صفحة توضيحية فقط تشير إلى أن Wizard إنشاء النشاط جزء من المرحلة 2 |
| `templates.preview_image_url` | `null` في seed data — تُملأ بصور حقيقية بعد بناء القوالب في المرحلة 3 |
| زر "تحسين النص بالذكاء الاصطناعي" | لم يُبنَ بعد — Route Handler لـ Claude API مخطط له في المرحلة 6 |

لا يوجد أي **بيانات وهمية (mock data)** في مسارات وظيفية فعلية — كل استعلام في
`dashboard/page.tsx` مثلاً يقرأ من Supabase حقيقيًا عبر RLS.

## التشغيل محليًا

```bash
npm install
cp .env.local.example .env.local   # ثم املأ القيم الحقيقية من مشروع Supabase الخاص بك
```

### إعداد قاعدة البيانات

1. أنشئ مشروع Supabase جديد.
2. في SQL Editor، شغّل الملفات بالترتيب:
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_rls_policies.sql`
   - `supabase/migrations/0003_seed_templates.sql`
3. من Project Settings > API، انسخ `URL` و `anon key` و `service_role key` إلى `.env.local`.
4. في Authentication > URL Configuration، أضف `http://localhost:3000/auth/callback`
   ضمن Redirect URLs.

### تشغيل السيرفر

```bash
npm run dev
```

افتح `http://localhost:3000`.

## البنية

```
src/
  app/            # صفحات Next.js (App Router)
  components/
    ui/           # مكوّنات أساسية قابلة لإعادة الاستخدام
    landing/      # مكوّنات صفحة الهبوط فقط
    auth/         # نماذج المصادقة
  lib/
    supabase/     # clients: browser / server / middleware
    validations/  # Zod schemas
  types/          # أنواع TypeScript لقاعدة البيانات
supabase/
  migrations/     # SQL: schema + RLS + seed
```

## المراحل القادمة

2. Create Website Wizard (إدخال بيانات النشاط + رفع صور/شعار عبر Supabase Storage)
3. القوالب الخمسة الفعلية + صفحة اختيار القالب
4. محرر الموقع (نصوص/صور/ألوان/خط/ترتيب أقسام)
5. Live Preview + النشر + الصفحة العلنية للموقع
6. زر تحسين النص بالذكاء الاصطناعي (Claude API) + تلميع SEO/الحالات النهائية
