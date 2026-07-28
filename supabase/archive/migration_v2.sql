-- شغل هذا الملف مرة واحدة فقط على قاعدة البيانات الحالية. لا يحذف اي بيانات.
alter table organizations add column if not exists support_fund_status text default 'لم يبدأ';
alter table organizations add column if not exists support_fund_progress integer default 0 check (support_fund_progress between 0 and 100);
alter table organizations add column if not exists donors_ehsan_status text default 'لم يبدأ';
alter table organizations add column if not exists donors_ehsan_progress integer default 0 check (donors_ehsan_progress between 0 and 100);
alter table organizations add column if not exists other_funds_status text default 'لم يبدأ';
alter table organizations add column if not exists other_funds_progress integer default 0 check (other_funds_progress between 0 and 100);

delete from app_users;
insert into app_users (id, display_name, role, is_active) values
('1001','أمجاد','admin',true),
('1002','أمين','admin',true),
('1003','طلال','admin',true),
('1004','عماد','employee',true),
('1005','بشير','employee',true),
('1006','منير','employee',true),
('1007','عبد الوهاب','employee',true),
('1008','عهد','employee',true),
('1009','حساب المتدرب','trainee',true);
