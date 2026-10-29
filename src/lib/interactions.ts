import { CommentWithDetails, Post, Notification } from './types';
import { INITIAL_COMMENTS, INITIAL_POSTS, INITIAL_NOTIFICATIONS, CURRENT_USER } from './mockData';
import { supabase, supabaseConfigured } from './supabase';

const STORAGE_KEY_POSTS = 'ani_posts_store_v1';
const STORAGE_KEY_COMMENTS = 'ani_comments_store_v1';
const STORAGE_KEY_NOTIFS = 'ani_notifications_store_v1';

export const getStoredPosts = (): Post[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_POSTS;
};

export const saveStoredPosts = (posts: Post[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
  } catch (e) {
    console.error(e);
  }
};

export const getStoredComments = (postId: string): CommentWithDetails[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_COMMENTS}_${postId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_COMMENTS[postId] || [];
};

export const saveStoredComments = (postId: string, comments: CommentWithDetails[]): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY_COMMENTS}_${postId}`, JSON.stringify(comments));
  } catch (e) {
    console.error(e);
  }
};

export const getStoredNotifications = (): Notification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_NOTIFICATIONS;
};

export const saveStoredNotifications = (notifs: Notification[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  } catch (e) {
    console.error(e);
  }
};

/**
 * Fetch comments for a specific post with recursive replies.
 */
export const fetchCommentsWithReplies = async (
  postId: string,
  _currentUserId?: string
): Promise<CommentWithDetails[]> => {
  // If Supabase is connected, attempt Supabase query first
  if (supabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id, post_id, user_id, parent_id, content, image_url, created_at,
          profiles (full_name, username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        // Nest replies
        const map = new Map<string, CommentWithDetails>();
        const roots: CommentWithDetails[] = [];

        data.forEach((item: any) => {
          let profData: any = item.profiles;
          if (Array.isArray(profData)) {
            profData = profData[0] || null;
          }
          const safeProfile = {
            full_name:
              profData && typeof profData.full_name === 'string' && profData.full_name.trim()
                ? profData.full_name.trim()
                : 'عضو آني',
            username:
              profData && typeof profData.username === 'string' && profData.username.trim()
                ? profData.username.trim()
                : 'user',
            avatar_url:
              profData && typeof profData.avatar_url === 'string'
                ? profData.avatar_url
                : null,
          };

          const formatted: CommentWithDetails = {
            id: String(item.id),
            post_id: String(item.post_id),
            user_id: String(item.user_id),
            parent_id: item.parent_id ? String(item.parent_id) : null,
            content: String(item.content || ''),
            image_url: item.image_url || null,
            created_at: item.created_at || new Date().toISOString(),
            profiles: safeProfile,
            likes_count: Number(item.likes_count) || 0,
            is_liked: Boolean(item.is_liked),
            replies: [],
          };
          map.set(formatted.id, formatted);
        });

        map.forEach((comment) => {
          if (comment.parent_id && map.has(comment.parent_id)) {
            map.get(comment.parent_id)!.replies!.push(comment);
          } else {
            roots.push(comment);
          }
        });

        return roots;
      }
    } catch {
      // Fall through to local fallback
    }
  }

  return getStoredComments(postId);
};

/**
 * Add a new comment (or reply) to a post.
 */
export const addComment = async (params: {
  postId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  imageUrl?: string | null;
}): Promise<CommentWithDetails> => {
  const newComment: CommentWithDetails = {
    id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    post_id: params.postId,
    user_id: params.userId,
    parent_id: params.parentId || null,
    content: params.content,
    image_url: params.imageUrl || null,
    created_at: new Date().toISOString(),
    profiles: {
      id: CURRENT_USER.id,
      full_name: CURRENT_USER.full_name,
      username: CURRENT_USER.username,
      avatar_url: CURRENT_USER.avatar_url,
    },
    likes_count: 0,
    is_liked: false,
    replies: [],
  };

  // Update local comments
  const existing = getStoredComments(params.postId);
  if (params.parentId) {
    const addReplyRecursive = (items: CommentWithDetails[]): boolean => {
      for (const item of items) {
        if (item.id === params.parentId) {
          if (!item.replies) item.replies = [];
          item.replies.push(newComment);
          return true;
        }
        if (item.replies && addReplyRecursive(item.replies)) {
          return true;
        }
      }
      return false;
    };
    if (!addReplyRecursive(existing)) {
      existing.push(newComment);
    }
  } else {
    existing.unshift(newComment);
  }
  saveStoredComments(params.postId, existing);

  // Update post comments count
  const posts = getStoredPosts();
  const updatedPosts = posts.map((p) =>
    p.id === params.postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
  );
  saveStoredPosts(updatedPosts);

  // If Supabase is available, push in background
  if (supabaseConfigured) {
    try {
      await supabase.from('comments').insert({
        post_id: params.postId,
        user_id: params.userId,
        parent_id: params.parentId || null,
        content: params.content,
        image_url: params.imageUrl || null,
      });
    } catch (e) {
      console.warn('Supabase comment insert failed, stored locally:', e);
    }
  }

  return newComment;
};

/**
 * Toggle like on a comment.
 */
export const toggleCommentLike = async (
  postId: string,
  commentId: string
): Promise<{ liked: boolean; count: number }> => {
  const comments = getStoredComments(postId);
  let res = { liked: false, count: 0 };

  const updateLike = (items: CommentWithDetails[]) => {
    for (const c of items) {
      if (c.id === commentId) {
        c.is_liked = !c.is_liked;
        c.likes_count = (c.likes_count || 0) + (c.is_liked ? 1 : -1);
        res = { liked: c.is_liked, count: c.likes_count };
        return;
      }
      if (c.replies) updateLike(c.replies);
    }
  };

  updateLike(comments);
  saveStoredComments(postId, comments);
  return res;
};

/**
 * Upload image for comment (returns data URL or storage URL).
 */
export const uploadCommentImage = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};
