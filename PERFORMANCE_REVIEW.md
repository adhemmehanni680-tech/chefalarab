# تقرير مراجعة الأداء والبيلد - شيف العرب

## نتيجة الاختبار

- `npm ci --ignore-scripts --no-audit --no-fund`: نجح.
- `npm run lint`: نجح بدون أخطاء.
- `npm run build`: نجح.
- حجم `.next` بعد الإصلاح والبيلد: حوالي `100M`.
- حجم `.next/cache`: حوالي `90K` بعد build نظيف.
- حجم `.next/standalone`: حوالي `85M`.

## أهم أسباب البطء وتضخم `.next` التي تم علاجها

1. `src/data/recipes.json` كان حجمه حوالي `34.5MB` وكان يتم استيراده داخل Client Components.
2. البحث العائم كان محملًا عالميًا من `RootClient` وكان يسحب ملف الوصفات الكامل في كل الصفحات.
3. صفحة الوصفة كانت تستورد ملف الوصفات الكامل داخل `RecipeClient`.
4. الصفحة الرئيسية كانت تتعامل مع بيانات وصفات كثيرة على الـ Client.
5. إعدادات الصور كانت تسمح بتوليد أحجام كبيرة جدًا، ولم يكن هناك حد لحجم كاش الصور.
6. Service Worker كان يستخدم cache-first للصفحات والطلبات، مما قد يسبب كاش زائد ومحتوى قديم.
7. صورة الهيرو `public/Heeder.webp` كانت كبيرة جدًا: `5824x3264` وحجمها حوالي `3.4MB`.
8. `next lint` غير مناسب مع Next 16، وتم التحويل إلى ESLint flat config.

## التعديلات الأساسية

- إنشاء `src/data/recipes-index.json` لصفحات الكروت والفلاتر بدل ملف الوصفات الكامل.
- إنشاء `src/data/recipes-search.json` للبحث فقط.
- إنشاء `src/lib/recipesData.ts` لقراءة `recipes.json` الكبير Server-only عبر `fs` بدل استيراده مباشرة.
- تعديل صفحة `/recipe/[slug]` حتى تصبح بيانات الوصفة و JSON-LD والوصفات المشابهة من السيرفر.
- تعديل البحث ليستخدم فهرس صغير بدل ملف 34.5MB.
- تعديل الصفحة الرئيسية حتى تستقبل أقسامًا جاهزة من السيرفر بدل تحميل كل الوصفات على العميل.
- تحسين `next.config.mjs`:
  - `output: "standalone"`
  - `reactStrictMode: true`
  - تقليل `deviceSizes` و `imageSizes`
  - `qualities: [70]`
  - `maximumDiskCacheSize: 300_000_000`
  - تعطيل SVG optimization غير الآمن
  - ضبط headers للكاش بدون لمس `_next/static`
- إصلاح `src/lib/ads.ts` حتى تكون الإعلانات مفعلة فقط عند `NEXT_PUBLIC_ADS_ENABLED=true`.
- تحسين `RootClient` باستخدام dynamic imports وتأجيل AdSense بعد التفاعل.
- تخفيف Service Worker حتى لا يكاش الصفحات وملفات Next والصور بشكل عدواني.
- إصلاح canonical والـ sitemap من `/recipes/[slug]` إلى `/recipe/[slug]`.
- تصغير `public/Heeder.webp` إلى `1920x1076` بحجم حوالي `0.46MB`.
- حذف ملف اختبار قديم `src/app/recipes/test.tsx` لأنه كان يستورد `public/recipes.json` غير موجود.

## ملاحظات مهمة قبل الرفع

- الأرشيف الذي تم فحصه لا يحتوي صور الوصفات داخل `public/uploads` ولا صور الكروت داخل `public/card`.
- كل مراجع صور الوصفات في JSON تقريبًا غير موجودة داخل الملفات المرفوعة، لذلك يجب رفع مجلدي:
  - `public/uploads`
  - `public/card`
- لا ترفع `node_modules` ولا `.next` إلى الاستضافة. شغل `npm ci` ثم `npm run build` على السيرفر أو في CI.
- عند استخدام `output: "standalone"` على سيرفر Node/Docker، انسخ `public` و `.next/static` بجانب `.next/standalone` حسب طريقة النشر.

## أوامر التشغيل

```bash
npm ci
npm run lint
npm run build
```

للتشغيل المحلي بعد البيلد:

```bash
node .next/standalone/server.js
```

أو لو هتستخدم `next start` مؤقتًا أثناء التجربة، اعرف أن Next سيحذر لأن المشروع مضبوط على `standalone`.
