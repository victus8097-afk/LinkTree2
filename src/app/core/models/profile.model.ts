export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  email: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  verified: boolean;
  createdAt?: string;
<<<<<<< HEAD
  /** لون أو تدرج مخصص للصفحة الشخصية (مثلاً #a855f7 أو linear-gradient(...)) */
  themeColor?: string | null;
  /** لون الخلفية للصفحة الشخصية */
  bgColor?: string | null;
=======
  themeColor?: string | null;
  bgColor?: string | null;
  password?: string | null;
  template?: string | null;
  views?: number;
  css?: string | null;
  title?: string | null;
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
}

export interface ProfileRow {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  email: string;
  avatar_url: string | null;
  cover_url?: string | null;
  verified: boolean;
  created_at: string;
  theme_color?: string | null;
  bg_color?: string | null;
<<<<<<< HEAD
=======
  password?: string | null;
  template?: string | null;
  views?: number;
  css?: string | null;
  title?: string | null;
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
}

export function mapProfile(row: ProfileRow): Profile {
  return {
<<<<<<< HEAD
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
=======
    id: row.id, handle: row.handle, displayName: row.display_name,
    bio: row.bio, email: row.email, avatarUrl: row.avatar_url,
    coverUrl: row.cover_url ?? null, verified: row.verified,
    createdAt: row.created_at, themeColor: row.theme_color ?? null,
    bgColor: row.bg_color ?? null, password: row.password ?? null,
    template: row.template ?? null, views: row.views ?? 0,
    css: row.css ?? null, title: row.title ?? null,
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
  };
}

export type ProfileInput = Pick<Profile, 'handle' | 'displayName' | 'bio' | 'email'> & {
<<<<<<< HEAD
  avatarUrl?: string | null;
  themeColor?: string | null;
  bgColor?: string | null;
=======
  avatarUrl?: string | null; coverUrl?: string | null;
  themeColor?: string | null; bgColor?: string | null;
  password?: string | null; template?: string | null;
  css?: string | null; title?: string | null;
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
};

export const PROFILE_TEMPLATES: { id: string; label: string; color: string; bg: string; gradient: string; accent: string }[] = [
  { id: 'default', label: 'البنفسجي', color: '#a855f7', bg: '#0b0617', gradient: 'linear-gradient(135deg, #a855f7, #6366f1)', accent: '#c084fc' },
  { id: 'ocean', label: 'المحيط', color: '#06b6d4', bg: '#0a1628', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', accent: '#22d3ee' },
  { id: 'sunset', label: 'الغروب', color: '#f97316', bg: '#1a0f08', gradient: 'linear-gradient(135deg, #f97316, #ef4444)', accent: '#fb923c' },
  { id: 'forest', label: 'الغابة', color: '#22c55e', bg: '#0a140b', gradient: 'linear-gradient(135deg, #22c55e, #15803d)', accent: '#4ade80' },
  { id: 'rose', label: 'الوردي', color: '#ec4899', bg: '#140a10', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)', accent: '#f472b6' },
  { id: 'gold', label: 'الذهبي', color: '#eab308', bg: '#141008', gradient: 'linear-gradient(135deg, #eab308, #f59e0b)', accent: '#facc15' },
  { id: 'midnight', label: 'منتصف الليل', color: '#8b5cf6', bg: '#060510', gradient: 'linear-gradient(135deg, #8b5cf6, #1e1b4b)', accent: '#a78bfa' },
  { id: 'sunrise', label: 'الشروق', color: '#f43f5e', bg: '#14080a', gradient: 'linear-gradient(135deg, #f43f5e, #fb923c)', accent: '#fb7185' },
];
