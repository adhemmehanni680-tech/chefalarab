# تشغيل ونشر شيف العرب

## المتطلبات

- Node.js 20.9 أو أحدث.
- npm متصل بسجل الحزم.
- استعادة صور الوصفات داخل `public/uploads` و`public/card`.
- استعادة صور الإعلانات المحلية داخل `public/ads` عند استخدامها.

## الإعداد

```bash
npm ci
cp .env.example .env.local
npm run audit:strict
npm run check
```

في Windows PowerShell استخدم:

```powershell
Copy-Item .env.example .env.local
npm ci
npm run audit:strict
npm run check
```

## بناء نظيف

```bash
npm run build:clean
```

أمر البناء يقوم تلقائيًا بما يلي:

1. تحديث ملفات الفهرسة الخفيفة للوصفات.
2. بناء Next.js بنمط `standalone`.
3. نسخ `public` و`.next/static` داخل مجلد standalone.

## التشغيل

```bash
npm start
```

الملف الذي يتم تشغيله هو:

```text
.next/standalone/server.js
```

يمكن ضبط المنفذ قبل التشغيل:

```bash
PORT=3000 npm start
```

## تحديث الوصفات

بعد تعديل `src/data/recipes.json` شغّل:

```bash
npm run data:generate
```

أوامر `dev` و`build` تقوم بهذه الخطوة تلقائيًا.
