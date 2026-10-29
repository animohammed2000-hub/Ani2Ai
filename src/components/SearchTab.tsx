import React, { useState } from 'react';
import { Search, UserPlus, TrendingUp, Hash, Check } from 'lucide-react';
import { Post, Profile } from '../lib/types';
import PostCard from './PostCard';

interface SearchTabProps {
  posts: Post[];
  currentUserId: string;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onAskAiAboutPost: (text: string) => void;
}

const POPULAR_TOPICS = [
  { tag: 'تقنية', postsCount: 342 },
  { tag: 'آني', postsCount: 890 },
  { tag: 'تصميم_واجهات', postsCount: 215 },
  { tag: 'ذكاء_اصطناعي', postsCount: 520 },
  { tag: 'برمجة', postsCount: 430 },
  { tag: 'يوميات', postsCount: 610 },
];

const SUGGESTED_CREATORS: Profile[] = [
  {
    id: 'sug_1',
    full_name: 'أحمد التميمي',
    username: 'ahmed_t',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'مهتم بعمارة البرمجيات والسحابة ☁️',
    city: 'البصرة',
  },
  {
    id: 'sug_2',
    full_name: 'مريم الكعبي',
    username: 'maryam_ux',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'مصممة منتجات وتجارب مستخدم 🎨',
    city: 'دبي',
  },
  {
    id: 'sug_3',
    full_name: 'زيد سامي',
    username: 'zaid_s',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    bio: 'صانع محتوى تقني ومهتم بالهواتف الذكية 📱',
    city: 'عمان',
  },
];

export const SearchTab: React.FC<SearchTabProps> = ({
  posts,
  currentUserId,
  onToggleLike,
  onToggleBookmark,
  onOpenComments,
  onAskAiAboutPost,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'creators'>('all');
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  const toggleFollow = (id: string) => {
    setFollowedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredPosts = posts.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchesContent = p.content.toLowerCase().includes(q);
    const matchesAuthor =
      p.author?.full_name?.toLowerCase().includes(q) ||
      p.author?.username?.toLowerCase().includes(q);
    const matchesTag = p.tags?.some((t) => t.toLowerCase().includes(q));
    return matchesContent || matchesAuthor || matchesTag;
  });

  const filteredCreators = SUGGESTED_CREATORS.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.bio.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-4 pb-24 text-right">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن أصدقاء، منشورات، أو مواضيع..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pr-11 pl-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-850 pb-2">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
            filterType === 'all'
              ? 'bg-pink-500 text-white'
              : 'text-zinc-400 hover:text-white bg-zinc-900'
          }`}
        >
          الكل
        </button>
        <button
          type="button"
          onClick={() => setFilterType('posts')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
            filterType === 'posts'
              ? 'bg-pink-500 text-white'
              : 'text-zinc-400 hover:text-white bg-zinc-900'
          }`}
        >
          المنشورات ({filteredPosts.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('creators')}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
            filterType === 'creators'
              ? 'bg-pink-500 text-white'
              : 'text-zinc-400 hover:text-white bg-zinc-900'
          }`}
        >
          الأشخاص ({filteredCreators.length})
        </button>
      </div>

      {/* Trending Topics (when not searching specific queries) */}
      {!query && filterType === 'all' && (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
            <TrendingUp size={16} className="text-pink-400" />
            <span>المواضيع الرائجة في آني</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POPULAR_TOPICS.map((topic) => (
              <button
                key={topic.tag}
                type="button"
                onClick={() => setQuery(topic.tag)}
                className="flex flex-col p-2.5 rounded-xl bg-zinc-850/70 hover:bg-zinc-800 text-right transition border border-zinc-800"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-pink-400">
                  <Hash size={12} />
                  <span>{topic.tag}</span>
                </div>
                <span className="text-[10px] text-zinc-500 mt-0.5">
                  {topic.postsCount} منشور
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Creators */}
      {(filterType === 'all' || filterType === 'creators') && (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-3">
          <h4 className="text-xs font-bold text-zinc-300">أشخاص قد تود متابعتهم</h4>
          <div className="space-y-3">
            {filteredCreators.map((creator) => {
              const isFollowed = followedIds.includes(creator.id);
              return (
                <div
                  key={creator.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-zinc-850/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={creator.avatar_url || ''}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-xs text-white truncate">
                          {creator.full_name}
                        </h5>
                        {creator.city && (
                          <span className="text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                            {creator.city}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        @{creator.username}
                      </span>
                      <p className="text-[11px] text-zinc-300 truncate mt-0.5">
                        {creator.bio}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFollow(creator.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                      isFollowed
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-pink-500 hover:bg-pink-600 text-white shadow-sm shadow-pink-500/20'
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <Check size={12} />
                        <span>تتابعه</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={12} />
                        <span>متابعة</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Posts Results */}
      {(filterType === 'all' || filterType === 'posts') && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 px-1">
            {query ? `النتائج لكلمة "${query}"` : 'أحدث المنشورات في المجتمع'}
          </h4>
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              لم يتم العثور على أي منشورات مطابقة.
            </div>
          ) : (
            filteredPosts.map((post) => (
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
      )}
    </div>
  );
};
export default SearchTab;
