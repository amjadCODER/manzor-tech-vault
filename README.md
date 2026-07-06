# Manzor Vault

واجهة داخلية لإدارة بيانات الجمعيات والحسابات والملفات وخطط المستخدمين.

## التشغيل المحلي

```bash
npm install --legacy-peer-deps --no-audit --no-fund
npm run dev
```

## النشر على Vercel

الإعدادات جاهزة داخل `vercel.json`:

- Install Command: `npm install --legacy-peer-deps --no-audit --no-fund`
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite

## Supabase

الربط جاهز داخل `src/lib/supabase.ts` ومعه ملف `.env.production`.

الجداول المطلوبة موجودة في:

```text
supabase/schema.sql
```

## الدخول

يدعم 10 أرقام ID:

```text
1001 إلى 1010
```

كل مستخدم له بروفايل مستقل للإنجاز اليومي والخطة الأسبوعية مع تصدير Excel وحذف البيانات.
