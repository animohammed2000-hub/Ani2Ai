import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Check,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { Post, displayName, formatDate, formatCount } from '../lib/types';

export interface PostCardProps {
  post: Post;
  currentUserId: string;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onAskAiAboutPost?: (postContent: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onToggleLike,
  onToggleBookmark,
  onOpenComments,
  onAskAiAboutPost,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLikedAnimating, setIsLikedAnimating] = useState(false);

  const handleLikeClick = () => {
    setIsLikedAnimating(true);
    setTimeout(() => setIsLikedAnimating(false), 350);
    onToggleLike(post.id);
  };

  const handleShareClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'منشور من آني',
          text: post.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          `${post.content}\n\nنُشر عبر تطبيق آني (Ani Social)`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore user cancellation
    }
  };

  const authorName = displayName(post.author);
  const authorHandle = post.author?.username ? `@${post.author.username}` : '';
  const authorAvatar =
    post.author?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=ec4899&color=fff`;

  return (
    <article className="rounded-2xl border border-zinc-850 bg-zinc-900/90 overflow-hidden shadow-md transition-all hover:border-zinc-700/80">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover border border-zinc-800"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-zinc-100 hover:text-pink-400 cursor-pointer transition">
                {authorName}
              </h4>
              {post.author?.city && (
                <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded-full">
                  {post.author.city}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              {authorHandle && <span>{authorHandle}</span>}
              <span>•</span>
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute left-0 top-8 z-20 w-48 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-xl text-xs space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  handleShareClick();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition text-right"
              >
                <Share2 size={14} />
                <span>نسخ رابط المنشور</span>
              </button>

              {onAskAiAboutPost && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onAskAiAboutPost(post.content);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-pink-400 hover:bg-pink-500/10 transition text-right"
                >
                  <Sparkles size={14} />
                  <span>اسأل AI عن هذا المنشور</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition text-right"
              >
                <ThumbsDown size={14} />
                <span>غير مهتم بهذا المحتوى</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-line dir-rtl text-right">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-pink-400 hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attached Media */}
      {post.media_url && (
        <div className="w-full max-h-[420px] overflow-hidden bg-black/40 border-y border-zinc-800/60">
          <img
            src={post.media_url}
            alt="صورة المنشور"
            className="w-full object-cover max-h-[420px] hover:scale-101 transition duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/50 text-zinc-400 text-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 py-1 px-1.5 rounded-lg transition ${
              post.liked_by_me
                ? 'text-pink-500 font-bold'
                : 'hover:text-pink-400 hover:bg-pink-500/10'
            }`}
          >
            <Heart
              size={18}
              fill={post.liked_by_me ? 'currentColor' : 'none'}
              className={isLikedAnimating ? 'animate-heart-pop' : ''}
            />
            <span>{formatCount(post.likes_count)}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenComments(post.id)}
            className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <MessageSquare size={17} />
            <span>{formatCount(post.comments_count)}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareClick}
            className="p-1.5 rounded-lg hover:text-zinc-200 hover:bg-zinc-800 transition relative"
            title="مشاركة"
          >
            {copied ? <Check size={17} className="text-emerald-400" /> : <Share2 size={17} />}
            {copied && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                تم النسخ!
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onToggleBookmark(post.id)}
            className={`p-1.5 rounded-lg transition ${
              post.saved_by_me
                ? 'text-amber-400 bg-amber-400/10'
                : 'hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="حفظ المنشور"
          >
            <Bookmark size={17} fill={post.saved_by_me ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  );
};
export default PostCard;
