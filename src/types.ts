export type Organization = {
  id: string;
  name: string;
  system_url?: string | null;
  official_email?: string | null;
  channel?: string | null;
  city?: string | null;
  manager?: string | null;
  phone?: string | null;
  domain?: string | null;
  relationship_start?: string | null;
  financial_commitment?: boolean | null;
  financial_amount?: number | null;
  financial_note?: string | null;
  last_update?: string | null;
  last_updated_by?: string | null;
  notes?: string | null;
};

export type Account = {
  id: string;
  organization_id: string;
  provider: string;
  username?: string | null;
  password?: string | null;
  url?: string | null;
  created_at_text?: string | null;
};

export type SiteLink = {
  id: string;
  organization_id: string;
  title: string;
  url: string;
  note?: string | null;
};

export type Attachment = {
  id: string;
  organization_id: string;
  title: string;
  category: string;
  file_path: string;
  file_type?: string | null;
  uploaded_by?: string | null;
  created_at?: string | null;
};

export type AppUser = {
  id: string;
  name: string;
  role?: string;
};

export type DailyTask = {
  id: string;
  user_id: string;
  task_number: number;
  task_text: string;
  task_date: string;
  task_time: string;
  created_at?: string | null;
};

export type WeeklyPlan = {
  id: string;
  user_id: string;
  plan_text: string;
  output_name?: string | null;
  output_count?: number | null;
  beneficiary?: string | null;
  plan_date: string;
  week_start: string;
  created_at?: string | null;
};
