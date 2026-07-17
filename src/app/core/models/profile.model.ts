export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  email: string;
  avatarUrl?: string | null;
  verified: boolean;
  createdAt?: string;
}

// صف الأعمدة كما تُخزَّن في جدول Supabase (snake_case).
export interface ProfileRow {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  email: string;
  avatar_url: string | null;
  verified: boolean;
  created_at: string;
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
  };
}

export type ProfileInput = Pick<Profile, 'handle' | 'displayName' | 'bio' | 'email'> & {
  avatarUrl?: string | null;
};
