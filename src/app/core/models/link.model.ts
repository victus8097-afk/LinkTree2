export interface Link {
  id: string; profileId: string; title: string; url: string;
  position: number; createdAt?: string;
  category?: string | null; password?: string | null;
  pinned?: boolean; thumbnail?: string | null;
}

export interface LinkRow {
  id: string; profile_id: string; title: string; url: string;
  position: number; created_at: string;
  category?: string | null; password?: string | null;
  pinned?: boolean; thumbnail?: string | null;
}

export function mapLink(row: LinkRow): Link {
  return {
    id: row.id, profileId: row.profile_id, title: row.title, url: row.url,
    position: row.position, createdAt: row.created_at,
    category: row.category ?? null, password: row.password ?? null,
    pinned: row.pinned ?? false, thumbnail: row.thumbnail ?? null,
  };
}

export interface LinkInput {
  title: string; url: string;
  category?: string | null; password?: string | null; pinned?: boolean;
}

export const LINK_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'social', label: 'تواصل اجتماعي', icon: '👥' },
  { id: 'work', label: 'أعمال', icon: '💼' },
  { id: 'shop', label: 'متجر', icon: '🛍️' },
  { id: 'content', label: 'محتوى', icon: '📺' },
  { id: 'music', label: 'موسيقى', icon: '🎧' },
  { id: 'donate', label: 'دعم', icon: '💝' },
  { id: 'custom', label: 'أخرى', icon: '🔗' },
];
