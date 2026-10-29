import React from 'react';
import { Sparkles, Bell, PlusCircle } from 'lucide-react';

interface HeaderProps {
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenAiAssistant: () => void;
  onOpenCreatePost: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenAiAssistant,
  onOpenCreatePost,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-pink-500/20">
            آ
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">
              Ani Social
            </span>
            <span className="text-xs font-medium text-zinc-400 block -mt-1">
              مساحة قريبة
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenCreatePost}
          className="hidden sm:flex items-center gap-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition"
        >
          <PlusCircle size={15} className="text-pink-400" />
          <span>منشور جديد</span>
        </button>

        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-pink-500/20 hover:opacity-95 transition transform active:scale-95"
        >
          <Sparkles size={14} className="animate-spin-slow" />
          <span>مساعد AI</span>
        </button>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-full transition"
          aria-label="الإشعارات"
        >
          <Bell size={20} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute 0 top-1 -right-0.5 min-w-[18px] h-[18px] px-1 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-zinc-950 animate-pulse">
              {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
export default Header;
