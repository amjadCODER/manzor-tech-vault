import { supabase } from './supabase';
import { localOrganizations } from '../data/organizations';
import type { Account, AppUser, Attachment, DailyTask, Organization, SiteLink, WeeklyPlan } from '../types';

const storeKey = 'manzor-tech-vault';

const fallbackUsers: AppUser[] = [
  { id: '1001', name: 'أمجاد', role: 'admin' },
  { id: '1002', name: 'أمين', role: 'employee' },
  { id: '1003', name: 'عماد', role: 'employee' },
  { id: '1004', name: 'بشير', role: 'employee' },
  { id: '1005', name: 'عبدالوهاب', role: 'employee'},
  { id: '1006', name: 'عهد', role: 'employee' },
  { id: '1007', name: 'نجود', role: 'employee' },
  { id: '1008', name: 'منير', role: 'employee' },
  { id: '1009', name: 'طلال', role: 'employee' },
  { id: '1010', name: 'فاطمة', role: 'employee' }
];

type LocalStore = {
  organizations: Organization[];
  accounts: Account[];
  sites: SiteLink[];
  files: Attachment[];
  dailyTasks: DailyTask[];
  weeklyPlans: WeeklyPlan[];
};

function readStore(): LocalStore {
  const saved = localStorage.getItem(storeKey);
  if (saved) return JSON.parse(saved);
  return {
    organizations: [...localOrganizations] as Organization[],
    accounts: [],
    sites: ([...localOrganizations] as Organization[])
      .filter(o => o.system_url)
      .map(o => ({ id: `${o.id}-site-1`, organization_id: o.id, title: 'رابط النظام', url: o.system_url || '' })),
    files: [],
    dailyTasks: [],
    weeklyPlans: []
  };
}

function writeStore(data: LocalStore) {
  localStorage.setItem(storeKey, JSON.stringify(data));
}

function cleanOrganization(row: Organization) {
  return {
    id: row.id,
    name: row.name,
    system_url: row.system_url || null,
    official_email: row.official_email || null,
    channel: row.channel || null,
    city: row.city || null,
    manager: row.manager || null,
    phone: row.phone || null,
    domain: row.domain || null,
    relationship_start: row.relationship_start || null,
    financial_commitment: Boolean(row.financial_commitment),
    financial_amount: row.financial_amount || 0,
    financial_note: row.financial_note || null,
    last_update: row.last_update || new Date().toISOString(),
    last_updated_by: row.last_updated_by || 'منظور تقني',
    notes: row.notes || null
  };
}

export async function loadUsers(): Promise<AppUser[]> {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, display_name, role, is_active')
      .eq('is_active', true)
      .order('id');
    if (error) throw error;
    if (!data?.length) return fallbackUsers;
    return data.map(row => ({ id: row.id, name: row.display_name, role: row.role }));
  } catch {
    return fallbackUsers;
  }
}

export async function loadOrganizations(): Promise<Organization[]> {
  try {
    const { data, error } = await supabase.from('organizations').select('*').order('id');
    if (error) throw error;
    if (data?.length) return data;

    const seedRows = (localOrganizations as unknown as Organization[]).map(cleanOrganization);
    const seeded = await supabase.from('organizations').upsert(seedRows, { onConflict: 'id' }).select('*').order('id');
    if (seeded.error) throw seeded.error;
    return seeded.data || seedRows;
  } catch {
    return readStore().organizations;
  }
}

export async function loadAccounts(organizationId: string): Promise<Account[]> {
  try {
    const { data, error } = await supabase.from('organization_accounts').select('*').eq('organization_id', organizationId).order('provider');
    if (error) throw error;
    return data || [];
  } catch {
    return readStore().accounts.filter(a => a.organization_id === organizationId);
  }
}

export async function loadSites(organizationId: string): Promise<SiteLink[]> {
  try {
    const { data, error } = await supabase.from('organization_sites').select('*').eq('organization_id', organizationId).order('title');
    if (error) throw error;
    return data || [];
  } catch {
    return readStore().sites.filter(s => s.organization_id === organizationId);
  }
}

export async function loadAttachments(organizationId: string): Promise<Attachment[]> {
  try {
    const { data, error } = await supabase.from('organization_files').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return readStore().files.filter(f => f.organization_id === organizationId);
  }
}

export async function saveOrganization(input: Organization, userName: string) {
  const payload = { ...cleanOrganization(input), last_update: new Date().toISOString(), last_updated_by: userName };
  try {
    const { data, error } = await supabase.from('organizations').upsert(payload).select().single();
    if (error) throw error;
    await logAction(input.id, userName, 'تحديث بيانات الجمعية');
    return data;
  } catch {
    const data = readStore();
    data.organizations = data.organizations.map(o => o.id === input.id ? payload : o);
    writeStore(data);
    return payload;
  }
}

export async function saveAccount(input: Omit<Account, 'id'> & { id?: string }, userName: string) {
  const row = { ...input, id: input.id || crypto.randomUUID() } as Account;
  try {
    const { data, error } = await supabase.from('organization_accounts').upsert(row).select().single();
    if (error) throw error;
    await logAction(row.organization_id, userName, `تسجيل حساب: ${row.provider}`);
    return data;
  } catch {
    const data = readStore();
    data.accounts = [...data.accounts.filter(a => a.id !== row.id), row];
    writeStore(data);
    return row;
  }
}

export async function saveSite(input: Omit<SiteLink, 'id'> & { id?: string }, userName: string) {
  const row = { ...input, id: input.id || crypto.randomUUID() } as SiteLink;
  try {
    const { data, error } = await supabase.from('organization_sites').upsert(row).select().single();
    if (error) throw error;
    await logAction(row.organization_id, userName, `تسجيل رابط: ${row.title}`);
    return data;
  } catch {
    const data = readStore();
    data.sites = [...data.sites.filter(s => s.id !== row.id), row];
    writeStore(data);
    return row;
  }
}

export async function uploadAttachment(organizationId: string, file: File, category: string, userName: string) {
  const safeName = `${organizationId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  try {
    const uploaded = await supabase.storage.from('organization-files').upload(safeName, file, { upsert: false });
    if (uploaded.error) throw uploaded.error;
    const { data, error } = await supabase.from('organization_files').insert({ organization_id: organizationId, title: file.name, category, file_path: safeName, file_type: file.type, uploaded_by: userName }).select().single();
    if (error) throw error;
    await logAction(organizationId, userName, `رفع ملف: ${file.name}`);
    return data;
  } catch {
    const data = readStore();
    const row: Attachment = { id: crypto.randomUUID(), organization_id: organizationId, title: file.name, category, file_path: URL.createObjectURL(file), file_type: file.type, uploaded_by: userName, created_at: new Date().toISOString() };
    data.files = [row, ...data.files];
    writeStore(data);
    return row;
  }
}

export async function getAttachmentUrl(filePath: string) {
  if (filePath.startsWith('blob:') || filePath.startsWith('http')) return filePath;
  const { data } = await supabase.storage.from('organization-files').createSignedUrl(filePath, 60 * 10);
  return data?.signedUrl || '';
}

export async function loadDailyTasks(userId: string): Promise<DailyTask[]> {
  try {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('task_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return readStore().dailyTasks.filter(item => item.user_id === userId);
  }
}

export async function addDailyTask(userId: string, taskText: string): Promise<DailyTask> {
  const local = readStore();
  const nextNumber = local.dailyTasks.filter(item => item.user_id === userId).length + 1;
  try {
    const { count } = await supabase.from('daily_tasks').select('id', { count: 'exact', head: true }).eq('user_id', userId);
    const task_number = (count || 0) + 1;
    const { data, error } = await supabase
      .from('daily_tasks')
      .insert({ user_id: userId, task_number, task_text: taskText })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    const now = new Date();
    const row: DailyTask = {
      id: crypto.randomUUID(),
      user_id: userId,
      task_number: nextNumber,
      task_text: taskText,
      task_date: now.toISOString().slice(0, 10),
      task_time: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      created_at: now.toISOString()
    };
    local.dailyTasks = [row, ...local.dailyTasks];
    writeStore(local);
    return row;
  }
}

export async function clearDailyTasks(userId: string) {
  try {
    const { error } = await supabase.from('daily_tasks').delete().eq('user_id', userId);
    if (error) throw error;
  } catch {
    const data = readStore();
    data.dailyTasks = data.dailyTasks.filter(item => item.user_id !== userId);
    writeStore(data);
  }
}

export async function loadWeeklyPlans(userId: string): Promise<WeeklyPlan[]> {
  try {
    const { data, error } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('user_id', userId)
      .order('plan_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return readStore().weeklyPlans.filter(item => item.user_id === userId);
  }
}

export async function addWeeklyPlan(input: { userId: string; planText: string; outputName: string; outputCount: number; beneficiary: string }): Promise<WeeklyPlan> {
  try {
    const { data, error } = await supabase
      .from('weekly_plans')
      .insert({
        user_id: input.userId,
        plan_text: input.planText,
        output_name: input.outputName || null,
        output_count: input.outputCount || 1,
        beneficiary: input.beneficiary || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    const now = new Date();
    const row: WeeklyPlan = {
      id: crypto.randomUUID(),
      user_id: input.userId,
      plan_text: input.planText,
      output_name: input.outputName || null,
      output_count: input.outputCount || 1,
      beneficiary: input.beneficiary || null,
      plan_date: now.toISOString().slice(0, 10),
      week_start: now.toISOString().slice(0, 10),
      created_at: now.toISOString()
    };
    const data = readStore();
    data.weeklyPlans = [row, ...data.weeklyPlans];
    writeStore(data);
    return row;
  }
}

export async function clearWeeklyPlans(userId: string) {
  try {
    const { error } = await supabase.from('weekly_plans').delete().eq('user_id', userId);
    if (error) throw error;
  } catch {
    const data = readStore();
    data.weeklyPlans = data.weeklyPlans.filter(item => item.user_id !== userId);
    writeStore(data);
  }
}

export async function logAction(organizationId: string, userName: string, action: string) {
  try {
    await supabase.from('activity_log').insert({ organization_id: organizationId, user_name: userName, action });
  } catch {
    return;
  }
}
