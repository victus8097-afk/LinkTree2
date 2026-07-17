export interface Link {
  id: string;
  profileId: string;
  title: string;
  url: string;
  position: number;
  createdAt?: string;
}

export interface LinkRow {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  position: number;
  created_at: string;
}

export function mapLink(row: LinkRow): Link {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    url: row.url,
    position: row.position,
    createdAt: row.created_at,
  };
}

export interface LinkInput {
  title: string;
  url: string;
}
