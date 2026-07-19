export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  email: string;
  avatarUrl?: string | null;
  verified: boolean;
  createdAt?: string;
  /** لون أو تدرج مخصص للصفحة الشخصية */
  themeColor?: string | null;
  /** لون الخلفية للصفحة الشخصية */
  bgColor?: string | null;
  /** كلمة مرور للصفحة بالكامل — إن وُجدت، تُطلب قبل العرض */
  password?: string | null;
  /** قالب جاهز (إن وُجد) */
  template?: string | null;
  /** عدد مشاهدات الصفحة */
  views?: number;
}

export interface ProfileRow {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  email: string;
  avatar_url: string | null;
  verified: boolean;
  created_at: string;
  theme_color?: string | null;
  bg_color?: string | null;
  password?: string | null;
  template?: string | null;
  views?: number;
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    bio: row.bio,
    email: row.email,
    avatarUrl: row.avatar_url,
    verified: row.verified,
    createdAt: row.created_at,
    themeColor: row.theme_color ?? null,
    bgColor: row.bg_color ?? null,
    password: row.password ?? null,
    template: row.template ?? null,
    views: row.views ?? 0,
  };
}

export type ProfileInput = Pick<Profile, 'handle' | 'displayName' | 'bio' | 'email'> & {
  avatarUrl?: string | null;
  themeColor?: string | null;
  bgColor?: string | null;
  password?: string | null;
  template?: string | null;
};

/** قوالب جاهزة للصفحات الشخصية */
export const PROFILE_TEMPLATES: { id: string; label: string; color: string; bg: string; gradient: string }[] = [
  { id: 'default', label: 'البنفسجي', color: '#a855f7', bg: '#0b0617', gradient: 'linear-gradient(135deg, #a855f7, #6366f1)' },
  { id: 'ocean', label: 'المحيط', color: '#06b6d4', bg: '#0a1628', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'sunset', label: 'الغروب', color: '#f97316', bg: '#1a0f08', gradient: 'linear-gradient(135deg, #f97316, #ef4444)' },
  { id: 'forest', label: 'الغابة', color: '#22c55e', bg: '#0a140b', gradient: 'linear-gradient(135deg, #22c55e, #15803d)' },
  { id: 'rose', label: 'الوردي', color: '#ec4899', bg: '#140a10', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { id: 'gold', label: 'الذهبي', color: '#eab308', bg: '#141008', gradient: 'linear-gradient(135deg, #eab308, #f59e0b)' },
  { id: 'midnight', label: 'منتصف الليل', color: '#8b5cf6', bg: '#060510', gradient: 'linear-gradient(135deg, #8b5cf6, #1e1b4b)' },
];
