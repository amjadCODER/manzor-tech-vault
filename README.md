# Manzor Tech Vault

نسخة Vault مرتبطة بمشروع Supabase المشترك الخاص بـ Mail Sender، مع فصل كامل لبيانات Vault داخل PostgreSQL schema باسم `manzor_vault` وBucket باسم `vault-files`.

## الإعداد مرة واحدة

1. افتحي مشروع Mail Sender في Supabase.
2. افتحي SQL Editor.
3. شغلي الملف:
   `supabase/vault_schema_for_mail_sender.sql`
4. من إعدادات API أضيفي `manzor_vault` إلى **Exposed schemas** ثم احفظي.
5. ارفعي المشروع إلى Git/Vercel.

## متغيرات Vercel

```env
VITE_SUPABASE_URL=https://udasfetzhftousewwtwp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_qKBo6Nd1Her3KWFCUBPUJw_CniAY8c5
```

## فصل البيانات

- جداول Vault: `manzor_vault.*`
- ملفات Vault: Storage bucket `vault-files`
- جداول Mail Sender في `public` أو أي schema أخرى لا يتم تعديلها.

## تنبيه

لا تشغلي ملفات `schema.sql` القديمة على مشروع Mail Sender. الملف المخصص والآمن لهذه النسخة هو `vault_schema_for_mail_sender.sql` فقط.
