import { supabase } from './supabase';
import { localOrganizations } from '../data/organizations';
import type { Account, AppUser, Attachment, Organization, SiteLink } from '../types';

const fallbackUsers: AppUser[] = [
  { id: '1001', name: 'أمجاد', role: 'admin' }, { id: '1002', name: 'أمين', role: 'admin' },
  { id: '1003', name: 'طلال', role: 'admin' }, { id: '1004', name: 'عماد', role: 'employee' },
  { id: '1005', name: 'بشير', role: 'employee' }, { id: '1006', name: 'منير', role: 'employee' },
  { id: '1007', name: 'عبد الوهاب', role: 'employee' }, { id: '1008', name: 'عهد', role: 'employee' },
  { id: '1009', name: 'حساب المتدرب', role: 'trainee' }
];

function message(error: unknown) {
  return error instanceof Error ? error.message : 'حدث خطأ غير معروف';
}
function cleanOrganization(row: Organization) {
  return {
    id: row.id, name: row.name, system_url: row.system_url || null, official_email: row.official_email || null,
    channel: row.channel || null, city: row.city || null, manager: row.manager || null, phone: row.phone || null,
    domain: row.domain || null, relationship_start: row.relationship_start || null,
    financial_commitment: Boolean(row.financial_commitment), financial_amount: Number(row.financial_amount || 0),
    financial_note: row.financial_note || null, notes: row.notes || null,
    support_fund_status: row.support_fund_status || 'لم يبدأ', support_fund_progress: Number(row.support_fund_progress || 0),
    donors_ehsan_status: row.donors_ehsan_status || 'لم يبدأ', donors_ehsan_progress: Number(row.donors_ehsan_progress || 0),
    other_funds_status: row.other_funds_status || 'لم يبدأ', other_funds_progress: Number(row.other_funds_progress || 0)
  };
}
async function logAction(organizationId: string, userName: string, action: string) {
  const { error } = await supabase.from('activity_log').insert({ organization_id: organizationId, user_name: userName, action });
  if (error) console.warn('تعذر تسجيل النشاط', error.message);
}

export async function loadUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase.from('app_users').select('id, display_name, role, is_active').eq('is_active', true).order('id');
  if (error || !data?.length) return fallbackUsers;
  return data.map((r: any) => ({ id: r.id, name: r.display_name, role: r.role }));
}
export async function loadOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase.from('organizations').select('*').order('name');
  if (error) throw new Error(`تعذر تحميل الجمعيات: ${error.message}`);
  if (data?.length) return data;
  const seedRows = (localOrganizations as unknown as Organization[]).map(cleanOrganization);
  const seeded = await supabase.from('organizations').upsert(seedRows, { onConflict: 'id' }).select('*').order('name');
  if (seeded.error) throw new Error(`تعذر تهيئة الجمعيات: ${seeded.error.message}`);
  return seeded.data || [];
}
export async function loadAccounts(organizationId: string): Promise<Account[]> {
  const { data, error } = await supabase.from('organization_accounts').select('*').eq('organization_id', organizationId).order('provider');
  if (error) throw new Error(`تعذر تحميل الحسابات: ${error.message}`); return data || [];
}
export async function loadSites(organizationId: string): Promise<SiteLink[]> {
  const { data, error } = await supabase.from('organization_sites').select('*').eq('organization_id', organizationId).order('title');
  if (error) throw new Error(`تعذر تحميل الروابط: ${error.message}`); return data || [];
}
export async function loadAttachments(organizationId: string): Promise<Attachment[]> {
  const { data, error } = await supabase.from('organization_files').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
  if (error) throw new Error(`تعذر تحميل المرفقات: ${error.message}`); return data || [];
}
export async function saveOrganization(input: Organization, userName: string): Promise<Organization> {
  const payload = { ...cleanOrganization(input), last_update: new Date().toISOString(), last_updated_by: userName };
  const { data, error } = await supabase.from('organizations').upsert(payload).select().single();
  if (error) throw new Error(`تعذر حفظ الجمعية: ${error.message}`); await logAction(input.id, userName, 'حفظ بيانات الجمعية'); return data;
}
export async function deleteOrganization(id: string, userName: string) {
  const files = await loadAttachments(id);
  if (files.length) {
    const paths = files.map(f => f.file_path).filter(Boolean);
    const removed = await supabase.storage.from('vault-files').remove(paths);
    if (removed.error) throw new Error(`تعذر حذف ملفات الجمعية: ${removed.error.message}`);
  }
  await logAction(id, userName, 'حذف الجمعية');
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  if (error) throw new Error(`تعذر حذف الجمعية: ${error.message}`);
}
export async function saveAccount(input: Omit<Account, 'id'> & { id?: string }, userName: string): Promise<Account> {
  const row = { ...input, id: input.id || crypto.randomUUID() };
  const { data, error } = await supabase.from('organization_accounts').upsert(row).select().single();
  if (error) throw new Error(`تعذر حفظ الحساب: ${error.message}`); await logAction(row.organization_id, userName, `حفظ حساب: ${row.provider}`); return data;
}
export async function deleteAccount(row: Account, userName: string) {
  const { error } = await supabase.from('organization_accounts').delete().eq('id', row.id);
  if (error) throw new Error(`تعذر حذف الحساب: ${error.message}`); await logAction(row.organization_id, userName, `حذف حساب: ${row.provider}`);
}
export async function saveSite(input: Omit<SiteLink, 'id'> & { id?: string }, userName: string): Promise<SiteLink> {
  const row = { ...input, id: input.id || crypto.randomUUID() };
  const { data, error } = await supabase.from('organization_sites').upsert(row).select().single();
  if (error) throw new Error(`تعذر حفظ الرابط: ${error.message}`); await logAction(row.organization_id, userName, `حفظ رابط: ${row.title}`); return data;
}
export async function deleteSite(row: SiteLink, userName: string) {
  const { error } = await supabase.from('organization_sites').delete().eq('id', row.id);
  if (error) throw new Error(`تعذر حذف الرابط: ${error.message}`); await logAction(row.organization_id, userName, `حذف رابط: ${row.title}`);
}
export async function uploadAttachment(organizationId: string, file: File, category: string, userName: string): Promise<Attachment> {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'file';
  const safeName = `${organizationId}/${crypto.randomUUID()}.${extension}`;
  const uploaded = await supabase.storage.from('vault-files').upload(safeName, file, { contentType: file.type || undefined, upsert: false });
  if (uploaded.error) throw new Error(`تعذر رفع الملف: ${uploaded.error.message}`);
  const inserted = await supabase.from('organization_files').insert({ organization_id: organizationId, title: file.name, category, file_path: safeName, file_type: file.type, uploaded_by: userName }).select().single();
  if (inserted.error) { await supabase.storage.from('vault-files').remove([safeName]); throw new Error(`تعذر تسجيل الملف: ${inserted.error.message}`); }
  await logAction(organizationId, userName, `رفع ملف: ${file.name}`); return inserted.data;
}
export async function deleteAttachment(row: Attachment, userName: string) {
  const removed = await supabase.storage.from('vault-files').remove([row.file_path]);
  if (removed.error) throw new Error(`تعذر حذف الملف من التخزين: ${removed.error.message}`);
  const { error } = await supabase.from('organization_files').delete().eq('id', row.id);
  if (error) throw new Error(`تعذر حذف سجل الملف: ${error.message}`); await logAction(row.organization_id, userName, `حذف ملف: ${row.title}`);
}
export async function getAttachmentUrl(filePath: string) {
  const { data, error } = await supabase.storage.from('vault-files').createSignedUrl(filePath, 60 * 15);
  if (error) throw new Error(`تعذر فتح الملف: ${error.message}`); return data.signedUrl;
}
export async function saveOrganizationsBulk(rows: Organization[], userName: string) {
  const payload = rows.map(row => ({ ...cleanOrganization(row), last_update: new Date().toISOString(), last_updated_by: userName }));
  const { data, error } = await supabase.from('organizations').upsert(payload, { onConflict: 'id' }).select();
  if (error) throw new Error(`تعذر استيراد الجمعيات: ${message(error)}`);
  await Promise.all(rows.map(row => logAction(row.id, userName, 'استيراد جماعي'))); return data || [];
}
