create extension if not exists pgcrypto;

drop table if exists weekly_plans cascade;
drop table if exists daily_tasks cascade;
drop table if exists activity_log cascade;
drop table if exists organization_files cascade;
drop table if exists organization_sites cascade;
drop table if exists organization_accounts cascade;
drop table if exists organizations cascade;
drop table if exists app_users cascade;

create table app_users (
  id text primary key,
  display_name text not null,
  role text not null default 'employee',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table organizations (
  id text primary key,
  name text not null,
  system_url text,
  official_email text,
  channel text,
  city text,
  manager text,
  phone text,
  domain text,
  relationship_start date,
  financial_commitment boolean not null default false,
  financial_amount numeric(12,2) not null default 0,
  financial_note text,
  last_update timestamptz not null default now(),
  last_updated_by text,
  notes text,
  created_at timestamptz not null default now()
);

create table organization_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references organizations(id) on delete cascade,
  provider text not null,
  username text,
  password text,
  url text,
  created_at_text text,
  owner_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table organization_sites (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references organizations(id) on delete cascade,
  title text not null,
  url text not null,
  note text,
  created_at timestamptz not null default now()
);

create table organization_files (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references organizations(id) on delete cascade,
  title text not null,
  category text not null default 'عام',
  file_path text not null,
  file_type text,
  uploaded_by text,
  created_at timestamptz not null default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id text references organizations(id) on delete cascade,
  user_name text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create table daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  task_number integer not null,
  task_text text not null,
  task_date date not null default current_date,
  task_time time not null default localtime,
  created_at timestamptz not null default now()
);

create table weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references app_users(id) on delete cascade,
  plan_text text not null,
  output_name text,
  output_count integer default 1,
  beneficiary text,
  plan_date date not null default current_date,
  week_start date not null default current_date,
  created_at timestamptz not null default now()
);

insert into app_users (id, display_name, role) values
('1001','أمجاد','admin'),
('1002','أمين','employee'),
('1003','عماد','employee'),
('1004','سحاب','employee'),
('1005','وعد','employee'),
('1006','عهد','employee'),
('1007','مازن','employee'),
('1008','معتصم','employee'),
('1009','طلال','employee'),
('1010','منظور تقني','employee');

insert into storage.buckets (id, name, public)
values ('organization-files', 'organization-files', false)
on conflict (id) do nothing;

alter table app_users enable row level security;
alter table organizations enable row level security;
alter table organization_accounts enable row level security;
alter table organization_sites enable row level security;
alter table organization_files enable row level security;
alter table activity_log enable row level security;
alter table daily_tasks enable row level security;
alter table weekly_plans enable row level security;

create policy "read app users" on app_users for select using (true);
create policy "read organizations" on organizations for select using (true);
create policy "write organizations" on organizations for all using (true) with check (true);
create policy "read accounts" on organization_accounts for select using (true);
create policy "write accounts" on organization_accounts for all using (true) with check (true);
create policy "read sites" on organization_sites for select using (true);
create policy "write sites" on organization_sites for all using (true) with check (true);
create policy "read files" on organization_files for select using (true);
create policy "write files" on organization_files for all using (true) with check (true);
create policy "read activity" on activity_log for select using (true);
create policy "write activity" on activity_log for insert with check (true);
create policy "read daily" on daily_tasks for select using (true);
create policy "write daily" on daily_tasks for all using (true) with check (true);
create policy "read weekly" on weekly_plans for select using (true);
create policy "write weekly" on weekly_plans for all using (true) with check (true);

create policy "storage read files" on storage.objects for select using (bucket_id = 'organization-files');
create policy "storage upload files" on storage.objects for insert with check (bucket_id = 'organization-files');
create policy "storage update files" on storage.objects for update using (bucket_id = 'organization-files') with check (bucket_id = 'organization-files');
create policy "storage delete files" on storage.objects for delete using (bucket_id = 'organization-files');

create index idx_accounts_org on organization_accounts(organization_id);
create index idx_sites_org on organization_sites(organization_id);
create index idx_files_org on organization_files(organization_id);
create index idx_daily_user_date on daily_tasks(user_id, task_date);
create index idx_weekly_user_date on weekly_plans(user_id, plan_date);
