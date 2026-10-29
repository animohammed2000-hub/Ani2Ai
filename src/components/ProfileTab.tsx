import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Edit3,
  Bookmark,
  Heart,
  Grid,
  Check,
  X,
  Camera,
} from 'lucide-react';
import { Profile, Post, formatCount } from '../lib/types';
import PostCard from './PostCard';

interface ProfileTabProps {
  currentUser: Profile;
  onUpdateProfile: (updated: Partial<Profile>) => void;
  posts: Post[];
  currentUserId: string;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onAskAiAboutPost: (text: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentUser,
  onUpdateProfile,
  posts,
  currentUserId,
  onToggleLike,
  onToggleBookmark,
  onOpenComments,
  onAskAiAboutPost,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'likes' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.full_name);
  const [bioInput, setBioInput] = useState(currentUser.bio);
  const [cityInput, setCityInput] = useState(currentUser.city || '');
  const [avatarInput, setAvatarInput] = useState(currentUser.avatar_url || '');

  const myPosts = posts.filter(
    (p) => p.user_id === currentUser.id || p.author?.id === currentUser.id
  );
  const likedPosts = posts.filter((p) => p.liked_by_me);
  const savedPosts = posts.filter((p) => p.saved_by_me);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      full_name: nameInput.trim() || currentUser.full_name,
      bio: bioInput.trim(),
      city: cityInput.trim(),
      avatar_url: avatarInput.trim() || currentUser.avatar_url,
    });
    setIsEditing(false);
  };

  const currentTabPosts =
    activeSubTab === 'posts'
      ? myPosts
      : activeSubTab === 'likes'
      ? likedPosts
      : savedPosts;

  return (
    <div className="max-w-2xl mx-auto pb-24 text-right">
      {/* Cover and Avatar Header */}
      <div className="relative">
        <div className="h-36 sm:h-44 w-full bg-gradient-to-r from-pink-900 via-purple-900 to-zinc-900 overflow-hidden">
          {currentUser.cover_url && (
            <img
              src={currentUser.cover_url}
              alt="الغلاف"
              className="w-full h-full object-cover opacity-60"
            />
          )}
        </div>

        <div className="px-5 relative -mt-12 flex items-end justify-between">
          <div className="relative">
            <img
              src={
                currentUser.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              }
              alt=""
              className="w-24 h-24 rounded-full object-cover border-4 border-zinc-950 shadow-xl"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition"
          >
            <Edit3 size={14} />
            <span>تعديل الملف</span>
          </button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="px-5 mt-3 space-y-3">
        <div>
          <h2 className="text-xl font-bold text-white">{currentUser.full_name}</h2>
          <span className="text-xs text-zinc-400 font-medium">@{currentUser.username}</span>
        </div>

        {currentUser.bio && (
          <p className="text-sm text-zinc-200 leading-relaxed">{currentUser.bio}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-zinc-400">
          {currentUser.city && (
            <div className="flex items-center gap-1">
              <MapPin size={13} className="text-pink-400" />
              <span>{currentUser.city}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={13} />
            <span>انضم في ٢٠٢٦</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 py-2 border-y border-zinc-850 text-xs">
          <div>
            <span className="font-bold text-white ml-1">
              {formatCount(currentUser.following_count || 389)}
            </span>
            <span className="text-zinc-400">يتابع</span>
          </div>
          <div>
            <span className="font-bold text-white ml-1">
              {formatCount(currentUser.followers_count || 1420)}
            </span>
            <span className="text-zinc-400">متابع</span>
          </div>
          <div>
            <span className="font-bold text-white ml-1">{myPosts.length}</span>
            <span className="text-zinc-400">منشور</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-zinc-800 mt-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('posts')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            activeSubTab === 'posts'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Grid size={15} />
          <span>منشوراتي ({myPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('likes')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            activeSubTab === 'likes'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Heart size={15} />
          <span>الإعجابات ({likedPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('saved')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
            activeSubTab === 'saved'
              ? 'border-pink-500 text-pink-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bookmark size={15} />
          <span>المحفوظات ({savedPosts.length})</span>
        </button>
      </div>

      {/* Tab Posts Feed */}
      <div className="p-4 space-y-4">
        {currentTabPosts.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 text-sm">
            {activeSubTab === 'posts' && 'لم تقم بنشر أي منشور بعد. انقر على (+) للنشر!'}
            {activeSubTab === 'likes' && 'لم تعجب بأي منشور بعد.'}
            {activeSubTab === 'saved' && 'لم تقم بحفظ أي منشورات بعد.'}
          </div>
        ) : (
          currentTabPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onToggleLike={onToggleLike}
              onToggleBookmark={onToggleBookmark}
              onOpenComments={onOpenComments}
              onAskAiAboutPost={onAskAiAboutPost}
            />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative z-10 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl animate-slide-up text-right">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-base text-zinc-100">تعديل الملف الشخصي</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">النبذة التعريفية (Bio)</label>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">المدينة أو البلد</label>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">رابط صورة الحساب (Avatar URL)</label>
                <input
                  type="url"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfileTab;
