import React, { useState, useRef } from 'react';
import { X, ImagePlus, Sparkles, Send, Hash, Check } from 'lucide-react';
import { Post, Profile } from '../lib/types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile;
  onPostCreated: (post: Post) => void;
}

const PRESET_TAGS = ['آني', 'تقنية', 'يوميات', 'تصميم', 'برمجة', 'أفكار', 'فنون'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPostCreated,
}) => {
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['آني']);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    setIsSubmitting(true);

    const newPost: Post = {
      id: `post_${Date.now()}`,
      user_id: currentUser.id,
      content: content.trim(),
      media_url: imageUrl || undefined,
      created_at: new Date().toISOString(),
      author: currentUser,
      likes_count: 0,
      comments_count: 0,
      liked_by_me: false,
      saved_by_me: false,
      tags: selectedTags,
    };

    setTimeout(() => {
      onPostCreated(newPost);
      setIsSubmitting(false);
      setContent('');
      setImageUrl('');
      setSelectedTags(['آني']);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl text-right animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <h3 className="font-bold text-base text-zinc-100">نشر محتوى جديد</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 my-4">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt=""
            className="w-10 h-10 rounded-full object-cover border border-zinc-800"
          />
          <div>
            <h4 className="font-bold text-sm text-zinc-100">{currentUser.full_name}</h4>
            <span className="text-xs text-zinc-400">@{currentUser.username}</span>
          </div>
        </div>

        {/* Text Area */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="ما الذي يجول في خاطرك اليوم؟ شارك أفكارك، تجاربك، أو استفساراتك مع مجتمع آني..."
            rows={4}
            className="w-full bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition resize-none"
            autoFocus
          />

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-zinc-700 max-h-56 bg-black">
              <img src={imageUrl} alt="معاينة" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white hover:bg-black transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Image URL input if toggled */}
          {showImageInput && !imageUrl && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="أدخل رابط الصورة (URL)..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
              />
            </div>
          )}

          {/* Tags selector */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Hash size={13} />
              <span>اختر وسوماً لمنشورك:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-pink-500 text-white font-medium shadow-sm shadow-pink-500/30'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750'
                    }`}
                  >
                    {isSelected && <Check size={11} />}
                    <span>#{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition"
              >
                <ImagePlus size={16} className="text-pink-400" />
                <span>رفع صورة</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition"
              >
                رابط صورة
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!content.trim() && !imageUrl)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-pink-500/20 disabled:opacity-40 hover:opacity-95 transition transform active:scale-95"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'جاري النشر...' : 'نشر'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreatePostModal;
