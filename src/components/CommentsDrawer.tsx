import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Send,
  ImagePlus,
  Heart,
  CornerDownLeft,
  Trash2,
  Loader2,
} from 'lucide-react';
import { CommentWithDetails, Profile, formatDate } from '../lib/types';
import {
  fetchCommentsWithReplies,
  addComment,
  toggleCommentLike,
  uploadCommentImage,
} from '../lib/interactions';

interface CommentsDrawerProps {
  postId: string;
  currentUserId: string;
  currentUser?: Profile;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountUpdated?: (postId: string, count: number) => void;
}

/**
 * دالة مساعدة لمعالجة بيانات profiles بأمان تام
 * تقي التطبيق من أي كراش أو شاشة بيضاء على آيفون إذا عادت البيانات كمصفوفة أو كائن فرعي أو فارغة
 */
function getSafeProfile(raw: unknown): {
  full_name: string;
  username: string;
  avatar_url: string | null;
} {
  if (!raw) {
    return { full_name: 'عضو آني', username: 'user', avatar_url: null };
  }

  // إذا أرجعت Supabase مصفوفة من صفوف الربط (PostgREST array relationship)
  const target = Array.isArray(raw) ? raw[0] : raw;

  if (!target || typeof target !== 'object') {
    return { full_name: 'عضو آني', username: 'user', avatar_url: null };
  }

  const record = target as Record<string, unknown>;

  const full_name =
    typeof record.full_name === 'string' && record.full_name.trim()
      ? record.full_name.trim()
      : typeof record.display_name === 'string' && record.display_name.trim()
      ? record.display_name.trim()
      : 'عضو آني';

  const username =
    typeof record.username === 'string' && record.username.trim()
      ? record.username.trim()
      : 'user';

  const avatar_url =
    typeof record.avatar_url === 'string' && record.avatar_url.trim()
      ? record.avatar_url.trim()
      : null;

  return { full_name, username, avatar_url };
}

function getAvatarUrl(name: string, url: string | null): string {
  if (url && url.length > 5) return url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'ع'
  )}&background=ec4899&color=fff&size=128`;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  postId,
  currentUserId,
  currentUser,
  isOpen,
  onClose,
  onCommentCountUpdated,
}) => {
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentWithDetails | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // لمنع الخفقان: فصل حالة التحميل الأولية عن التحميل في الخلفية
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const commentsListRef = useRef<HTMLDivElement | null>(null);

  // جلب التعليقات مع خيار التحديث الصامت (silent) لمنع اختفاء التعليقات أو خفقان الشاشة
  const loadComments = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!postId) return;
      if (!options?.silent) {
        setInitialLoading(true);
      }
      try {
        const data = await fetchCommentsWithReplies(postId, currentUserId);
        setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('خطأ في جلب التعليقات:', err);
      } finally {
        if (!options?.silent) {
          setInitialLoading(false);
        }
      }
    },
    [postId, currentUserId]
  );

  useEffect(() => {
    if (isOpen && postId) {
      void loadComments({ silent: false });
    } else {
      // إعادة ضبط الحالات عند الإغلاق
      setReplyingTo(null);
      setContent('');
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [isOpen, postId, loadComments]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch {
        /* ignore */
      }
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // الإعجاب بالتعليق فورياً في الواجهة دون وميض
  const handleLikeComment = async (commentId: string) => {
    // تحديث تفاؤلي مباشر في الحالة
    setComments((prevComments) => {
      const updateList = (list: CommentWithDetails[]): CommentWithDetails[] => {
        return list.map((item) => {
          if (item.id === commentId) {
            const nextLiked = !item.is_liked;
            return {
              ...item,
              is_liked: nextLiked,
              likes_count: Math.max(0, (item.likes_count || 0) + (nextLiked ? 1 : -1)),
            };
          }
          if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: updateList(item.replies),
            };
          }
          return item;
        });
      };
      return updateList(prevComments);
    });

    try {
      await toggleCommentLike(postId, commentId);
    } catch (e) {
      console.warn('Like toggle failed:', e);
    }
  };

  // إرسال التعليق دون خفقان الشاشة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanContent = content.trim();
    if (!cleanContent && !selectedImage) return;

    setSubmitting(true);

    try {
      let imageUrl: string | null = null;
      if (selectedImage) {
        imageUrl = await uploadCommentImage(selectedImage);
      }

      // إضافة التعليق
      const newComment = await addComment({
        postId,
        userId: currentUserId,
        content: cleanContent,
        parentId: replyingTo?.id || null,
        imageUrl,
      });

      // تفريغ الحقول فورا
      setContent('');
      handleRemoveImage();
      const wasReplying = replyingTo;
      setReplyingTo(null);

      // تحديث الحالة محلياً بطريقة متصلة لمنع إعادة بناء الشاشة
      setComments((prev) => {
        if (wasReplying) {
          const insertReply = (items: CommentWithDetails[]): CommentWithDetails[] => {
            return items.map((item) => {
              if (item.id === wasReplying.id) {
                return {
                  ...item,
                  replies: [...(item.replies || []), newComment],
                };
              }
              if (item.replies && item.replies.length > 0) {
                return {
                  ...item,
                  replies: insertReply(item.replies),
                };
              }
              return item;
            });
          };
          return insertReply(prev);
        }
        return [newComment, ...prev];
      });

      // حساب العدد وتنبيه المكون الأب
      if (onCommentCountUpdated) {
        const nextCount = comments.reduce(
          (acc, c) => acc + 1 + (c.replies?.length || 0),
          1
        );
        onCommentCountUpdated(postId, nextCount);
      }

      // تمرير للأعلى أو الأسفل بسلاسة
      setTimeout(() => {
        commentsListRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('فشل إرسال التعليق:', err);
      // في حال الفشل نجلب التعليقات بدون خفقان
      await loadComments({ silent: true });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalCommentsCount = comments.reduce(
    (acc, curr) => acc + 1 + (curr.replies?.length || 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      dir="rtl"
    >
      {/* خلفية معتمة للإغلاق عند النقر */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-label="إغلاق النافذة"
      />

      {/* 
        Bottom Sheet Container (مخصص للأيفون والشاشات المحمولة) 
        - مقاس ارتفاع متجاوب h-[88dvh] max-h-[88dvh] لتفادي مشاكل شريط سفاري
        - تدوير الحواف العلوية rounded-t-[28px]
        - حماية safe-area لمنطقة الهوم في أجهزة آيفون
      */}
      <div
        className="relative z-10 w-full sm:max-w-lg bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-[28px] sm:rounded-3xl h-[88dvh] max-h-[88dvh] sm:h-auto sm:max-h-[82vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
        }}
      >
        {/* مقبض السحب (Drag Handle) للأجهزة الذكية والآيفون */}
        <div className="w-12 h-1.5 rounded-full bg-zinc-700 mx-auto mt-2.5 mb-1 shrink-0 sm:hidden" />

        {/* ترويسة النافذة */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-850 bg-zinc-900/95 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-zinc-100">التعليقات</h3>
            <span className="text-xs bg-zinc-800 text-pink-400 px-2 py-0.5 rounded-full font-bold">
              {totalCommentsCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* قائمة التعليقات مع حماية من الخفقان والكراش */}
        <div
          ref={commentsListRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y"
        >
          {initialLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
              <p className="text-xs">جاري تحميل التعليقات...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 space-y-1">
              <p className="text-sm font-bold text-zinc-200">لا توجد تعليقات بعد</p>
              <p className="text-xs text-zinc-500">
                شارك برأيك وكن أول من يعلق على هذا المنشور!
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              // معالجة آمنة لبيانات صاحب التعليق لمنع أي كراش
              const author = getSafeProfile(comment.profiles);
              const authorAvatar = getAvatarUrl(author.full_name, author.avatar_url);

              return (
                <div key={comment.id} className="space-y-3">
                  {/* التعليق الأساسي */}
                  <div className="flex gap-2.5 text-right">
                    <img
                      src={authorAvatar}
                      alt={author.full_name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-zinc-800 bg-zinc-800"
                      loading="lazy"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="bg-zinc-850/80 rounded-2xl p-3 border border-zinc-800">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-xs font-bold text-zinc-100 truncate">
                            {author.full_name}
                          </span>
                          <span className="text-[10px] text-zinc-400 shrink-0">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>

                        {comment.content && (
                          <p className="text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                        )}

                        {comment.image_url && (
                          <div className="mt-2.5 rounded-xl overflow-hidden max-h-52 border border-zinc-700 bg-black/40">
                            <img
                              src={comment.image_url}
                              alt="مرفق بالتعليق"
                              className="w-full object-cover max-h-52"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>

                      {/* أزرار التفاعل مع التعليق */}
                      <div className="flex items-center gap-4 mt-1.5 px-2 text-[11px] text-zinc-400">
                        <button
                          type="button"
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 transition active:scale-90 ${
                            comment.is_liked
                              ? 'text-pink-500 font-bold'
                              : 'hover:text-zinc-200'
                          }`}
                        >
                          <Heart
                            size={13}
                            fill={comment.is_liked ? 'currentColor' : 'none'}
                          />
                          <span>{comment.likes_count || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(comment);
                            textareaRef.current?.focus();
                          }}
                          className="hover:text-pink-400 font-medium transition"
                        >
                          رد
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* الردود المتداخلة (Threaded Replies) */}
                  {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                    <div className="mr-8 pr-3 border-r-2 border-zinc-800 space-y-2.5">
                      {comment.replies.map((reply) => {
                        const replyAuthor = getSafeProfile(reply.profiles);
                        const replyAvatar = getAvatarUrl(
                          replyAuthor.full_name,
                          replyAuthor.avatar_url
                        );

                        return (
                          <div key={reply.id} className="flex gap-2 text-right">
                            <img
                              src={replyAvatar}
                              alt={replyAuthor.full_name}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-800 bg-zinc-800"
                              loading="lazy"
                            />

                            <div className="flex-1 min-w-0">
                              <div className="bg-zinc-850/50 rounded-xl p-2.5 border border-zinc-800/80">
                                <div className="flex items-center justify-between mb-0.5 gap-2">
                                  <span className="text-[11px] font-bold text-zinc-200 truncate">
                                    {replyAuthor.full_name}
                                  </span>
                                  <span className="text-[9px] text-zinc-400 shrink-0">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-200 whitespace-pre-wrap break-words">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* شريط الإدخال السفلي */}
        <div className="p-3 border-t border-zinc-850 bg-zinc-950 shrink-0">
          {/* شريط الرد عند تحديد تعليق معين */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs text-zinc-300 mb-2">
              <div className="flex items-center gap-1.5 truncate">
                <CornerDownLeft size={13} className="text-pink-400 shrink-0" />
                <span className="shrink-0">الرد على</span>
                <span className="font-bold text-pink-400 truncate">
                  {getSafeProfile(replyingTo.profiles).full_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-zinc-400 hover:text-white p-0.5 rounded-full hover:bg-zinc-800"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* معاينة الصورة المرفقة قبل النشر */}
          {imagePreview && (
            <div className="relative inline-block mb-2 rounded-xl overflow-hidden border border-zinc-700">
              <img
                src={imagePreview}
                alt="معاينة"
                className="h-16 w-16 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 p-1 bg-black/80 rounded-full text-white hover:bg-black transition"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}

          {/* نموذج إرسال التعليق */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition shrink-0"
              title="إرفاق صورة"
              aria-label="إرفاق صورة"
            >
              <ImagePlus size={20} />
            </button>

            {/* 
              ملاحظة تقنية مهمة للأيفون: 
              استخدام text-[16px] sm:text-xs يمنع متصفح Safari على iOS من التكبير التلقائي المزعج (Auto Zoom) 
              الذي يسبب ارتباك وتخريب تخطيط الشاشة وظهور الشاشة البيضاء.
            */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={replyingTo ? 'اكتب ردك هنا...' : 'اكتب تعليقاً...'}
              rows={1}
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-2xl px-3.5 py-2.5 text-[16px] sm:text-xs text-white placeholder-zinc-500 focus:outline-none resize-none transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(e);
                }
              }}
            />

            <button
              type="submit"
              disabled={submitting || (!content.trim() && !selectedImage)}
              className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition shrink-0 shadow-md shadow-pink-500/20"
              aria-label="إرسال التعليق"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsDrawer;
