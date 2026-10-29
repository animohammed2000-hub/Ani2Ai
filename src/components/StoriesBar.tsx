import React, { useState } from 'react';
import { PlusCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story } from '../lib/types';

interface StoriesBarProps {
  stories: Story[];
  onAddStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ stories, onAddStory }) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  return (
    <>
      <section className="border-b border-zinc-850 bg-zinc-900/40 py-3.5 px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3.5">
          {stories.map((story, index) => {
            const isMine = story.id === 'story_mine';
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => {
                  if (isMine && !story.media_url) {
                    onAddStory();
                  } else {
                    setActiveStoryIndex(index);
                  }
                }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
              >
                <div
                  className={`relative p-0.5 rounded-full transition-transform duration-200 group-hover:scale-105 ${
                    story.has_unseen
                      ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600'
                      : isMine
                      ? 'bg-zinc-700'
                      : 'bg-zinc-800'
                  }`}
                >
                  <img
                    src={story.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={story.user_name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-zinc-950"
                  />
                  {isMine && (
                    <div className="absolute bottom-0 left-0 rounded-full bg-pink-500 p-0.5 text-white border-2 border-zinc-950 shadow">
                      <PlusCircle size={14} />
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate text-center">
                  {story.user_name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Full-Screen Story Viewer */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <div className="relative max-w-sm w-full h-[80vh] max-h-[720px] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col">
            {/* Progress Bar Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
              <div className="flex items-center gap-1 mb-3">
                {stories.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      idx <= (activeStoryIndex || 0) ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.user_avatar}
                    alt=""
                    className="w-8 h-8 rounded-full border border-white/20 object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{activeStory.user_name}</h4>
                    <span className="text-[10px] text-zinc-300">{activeStory.timestamp || 'منذ قليل'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(null)}
                  className="rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div className="flex-1 w-full relative flex items-center justify-center bg-black">
              {activeStory.media_url ? (
                <img
                  src={activeStory.media_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-8 text-center text-zinc-400">
                  <p className="text-lg font-medium text-white mb-2">قصتك فارغة</p>
                  <p className="text-sm">اضغط على زر الإضافة لنشر قصة جديدة تشارك بها أصدقاءك.</p>
                </div>
              )}

              {/* Navigation tap areas */}
              <button
                type="button"
                onClick={handlePrevStory}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNextStory}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Caption Footer */}
            {activeStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-center">
                <p className="text-sm text-white font-medium">{activeStory.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default StoriesBar;
