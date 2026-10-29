export type Profile = {
  id: string;
  username: string;
  full_name: string;
  display_name?: string | null;
  avatar_url: string | null;
  bio: string;
  city?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  cover_url?: string;
};

export type PostFeedback = 'interested' | 'not_interested';

export type PostComment = {
  id: string;
  post_id?: string;
  user_id?: string;
  userId?: string;
  content?: string;
  text?: string;
  created_at?: string;
  createdAt?: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  media_url?: string | null;
  media_urls?: string[] | null;
  type?: 'text' | 'photo' | 'reel';
  created_at: string;
  author: Profile | null;

  likes_count?: number;
  comments_count?: number;
  reposts_count?: number;
  shares_count?: number;

  comments_disabled?: boolean;
  audio_url?: string | null;
  audio_title?: string | null;
  feedback?: PostFeedback | null;

  liked_by_me?: boolean;
  saved_by_me?: boolean;
  reposted_by_me?: boolean;
  feedback_by_me?: 'interested' | 'not_interested' | null;

  likes?: { user_id: string }[];
  comments?: PostComment[];
  tags?: string[];
};

export type Story = {
  id: string;
  user_name: string;
  user_avatar?: string;
  media_url?: string;
  has_unseen?: boolean;
  caption?: string;
  timestamp?: string;
};

export type CommentAuthor = {
  id?: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
};

export interface CommentWithDetails {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  image_url?: string | null;
  created_at: string;
  profiles: CommentAuthor | null;
  likes_count?: number;
  is_liked?: boolean;
  replies?: CommentWithDetails[];
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: NotificationType;
  entity_id?: string;
  read: boolean;
  created_at: string;
  actor?: {
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
}

export const displayName = (profile?: Partial<Profile> | null): string =>
  profile?.display_name ||
  profile?.full_name ||
  (profile?.username ? `@${profile.username}` : 'عضو آني');

export const normalizeProfile = (value: unknown): Profile | null => {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== 'object') return null;
  return row as Profile;
};

export const formatCount = (value?: number | null): string => {
  const count = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  if (count < 1000) return String(count);
  if (count < 1_000_000) {
    const thousands = count / 1000;
    return `${thousands >= 10 ? Math.round(thousands) : thousands.toFixed(1).replace(/\.0$/, '')} ألف`;
  }
  const millions = count / 1_000_000;
  return `${millions >= 10 ? Math.round(millions) : millions.toFixed(1).replace(/\.0$/, '')} مليون`;
};

export const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ar-IQ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
