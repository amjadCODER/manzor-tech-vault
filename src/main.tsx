import React from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Upload, Download, KeyRound, Globe2, Image as ImageIcon, MessageSquare, StickyNote, CalendarDays, Wallet, UserRound, Copy, ExternalLink, Database, Plus, FolderOpen, Info, Phone, Mail, Link2, Building2, ArrowRight, Clock, Trash2, FileSpreadsheet, ClipboardList, Target, CheckCircle2, BarChart3, UserCog } from 'lucide-react';
import { addDailyTask, addWeeklyPlan, clearDailyTasks, clearWeeklyPlans, getAttachmentUrl, loadAccounts, loadAttachments, loadDailyTasks, loadOrganizations, loadSites, loadUsers, loadWeeklyPlans, saveAccount, saveOrganization, saveSite, uploadAttachment } from './lib/repository';
import type { Account, AppUser, Attachment, DailyTask, Organization, SiteLink, WeeklyPlan } from './types';
import './styles.css';

const fallbackUsers: AppUser[] = [
  { id: '1001', name: 'أمجاد' },
  { id: '1002', name: 'أمين' },
  { id: '1003', name: 'عماد' },
  { id: '1004', name: 'سحاب' },
  { id: '1005', name: 'وعد' },
  { id: '1006', name: 'عهد' },
  { id: '1007', name: 'مازن' },
  { id: '1008', name: 'معتصم' },
  { id: '1009', name: 'طلال' },
  { id: '1010', name: 'منظور تقني' }
];

const displayCards = [
  { key: 'data', label: 'البيانات', icon: Info },
  { key: 'sites', label: 'المواقع', icon: Globe2 },
  { key: 'accounts', label: 'الحسابات', icon: KeyRound },
  { key: 'identity', label: 'الهوية', icon: ImageIcon },
  { key: 'files', label: 'الملفات', icon: FolderOpen },
  { key: 'messages', label: 'المراسلات', icon: MessageSquare },
  { key: 'notes', label: 'الملاحظات', icon: StickyNote }
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[إأآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
}

function copy(value?: string | null) {
  if (value) navigator.clipboard.writeText(value);
}

function openUrl(url?: string | null) {
  if (!url) return;
  window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
}

function formatDate(value?: string | null) {
  if (!value) return 'غير محدد';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'غير محدد';
  return date.toLocaleDateString('ar-SA');
}

function relationshipText(value?: string | null) {
  if (!value) return 'غير محدد';
  const start = new Date(value);
  if (Number.isNaN(start.getTime())) return 'غير محدد';
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const rest = months % 12;
    return rest ? `${years} سنة و ${rest} شهر` : `${years} سنة`;
  }
  if (months > 0) return `${months} شهر`;
  const days = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / 86400000));
  return `${days} يوم`;
}

function Login({ onLogin }: { onLogin: (user: AppUser) => void }) {
  const [employeeId, setEmployeeId] = React.useState('');
  const [error, setError] = React.useState('');
  const [users, setUsers] = React.useState<AppUser[]>(fallbackUsers);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadUsers().then(setUsers).catch(() => setUsers(fallbackUsers));
  }, []);

  async function submit(event?: React.FormEvent) {
    event?.preventDefault();
    setLoading(true);
    const freshUsers = await loadUsers().catch(() => users);
    const user = freshUsers.find(item => item.id === employeeId.trim());
    setLoading(false);
    if (!user) {
      setError('رقم الايدي غير مسجل');
      return;
    }
    setError('');
    onLogin(user);
  }

  return <main className="loginPage">
    <section className="loginCard">
      <div className="brandMark"><img src="/manzor-vault-icon.png" alt="منظور تقني" /></div>
      <span className="appBadge">منظور تقني</span>
      <h1>منظور Vault</h1>
      <p>مركز بيانات الجمعيات والحسابات والملفات الداخلية</p>
      <form className="loginFields" onSubmit={submit}>
        <input inputMode="numeric" value={employeeId} onChange={e => setEmployeeId(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="ادخل رقم الايدي" autoFocus />
        {error && <span className="loginError">{error}</span>}
        <button className="primaryButton" type="submit" disabled={loading}>{loading ? 'جاري الدخول...' : 'دخول'}</button>
      </form>
      <div className="idHint">IDs: 1001 - 1010</div>
      <footer>نشر بواسطة منظور تقني | manzor tech</footer>
    </section>
  </main>;
}

function SmallMetric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return <div className="smallMetric"><Icon size={18}/><span>{label}</span><strong>{value}</strong></div>;
}

function Overview({ org, accounts, sites, files, onOpenEntry, onOpenPanel }: { org: Organization; accounts: Account[]; sites: SiteLink[]; files: Attachment[]; onOpenEntry: () => void; onOpenPanel: (panel: string) => void }) {
  const identity = files.filter(file => ['شعار','هوية','منشور'].includes(file.category));
  const count = (key: string) => key === 'accounts' ? accounts.length : key === 'sites' ? sites.length : key === 'identity' ? identity.length : key === 'files' ? files.length : undefined;
  return <section className="overview">
    <div className="overviewHero">
      <div>
        <span className="orgCode">{org.id}</span>
        <h2>{org.name}</h2>
        <p>الجمعية مشتركة منذ {relationshipText(org.relationship_start)}</p>
      </div>
      <button className="entryButton" onClick={onOpenEntry}><Database size={18}/> فتح لوحة الإدخال</button>
    </div>
    <div className="metricsGrid">
      <SmallMetric icon={CalendarDays} label="بداية الاشتراك" value={formatDate(org.relationship_start)} />
      <SmallMetric icon={Wallet} label="التزامات مالية" value={org.financial_commitment ? `${org.financial_amount || 0} ريال` : 'لا يوجد'} />
      <SmallMetric icon={UserRound} label="آخر إدخال بواسطة" value={org.last_updated_by || '—'} />
    </div>
    <div className="cardsGrid">
      {displayCards.map(card => {
        const Icon = card.icon;
        const total = count(card.key);
        return <button key={card.key} onClick={() => onOpenPanel(card.key)}><Icon/><strong>{card.label}</strong>{total !== undefined && <span>{total}</span>}</button>;
      })}
    </div>
  </section>;
}

function DisplayPanel({ panel, org, accounts, sites, files }: { panel: string; org: Organization; accounts: Account[]; sites: SiteLink[]; files: Attachment[] }) {
  if (panel === 'data') return <Panel title="بيانات الجمعية">
    <div className="infoGrid">
      <InfoRow icon={Building2} label="اسم الجمعية" value={org.name} />
      <InfoRow icon={CalendarDays} label="الجمعية مشتركة منذ" value={relationshipText(org.relationship_start)} />
      <InfoRow icon={Phone} label="رقم التواصل" value={org.phone || org.channel || '—'} copyable />
      <InfoRow icon={Mail} label="الإيميل الرسمي" value={org.official_email || '—'} copyable />
      <InfoRow icon={Link2} label="الدومين" value={org.domain || org.system_url || '—'} copyable openable />
      <InfoRow icon={Wallet} label="الالتزامات المالية" value={org.financial_commitment ? `${org.financial_amount || 0} ريال - ${org.financial_note || 'بدون وصف'}` : 'لا يوجد'} />
      <InfoRow icon={CalendarDays} label="آخر تحديث" value={formatDate(org.last_update)} />
      <InfoRow icon={UserRound} label="آخر يوزر قام بالإدخال" value={org.last_updated_by || '—'} />
    </div>
  </Panel>;

  if (panel === 'sites') return <Panel title="روابط الجمعية">
    {sites.length ? sites.map(site => <ActionRow key={site.id} title={site.title} subtitle={site.url} onCopy={() => copy(site.url)} onOpen={() => openUrl(site.url)} />) : <Empty/>}
  </Panel>;

  if (panel === 'accounts') return <Panel title="حسابات الجمعية">
    {accounts.length ? <div className="accountsGrid">{accounts.map(account => <div className="accountCard" key={account.id}>
      <h4>{account.provider}</h4>
      {account.url && <button className="linkButton" onClick={() => openUrl(account.url)}><ExternalLink size={15}/> فتح الرابط</button>}
      <CopyLine label="اليوزر" value={account.username || '—'} />
      <CopyLine label="الباسورد" value={account.password || '—'} />
    </div>)}</div> : <Empty/>}
  </Panel>;

  if (panel === 'identity') return <FilePanel title="هوية الجمعية" files={files.filter(file => ['شعار','هوية','منشور'].includes(file.category))} preview />;
  if (panel === 'files') return <FilePanel title="ملفات الجمعية" files={files} />;
  if (panel === 'messages') return <Panel title="المراسلات والنصوص"><div className="messageBox">السلام عليكم، معكم فريق منظور تقني بخصوص تحديث بيانات {org.name}.<button onClick={() => copy(`السلام عليكم، معكم فريق منظور تقني بخصوص تحديث بيانات ${org.name}.`)}>نسخ النص</button></div></Panel>;
  return <Panel title="الملاحظات"><div className="notesBox">{org.notes || 'لا توجد ملاحظات مسجلة.'}</div></Panel>;
}

function InfoRow({ icon: Icon, label, value, copyable, openable }: { icon: any; label: string; value: string; copyable?: boolean; openable?: boolean }) {
  return <div className="infoRow"><Icon size={18}/><div><span>{label}</span><strong>{value}</strong></div><div className="rowActions">{copyable && value !== '—' && <button onClick={() => copy(value)}><Copy size={15}/> نسخ</button>}{openable && value !== '—' && <button onClick={() => openUrl(value)}><ExternalLink size={15}/> فتح</button>}</div></div>;
}

function CopyLine({ label, value }: { label: string; value: string }) {
  return <div className="copyLine"><span>{label}</span><code>{value}</code><button onClick={() => copy(value)}><Copy size={15}/> نسخ</button></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel"><h3>{title}</h3>{children}</section>;
}

function Empty() {
  return <div className="empty">لا توجد بيانات مسجلة لهذا القسم.</div>;
}

function ActionRow({ title, subtitle, onCopy, onOpen }: { title: string; subtitle: string; onCopy: () => void; onOpen: () => void }) {
  return <div className="actionRow"><div><strong>{title}</strong><span>{subtitle}</span></div><button onClick={onCopy}><Copy size={15}/> نسخ</button><button onClick={onOpen}><ExternalLink size={15}/> فتح</button></div>;
}

function FilePanel({ title, files, preview }: { title: string; files: Attachment[]; preview?: boolean }) {
  const [urls, setUrls] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    if (!preview) return;
    files.forEach(file => getAttachmentUrl(file.file_path).then(url => setUrls(prev => ({ ...prev, [file.id]: url }))));
  }, [files, preview]);
  async function openFile(path: string) {
    const url = await getAttachmentUrl(path);
    if (url) window.open(url, '_blank');
  }
  return <Panel title={title}>{files.length ? <div className={preview ? 'identityGrid' : 'filesGrid'}>{files.map(file => <button className="fileCard" key={file.id} onClick={() => openFile(file.file_path)}>{preview && urls[file.id] ? <img src={urls[file.id]} alt={file.title}/> : <Download/>}<strong>{file.title}</strong><small>{file.category} • {file.uploaded_by || '—'}</small></button>)}</div> : <Empty/>}</Panel>;
}





function downloadExcel(filename: string, title: string, headers: string[], rows: (string | number)[][]) {
  const escape = (value: string | number) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const table = `
    <html dir="rtl">
      <head><meta charset="utf-8" /></head>
      <body>
        <h2>${escape(title)}</h2>
        <table border="1">
          <thead><tr>${headers.map(item => `<th>${escape(item)}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </body>
    </html>`;
  const blob = new Blob([table], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function todayISO() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function currentTime() {
  return new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

function monthKey() {
  return todayISO().slice(0, 7);
}

function toLocalDate(value?: string | null) {
  if (!value) return todayISO();
  return String(value).slice(0, 10);
}

function toLocalTime(value?: string | null) {
  if (!value) return currentTime();
  return String(value).slice(0, 5);
}

function UserProfileDashboard({ currentUser }: { currentUser: AppUser }) {
  const [daily, setDaily] = React.useState<DailyTask[]>([]);
  const [weekly, setWeekly] = React.useState<WeeklyPlan[]>([]);
  const [task, setTask] = React.useState('');
  const [plan, setPlan] = React.useState('');
  const [outputName, setOutputName] = React.useState('');
  const [outputCount, setOutputCount] = React.useState('');
  const [beneficiary, setBeneficiary] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const reloadProfile = React.useCallback(async () => {
    const [dailyRows, weeklyRows] = await Promise.all([
      loadDailyTasks(currentUser.id),
      loadWeeklyPlans(currentUser.id)
    ]);
    setDaily(dailyRows);
    setWeekly(weeklyRows);
  }, [currentUser.id]);

  React.useEffect(() => {
    reloadProfile();
  }, [reloadProfile]);

  const thisMonth = monthKey();
  const dailyThisMonth = daily.filter(item => toLocalDate(item.task_date).startsWith(thisMonth));
  const weeklyThisMonth = weekly.filter(item => toLocalDate(item.plan_date).startsWith(thisMonth));

  async function addDaily() {
    const value = task.trim();
    if (!value || busy) return;
    setBusy(true);
    const row = await addDailyTask(currentUser.id, value);
    setDaily(prev => [row, ...prev.filter(item => item.id !== row.id)]);
    setTask('');
    setBusy(false);
  }

  async function addWeekly() {
    const value = plan.trim();
    if (!value || busy) return;
    setBusy(true);
    const row = await addWeeklyPlan({
      userId: currentUser.id,
      planText: value,
      outputName: outputName.trim(),
      outputCount: Number(outputCount || 1),
      beneficiary: beneficiary.trim()
    });
    setWeekly(prev => [row, ...prev.filter(item => item.id !== row.id)]);
    setPlan('');
    setOutputName('');
    setOutputCount('');
    setBeneficiary('');
    setBusy(false);
  }

  async function deleteDaily() {
    if (!confirm('تبين حذف كل بيانات الإنجاز اليومي لهذا المستخدم؟')) return;
    await clearDailyTasks(currentUser.id);
    setDaily([]);
  }

  async function deleteWeekly() {
    if (!confirm('تبين حذف كل بيانات الخطة الأسبوعية لهذا المستخدم؟')) return;
    await clearWeeklyPlans(currentUser.id);
    setWeekly([]);
  }

  function exportDaily() {
    downloadExcel(
      `daily-${currentUser.id}-${thisMonth}.xls`,
      `الإنجاز اليومي - ${currentUser.name} - ${thisMonth}`,
      ['#', 'التاريخ', 'الوقت', 'المهمة المنجزة'],
      dailyThisMonth.map((item, index) => [index + 1, toLocalDate(item.task_date), toLocalTime(item.task_time), item.task_text])
    );
  }

  function exportWeekly() {
    downloadExcel(
      `weekly-${currentUser.id}-${thisMonth}.xls`,
      `الخطة الأسبوعية - ${currentUser.name} - ${thisMonth}`,
      ['#', 'تاريخ الإدخال', 'الخطة القادمة', 'اسم المخرج', 'عدد المخرجات', 'لصالح مين'],
      weeklyThisMonth.map((item, index) => [index + 1, toLocalDate(item.plan_date), item.plan_text, item.output_name || '—', item.output_count || '—', item.beneficiary || '—'])
    );
  }

  return <section className="profileDashboard">
    <div className="profileHero">
      <div><span>بروفايل المستخدم</span><h2>{currentUser.name}</h2><p>ID: {currentUser.id}</p></div>
      <div className="profileStats"><SmallMetric icon={CheckCircle2} label="إنجازات الشهر" value={String(dailyThisMonth.length)} /><SmallMetric icon={Target} label="خطط الشهر" value={String(weeklyThisMonth.length)} /></div>
    </div>
    <div className="profileGrid">
      <div className="profileCard">
        <div className="profileCardHead"><div><Clock size={20}/><h3>الإنجاز اليومي</h3></div><button onClick={exportDaily}><FileSpreadsheet size={16}/> تصدير Excel</button></div>
        <p>التاريخ والوقت ينسجلون تلقائيا من جهازك عند إضافة المهمة.</p>
        <textarea value={task} onChange={e => setTask(e.target.value)} placeholder="اكتب المهمة اللي خلصتها اليوم" />
        <button onClick={addDaily} disabled={busy}><Plus size={16}/> تسجيل الإنجاز</button>
        <div className="miniTable">{daily.slice(0, 8).map(item => <div key={item.id}><strong>{item.task_number}</strong><span>{toLocalDate(item.task_date)}</span><span>{toLocalTime(item.task_time)}</span><p>{item.task_text}</p></div>)}</div>
        <button className="dangerButton" onClick={deleteDaily}><Trash2 size={16}/> حذف بيانات الإنجاز اليومي</button>
      </div>
      <div className="profileCard">
        <div className="profileCardHead"><div><ClipboardList size={20}/><h3>خطة الأسبوع</h3></div><button onClick={exportWeekly}><FileSpreadsheet size={16}/> تصدير Excel</button></div>
        <p>اكتبيها بصيغة شيء راح يصير مع اسم المخرج وعدده والجهة المستفيدة.</p>
        <textarea value={plan} onChange={e => setPlan(e.target.value)} placeholder="الخطة الأسبوعية القادمة" />
        <div className="threeInputs"><input value={outputName} onChange={e => setOutputName(e.target.value)} placeholder="اسم المخرج"/><input inputMode="numeric" value={outputCount} onChange={e => setOutputCount(e.target.value.replace(/\D/g, ''))} placeholder="عدد المخرجات"/><input value={beneficiary} onChange={e => setBeneficiary(e.target.value)} placeholder="لصالح مين"/></div>
        <button onClick={addWeekly} disabled={busy}><Plus size={16}/> تسجيل الخطة</button>
        <div className="miniTable">{weekly.slice(0, 8).map((item, index) => <div key={item.id}><strong>{index + 1}</strong><span>{toLocalDate(item.plan_date)}</span><span>{item.output_name || '—'} × {item.output_count || '—'}</span><p>{item.plan_text}<br/><small>لصالح: {item.beneficiary || '—'}</small></p></div>)}</div>
        <button className="dangerButton" onClick={deleteWeekly}><Trash2 size={16}/> حذف بيانات الخطة الأسبوعية</button>
      </div>
    </div>
  </section>;
}

function EntryDashboard({ org, currentUser, onSaved, onBack, reload }: { org: Organization; currentUser: AppUser; onSaved: (org: Organization) => void; onBack: () => void; reload: () => void }) {
  const [form, setForm] = React.useState<Organization>(org);
  const [site, setSite] = React.useState({ title: '', url: '', note: '' });
  const [account, setAccount] = React.useState({ provider: '', username: '', password: '', url: '' });
  const [category, setCategory] = React.useState('عام');
  React.useEffect(() => setForm(org), [org]);
  const set = (key: keyof Organization, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  async function submitOrg() { onSaved(await saveOrganization(form, currentUser.name)); }
  async function submitSite() { if (!site.title || !site.url) return; await saveSite({ organization_id: org.id, ...site }, currentUser.name); setSite({ title: '', url: '', note: '' }); reload(); }
  async function submitAccount() { if (!account.provider) return; await saveAccount({ organization_id: org.id, ...account }, currentUser.name); setAccount({ provider: '', username: '', password: '', url: '' }); reload(); }
  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; await uploadAttachment(org.id, file, category, currentUser.name); event.target.value = ''; reload(); }
  return <section className="entry">
    <div className="entryHead"><div><span>{org.id}</span><h2>لوحة إدخال {org.name}</h2></div><button onClick={onBack}><ArrowRight size={16}/> رجوع للعرض</button></div>
    <div className="entryGrid">
      <div className="formCard wide"><h3>بيانات الجمعية</h3><input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="اسم الجمعية"/><input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="رقم التواصل"/><input value={form.official_email || ''} onChange={e => set('official_email', e.target.value)} placeholder="الإيميل الرسمي"/><input value={form.domain || ''} onChange={e => set('domain', e.target.value)} placeholder="الدومين إن وجد"/><label>تاريخ بداية الجمعية مع منظور</label><input type="date" value={form.relationship_start || ''} onChange={e => set('relationship_start', e.target.value)}/><select value={form.financial_commitment ? 'yes' : 'no'} onChange={e => set('financial_commitment', e.target.value === 'yes')}><option value="no">لا يوجد التزام مالي</option><option value="yes">يوجد التزام مالي</option></select><input type="number" value={form.financial_amount || ''} onChange={e => set('financial_amount', Number(e.target.value))} placeholder="قيمة الالتزام"/><textarea value={form.financial_note || ''} onChange={e => set('financial_note', e.target.value)} placeholder="وصف الالتزام أو الملاحظات المالية"/><textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="ملاحظات داخلية"/><button onClick={submitOrg}><Database size={16}/> حفظ بيانات الجمعية</button></div>
      <div className="formCard"><h3>إضافة رابط</h3><input value={site.title} onChange={e => setSite({ ...site, title: e.target.value })} placeholder="اسم الرابط: الموقع / النظام / المتجر"/><input value={site.url} onChange={e => setSite({ ...site, url: e.target.value })} placeholder="الرابط"/><input value={site.note} onChange={e => setSite({ ...site, note: e.target.value })} placeholder="ملاحظة اختيارية"/><button onClick={submitSite}><Plus size={16}/> إضافة الرابط</button></div>
      <div className="formCard"><h3>إضافة حساب مؤسسة</h3><input value={account.provider} onChange={e => setAccount({ ...account, provider: e.target.value })} placeholder="اسم المؤسسة أو النظام"/><input value={account.username} onChange={e => setAccount({ ...account, username: e.target.value })} placeholder="اليوزر"/><input value={account.password} onChange={e => setAccount({ ...account, password: e.target.value })} placeholder="الباسورد"/><input value={account.url} onChange={e => setAccount({ ...account, url: e.target.value })} placeholder="رابط الدخول اختياري"/><button onClick={submitAccount}><Plus size={16}/> إضافة الحساب</button></div>
      <div className="formCard"><h3>رفع ملف أو شعار</h3><select value={category} onChange={e => setCategory(e.target.value)}><option>عام</option><option>شعار</option><option>هوية</option><option>عقد</option><option>حوكمة</option><option>منشور</option><option>مراسلات</option></select><label className="uploadButton"><Upload size={18}/> اختيار ورفع الملف<input type="file" onChange={handleFile} hidden /></label></div>
    </div>
  </section>;
}

function App() {
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [items, setItems] = React.useState<Organization[]>([]);
  const [selected, setSelected] = React.useState<Organization | null>(null);
  const [query, setQuery] = React.useState('');
  const [mode, setMode] = React.useState<'view' | 'entry'>('view');
  const [panel, setPanel] = React.useState('');
  const [section, setSection] = React.useState<'organizations' | 'profile'>('organizations');
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [sites, setSites] = React.useState<SiteLink[]>([]);
  const [files, setFiles] = React.useState<Attachment[]>([]);
  const refreshRelated = React.useCallback(() => { if (!selected) return; loadAccounts(selected.id).then(setAccounts); loadSites(selected.id).then(setSites); loadAttachments(selected.id).then(setFiles); }, [selected]);
  React.useEffect(() => { if (user) loadOrganizations().then(data => { setItems(data); setSelected(data[0] || null); }); }, [user]);
  React.useEffect(() => { refreshRelated(); setPanel(''); }, [selected, refreshRelated]);
  if (!user) return <Login onLogin={setUser}/>;
  const filtered = items.filter(item => normalize([item.id, item.name, item.system_url, item.official_email, item.phone, item.manager, item.domain].join(' ')).includes(normalize(query)));
  return <main className="appShell">
    <header className="topbar"><img src="/manzor-vault-icon.png" alt="Manzor Tech"/><div><h1>منظور Vault</h1><p>منظور تقني لإدارة بيانات الجمعيات</p></div><button className={section === 'profile' ? 'topAction active' : 'topAction'} onClick={() => setSection(section === 'profile' ? 'organizations' : 'profile')}><UserCog size={17}/> {section === 'profile' ? 'الرجوع للجمعيات' : 'بروفايلي وخططي'}</button><strong>{user.name}</strong></header>
    <section className="layout">
      <aside className="sidebar"><div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث باسم الجمعية أو ID أو البريد" /></div><div className="list">{filtered.map(item => <button className={selected?.id===item.id?'selected':''} key={item.id} onClick={() => { setSelected(item); setMode('view'); setPanel(''); }}><span>{item.id}</span><strong>{item.name}</strong></button>)}</div></aside>
      <section className="workspace">{section === 'profile' ? <UserProfileDashboard currentUser={user}/> : selected && (mode === 'entry' ? <EntryDashboard org={selected} currentUser={user} reload={refreshRelated} onBack={() => setMode('view')} onSaved={(org) => { setItems(prev => prev.map(item => item.id === org.id ? org : item)); setSelected(org); }} /> : panel ? <><button className="backButton" onClick={() => setPanel('')}><ArrowRight size={16}/> رجوع للوحة</button><DisplayPanel panel={panel} org={selected} accounts={accounts} sites={sites} files={files}/></> : <Overview org={selected} accounts={accounts} sites={sites} files={files} onOpenEntry={() => setMode('entry')} onOpenPanel={setPanel}/>)}</section>
    </section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
