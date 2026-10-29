import React from 'react';
import { X, CheckCheck, Heart, MessageSquare, UserPlus, AtSign } from 'lucide-react';
import { Notification, formatDate } from '../lib/types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onSelectPost?: (postId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectPost,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart size={14} className="text-pink-500 fill-pink-500" />;
      case 'comment':
        return <MessageSquare size={14} className="text-blue-400" />;
      case 'follow':
        return <UserPlus size={14} className="text-emerald-400" />;
      case 'mention':
        return <AtSign size={14} className="text-amber-400" />;
      default:
        return <Heart size={14} className="text-pink-500" />;
    }
  };

  const getActionText = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return 'أعجب بمنشورك';
      case 'comment':
        return 'علق على منشورك';
      case 'follow':
        return 'قام بمتابعتك الآن';
      case 'mention':
        return 'أشار إليك في تعليق';
      default:
        return 'تفاعل معك';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/95 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-zinc-100">الإشعارات</h3>
            {unreadCount > 0 && (
              <span className="text-[11px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} جديدة
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-zinc-800 transition"
              >
                <CheckCheck size={14} />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-zinc-400">
              <p className="text-base font-semibold text-zinc-300">لا توجد إشعارات حالياً</p>
              <p className="text-xs text-zinc-500 mt-1">ستظهر هنا تفاعلات الآخرين مع منشوراتك وقصصك.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.entity_id && onSelectPost) {
                    onSelectPost(n.entity_id);
                    onClose();
                  }
                }}
                className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                  n.read
                    ? 'bg-zinc-900/60 border-zinc-800/60 hover:bg-zinc-850/60'
                    : 'bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/15'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      n.actor?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        n.actor?.full_name || 'ع'
                      )}&background=ec4899&color=fff`
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                  <div className="absolute -bottom-1 -left-1 p-1 rounded-full bg-zinc-900 border border-zinc-800 shadow">
                    {getIcon(n.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-200">
                    <span className="font-bold text-zinc-100 ml-1">
                      {n.actor?.full_name || 'مستخدم'}
                    </span>
                    <span className="text-zinc-400">{getActionText(n.type)}</span>
                  </p>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {formatDate(n.created_at)}
                  </span>
                </div>

                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0 mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationsDrawer;
