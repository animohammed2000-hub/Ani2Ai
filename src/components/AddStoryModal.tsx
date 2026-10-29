import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Camera,
  Settings,
  Music,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Star,
  Smile,
  Type,
  Check,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Upload,
  ArrowRight,
} from 'lucide-react';
import { supabase, supabaseConfigured, storageBucket } from '../lib/supabase';
import { Profile } from '../lib/types';
import { MOCK_GUEST_PROFILE } from '../lib/mockData';

export interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentProfile: Profile | null;
  onStoryCreated?: () => void;
}

interface GalleryMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  duration?: string;
  durationSec?: number;
  label?: string;
}

// عينات وسائط جذابة للمحاكاة مطابقة لأسلوب استوديو الهاتف
const DEFAULT_GALLERY_ITEMS: GalleryMediaItem[] = [
  {
    id: 'sample-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    label: 'بورتريه',
  },
  {
    id: 'sample-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    label: 'شاطئ البحر',
  },
  {
    id: 'sample-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80',
    label: 'قهوة الصباح',
  },
  {
    id: 'sample-4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '0:15',
    durationSec: 15,
    label: 'فيديو ريل',
  },
  {
    id: 'sample-5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    label: 'طبيعة وجبال',
  },
  {
    id: 'sample-6',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    label: 'احتفال وإضاءة',
  },
  {
    id: 'sample-7',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    label: 'طعام وصحة',
  },
  {
    id: 'sample-8',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: '0:15',
    durationSec: 15,
    label: 'رحلة طبيعية',
  },
  {
    id: 'sample-9',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    label: 'تقنية وأضواء',
  },
  {
    id: 'sample-10',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&auto=format&fit=crop&q=80',
    label: 'أفكار ملهمة',
  },
  {
    id: 'sample-11',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    label: 'مناظر ساحرة',
  },
  {
    id: 'sample-12',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    label: 'تصميم وألوان',
  },
];

const MUSIC_PRESETS = [
  { id: '1', title: 'قهوة الصباح ☕', artist: 'أنغام هادئة' },
  { id: '2', title: 'طاقة ونشاط ⚡', artist: 'إيقاع إلكتروني' },
  { id: '3', title: 'أجواء ليلية 🌌', artist: 'لو-فاي مريح' },
  { id: '4', title: 'سفر وطريق 🚗', artist: 'ألحان حماسية' },
];

export const AddStoryModal: React.FC<AddStoryModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentProfile,
  onStoryCreated,
}) => {
  // الحالات العامة
  const [selectedCategory, setSelectedCategory] = useState<'recents' | 'videos' | 'favorites'>('recents');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [customGallery, setCustomGallery] = useState<GalleryMediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryMediaItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // حالات مرحلة التحرير (Story Editor)
  const [editorCaption, setEditorCaption] = useState('');
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [activeMusic, setActiveMusic] = useState<string | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [addYoursPrompt, setAddYoursPrompt] = useState<string | null>(null);
  const [showAddYoursModal, setShowAddYoursModal] = useState(false);
  const [filterStyle, setFilterStyle] = useState<'normal' | 'warm' | 'cool' | 'mono' | 'sunset'>('normal');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  // المراجع
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // إعادة التعيين عند الإغلاق
  useEffect(() => {
    if (!isOpen) {
      setSelectedItem(null);
      setSelectedFile(null);
      setEditorCaption('');
      setShowTextEditor(false);
      setActiveMusic(null);
      setAddYoursPrompt(null);
      setFilterStyle('normal');
      setIsPublishing(false);
      setPublishStatus(null);
    }
  }, [isOpen]);

  // قائمة الوسائط المدمجة
  const allGalleryItems = useMemo(() => {
    let list = [...customGallery, ...DEFAULT_GALLERY_ITEMS];
    if (selectedCategory === 'videos') {
      list = list.filter((item) => item.type === 'video');
    }
    return list;
  }, [customGallery, selectedCategory]);

  if (!isOpen) return null;

  // التعامل مع اختيار ملف من الكاميرا أو الجهاز
  const handleFileChosen = (file: File) => {
    const isVideo = file.type.startsWith('video');
    const objectUrl = URL.createObjectURL(file);
    const newItem: GalleryMediaItem = {
      id: `local-${Date.now()}`,
      type: isVideo ? 'video' : 'image',
      url: objectUrl,
      duration: isVideo ? '0:15' : undefined,
      durationSec: 15,
      label: file.name,
    };

    setCustomGallery((prev) => [newItem, ...prev]);
    setSelectedFile(file);
    setSelectedItem(newItem);
  };

  // اختيار عنصر من المعرض
  const handleSelectMedia = (item: GalleryMediaItem) => {
    setSelectedItem(item);
    setSelectedFile(null);
  };

  // دورة الفلاتر اللونية
  const cycleFilter = () => {
    const filters: Array<'normal' | 'warm' | 'cool' | 'mono' | 'sunset'> = [
      'normal',
      'warm',
      'cool',
      'mono',
      'sunset',
    ];
    const nextIdx = (filters.indexOf(filterStyle) + 1) % filters.length;
    setFilterStyle(filters[nextIdx]);
  };

  const getFilterClass = () => {
    switch (filterStyle) {
      case 'warm':
        return 'sepia-[0.3] contrast-[1.05] saturate-[1.2]';
      case 'cool':
        return 'hue-rotate-15 contrast-[1.1] brightness-[1.05]';
      case 'mono':
        return 'grayscale contrast-[1.2]';
      case 'sunset':
        return 'contrast-[1.15] saturate-[1.4] brightness-[0.95]';
      default:
        return '';
    }
  };

  // نشر القصة (سواء للعامة أو للأصدقاء المقربين)
  const handlePublishStory = async (isCloseFriends: boolean = false) => {
    if (!selectedItem) return;
    setIsPublishing(true);
    setPublishStatus('جارٍ معالجة القصة...');

    try {
      let finalMediaUrl = selectedItem.url;
      let mediaType = selectedItem.type;

      // إذا كان هناك اتصال حقيقي بـ Supabase والمستخدم ليس حساب ضيف
      const isGuest = userId === 'guest_user_aani' || !supabaseConfigured;

      if (!isGuest && selectedFile) {
        setPublishStatus('جارٍ رفع الوسائط...');
        const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const filePath = `${userId}/story-${Date.now()}-${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from(storageBucket)
          .upload(filePath, selectedFile, {
            contentType: selectedFile.type,
            upsert: true,
          });

        if (!uploadError) {
          const publicData = supabase.storage.from(storageBucket).getPublicUrl(filePath);
          if (publicData?.data?.publicUrl) {
            finalMediaUrl = publicData.data.publicUrl;
          }
        }
      }

      // بناء بيانات الستوري
      const storyPayload = {
        id: `story_${Date.now()}`,
        user_id: userId,
        media_url: finalMediaUrl,
        media_type: mediaType,
        caption: editorCaption.trim() || (activeMusic ? `🎵 ${activeMusic}` : null) || (addYoursPrompt ? `✨ ${addYoursPrompt}` : null),
        is_close_friends: isCloseFriends,
        duration_seconds: selectedItem.durationSec || 5,
        timed_texts: editorCaption.trim()
          ? [
              {
                id: 'txt-1',
                text: editorCaption.trim(),
                startTime: 0,
                endTime: selectedItem.durationSec || 5,
                x: 50,
                y: 50,
              },
            ]
          : [],
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        author: currentProfile || MOCK_GUEST_PROFILE,
      };

      // إذا كان مسجلاً في Supabase
      if (!isGuest && supabaseConfigured) {
        try {
          await supabase.from('stories').insert({
            user_id: userId,
            media_url: finalMediaUrl,
            media_type: mediaType,
            caption: storyPayload.caption,
            is_close_friends: isCloseFriends,
            duration_seconds: storyPayload.duration_seconds,
            timed_texts: storyPayload.timed_texts,
          });
        } catch (dbErr) {
          console.warn('[stories] تعذر الحفظ في قاعدة البيانات، الاعتماد على التخزين المحلي:', dbErr);
        }
      }

      // حفظ القصة محلياً دائماً لتظهر فوراً في شريط القصص
      try {
        const existingLocal = localStorage.getItem('aani_local_stories');
        const parsed = existingLocal ? JSON.parse(existingLocal) : [];
        const updated = [storyPayload, ...parsed.filter((s: any) => s.id !== storyPayload.id)];
        localStorage.setItem('aani_local_stories', JSON.stringify(updated.slice(0, 30)));
      } catch (locErr) {
        console.warn('[stories] localStorage error:', locErr);
      }

      setPublishStatus('تم النشر بنجاح! ✨');

      // إشعار التطبيق لتحديث شريط القصص فوراً
      window.dispatchEvent(new Event('aani:story-created'));
      if (onStoryCreated) {
        onStoryCreated();
      }

      setTimeout(() => {
        setIsPublishing(false);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('[AddStoryModal] خطأ النشر:', err);
      setPublishStatus('تعذر نشر القصة. يرجى المحاولة مرة أخرى.');
      setIsPublishing(false);
    }
  };

  // الملف الشخصي الفعلي أو الضيف
  const profile = currentProfile || MOCK_GUEST_PROFILE;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col overflow-hidden select-none animate-in fade-in duration-200"
      dir="ltr"
    >
      {/* مدخلات الكاميرا المخفية */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileChosen(e.target.files[0]);
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileChosen(e.target.files[0]);
        }}
      />

      {/* ---------------------------------------------------- */}
      {/* المرحلة 1: شاشة محرر القصة (إذا تم اختيار وسيط) */}
      {/* ---------------------------------------------------- */}
      {selectedItem ? (
        <div className="relative w-full h-full flex flex-col bg-black justify-between overflow-hidden">
          {/* شريط الأدوات العلوي في وضع التحرير */}
          <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {/* زر العودة للمركز */}
            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                setSelectedFile(null);
              }}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition"
              title="العودة للمعرض"
            >
              <ArrowRight size={22} />
            </button>

            {/* أدوات التحرير التفاعلية (Instagram style top icons) */}
            <div className="flex items-center gap-2">
              {/* زر إضافة نص */}
              <button
                type="button"
                onClick={() => setShowTextEditor(!showTextEditor)}
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center text-white transition ${
                  showTextEditor ? 'bg-pink-600' : 'bg-black/40 hover:bg-black/60'
                }`}
                title="إضافة نص"
              >
                <Type size={20} />
              </button>

              {/* زر الموسيقى */}
              <button
                type="button"
                onClick={() => setShowMusicPicker(!showMusicPicker)}
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center text-white transition ${
                  activeMusic ? 'bg-purple-600 text-white' : 'bg-black/40 hover:bg-black/60'
                }`}
                title="إضافة موسيقى"
              >
                <Music size={20} />
              </button>

              {/* زر ملصق Add Yours */}
              <button
                type="button"
                onClick={() => setShowAddYoursModal(true)}
                className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center text-white transition ${
                  addYoursPrompt ? 'bg-gradient-to-r from-pink-500 to-amber-500' : 'bg-black/40 hover:bg-black/60'
                }`}
                title="ملصق أضف خاصتك (Add Yours)"
              >
                <Smile size={20} />
              </button>

              {/* زر الفلاتر والمؤثرات */}
              <button
                type="button"
                onClick={cycleFilter}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition"
                title={`تغيير الفلتر: ${filterStyle}`}
              >
                <Sparkles size={20} className={filterStyle !== 'normal' ? 'text-pink-400' : 'text-white'} />
              </button>
            </div>
          </div>

          {/* نافذة اختيار الموسيقى السريعة */}
          {showMusicPicker && (
            <div
              className="absolute top-16 right-4 z-40 bg-zinc-900/95 border border-zinc-700/80 rounded-2xl p-3 w-64 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150"
              dir="rtl"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs font-bold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Music size={14} className="text-pink-400" /> إضافة موسيقى للستوري
                </span>
                <button onClick={() => setShowMusicPicker(false)} className="text-zinc-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {MUSIC_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveMusic(activeMusic === m.title ? null : m.title);
                      setShowMusicPicker(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-right transition ${
                      activeMusic === m.title ? 'bg-pink-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    <div>
                      <p>{m.title}</p>
                      <p className="text-[10px] text-zinc-400">{m.artist}</p>
                    </div>
                    {activeMusic === m.title && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* نافذة ملصق Add Yours */}
          {showAddYoursModal && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
              <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 flex items-center justify-center text-white">
                    <Smile size={18} />
                  </div>
                  <h3 className="font-bold text-sm text-white">ملصق أضف خاصتك (Add Yours)</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  اكتب موضوعاً أو فكرة تشجع أصدقاءك على المشاركة بستورياتهم الخاصة!
                </p>
                <input
                  type="text"
                  placeholder="مثال: صورة من قهوة اليوم ☕"
                  value={addYoursPrompt || ''}
                  onChange={(e) => setAddYoursPrompt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white outline-none focus:border-pink-500"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAddYoursPrompt(null);
                      setShowAddYoursModal(false);
                    }}
                    className="flex-1 py-2 text-xs text-zinc-400 bg-zinc-800 rounded-xl hover:bg-zinc-700"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddYoursModal(false)}
                    className="flex-1 py-2 text-xs font-bold text-white bg-pink-600 rounded-xl hover:bg-pink-700"
                  >
                    تثبيت الملصق
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* مساحة عرض الوسائط الرئيسية */}
          <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
            {selectedItem.type === 'video' ? (
              <video
                src={selectedItem.url}
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full object-cover transition-all duration-300 ${getFilterClass()}`}
              />
            ) : (
              <img
                src={selectedItem.url}
                alt=""
                className={`w-full h-full object-cover transition-all duration-300 ${getFilterClass()}`}
              />
            )}

            {/* ملصق الموسيقى العائم */}
            {activeMusic && (
              <div
                className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce"
                dir="rtl"
              >
                <Music size={14} className="text-pink-400 animate-spin" />
                <span>{activeMusic}</span>
                <button onClick={() => setActiveMusic(null)} className="text-zinc-400 hover:text-white mr-1">
                  <X size={12} />
                </button>
              </div>
            )}

            {/* ملصق Add Yours التفاعلي فوق المعاينة */}
            {addYoursPrompt && (
              <div
                className="absolute top-44 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-white/30 rounded-2xl p-3 text-center shadow-2xl backdrop-blur-md w-60"
                dir="rtl"
              >
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 text-white text-[10px] font-extrabold mb-1 shadow">
                  <Smile size={12} /> أضف خاصتك
                </div>
                <p className="text-xs font-bold text-white mt-1">{addYoursPrompt}</p>
                <div className="mt-2 text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                  <span>المس للمشاركة بالقصة</span>
                </div>
              </div>
            )}

            {/* مربع إدخال وكتابة النص فوق الصورة */}
            {showTextEditor ? (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-40" dir="rtl">
                <textarea
                  autoFocus
                  placeholder="اكتب شيئاً على قصتك..."
                  value={editorCaption}
                  onChange={(e) => setEditorCaption(e.target.value)}
                  className="w-full max-w-sm bg-transparent text-center text-white text-xl font-bold placeholder-white/50 outline-none resize-none"
                  rows={4}
                />
                <button
                  type="button"
                  onClick={() => setShowTextEditor(false)}
                  className="mt-6 px-6 py-2 rounded-full bg-white text-black font-bold text-sm shadow-xl"
                >
                  تم
                </button>
              </div>
            ) : editorCaption ? (
              <div
                onClick={() => setShowTextEditor(true)}
                className="absolute bottom-28 inset-x-6 cursor-pointer bg-black/60 backdrop-blur-md p-3.5 rounded-2xl text-center text-white text-sm font-semibold border border-white/20 shadow-2xl"
                dir="rtl"
              >
                {editorCaption}
              </div>
            ) : null}

            {/* رسالة تقدم النشر */}
            {publishStatus && (
              <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 backdrop-blur-md">
                <div className="w-12 h-12 rounded-full border-4 border-pink-500 border-t-transparent animate-spin mb-4" />
                <p className="text-white text-sm font-bold">{publishStatus}</p>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* شريط النشر السفلي على طريقة إنستغرام (Your Story / Close Friends) */}
          {/* ------------------------------------------------------------------ */}
          <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-between gap-3">
            {/* خيار 1: قصتك (Your Story) */}
            <button
              type="button"
              disabled={isPublishing}
              onClick={() => handlePublishStory(false)}
              className="flex-1 flex items-center justify-center gap-2.5 bg-zinc-900/90 hover:bg-zinc-800 active:scale-95 border border-zinc-700/80 rounded-full py-2.5 px-4 transition shadow-lg text-xs font-bold text-white"
            >
              <div className="relative">
                <img
                  src={
                    profile?.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  }
                  alt=""
                  className="w-6 h-6 rounded-full object-cover border border-white/30"
                />
              </div>
              <span>Your story (قصتك)</span>
            </button>

            {/* خيار 2: أصدقاء مقربون (Close Friends) */}
            <button
              type="button"
              disabled={isPublishing}
              onClick={() => handlePublishStory(true)}
              className="flex-1 flex items-center justify-center gap-2.5 bg-zinc-900/90 hover:bg-zinc-800 active:scale-95 border border-zinc-700/80 rounded-full py-2.5 px-4 transition shadow-lg text-xs font-bold text-white"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow">
                <Star size={13} fill="currentColor" />
              </div>
              <span>Close Friends</span>
            </button>

            {/* زر السهم السريع */}
            <button
              type="button"
              disabled={isPublishing}
              onClick={() => handlePublishStory(false)}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition shrink-0"
              title="نشر سريع"
            >
              <ChevronLeft size={22} className="stroke-[3]" />
            </button>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* المرحلة 0: شاشة المعرض واختيار الوسائط (Add to story) */
        /* ---------------------------------------------------- */
        <div className="w-full h-full flex flex-col bg-black overflow-hidden">
          {/* الشريط العلوي (Header) */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-black/90 sticky top-0 z-20">
            {/* زر الإغلاق X */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 -ml-2 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-900 transition"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            {/* العنوان الرئيسي في المنتصف */}
            <h1 className="text-base font-bold text-white tracking-wide">
              Add to story
            </h1>

            {/* أيقونة الكاميرا / الإعدادات في الطرف الآخر */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-2 text-zinc-300 hover:text-white rounded-full hover:bg-zinc-900 transition"
                title="فتح الكاميرا المباشرة"
              >
                <Camera size={22} />
              </button>
            </div>
          </header>

          {/* شريط البطاقات السريعة الأفقية (Add Yours, Music, Collage) */}
          <div className="py-3 px-4 overflow-x-auto no-scrollbar border-b border-zinc-900 bg-zinc-950/40">
            <div className="flex items-center gap-3 w-max">
              {/* بطاقة Add Yours */}
              <button
                type="button"
                onClick={() => {
                  setShowAddYoursModal(true);
                  if (allGalleryItems[0]) setSelectedItem(allGalleryItems[0]);
                }}
                className="flex items-center gap-2.5 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-zinc-900 border border-pink-500/30 hover:border-pink-500/60 rounded-2xl px-3.5 py-2.5 transition active:scale-95 text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow">
                  <Smile size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-pink-400 transition">
                    Add Yours
                  </h4>
                  <p className="text-[10px] text-zinc-400">أضف خاصتك واستجابة أصدقائك</p>
                </div>
              </button>

              {/* بطاقة Music */}
              <button
                type="button"
                onClick={() => {
                  setShowMusicPicker(true);
                  if (allGalleryItems[0]) setSelectedItem(allGalleryItems[0]);
                }}
                className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl px-3.5 py-2.5 transition active:scale-95 text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow">
                  <Music size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition">
                    Music
                  </h4>
                  <p className="text-[10px] text-zinc-400">إضافة موسيقى وألحان رائجة</p>
                </div>
              </button>

              {/* بطاقة Collage */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl px-3.5 py-2.5 transition active:scale-95 text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow">
                  <LayoutGrid size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                    Collage
                  </h4>
                  <p className="text-[10px] text-zinc-400">تجميع صور متعددة</p>
                </div>
              </button>
            </div>
          </div>

          {/* ترويسة المعرض (Recents Dropdown & Select Button) */}
          <div className="relative flex items-center justify-between px-4 py-3 bg-black">
            {/* القائمة المنسدلة للألبومات (Recents) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-zinc-300 transition"
              >
                <span>
                  {selectedCategory === 'recents'
                    ? 'Recents'
                    : selectedCategory === 'videos'
                    ? 'Videos'
                    : 'Favorites'}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
              </button>

              {showCategoryMenu && (
                <div className="absolute left-0 mt-2 z-30 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('recents');
                      setShowCategoryMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between ${
                      selectedCategory === 'recents' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    <span>Recents (الأحدث)</span>
                    {selectedCategory === 'recents' && <Check size={14} className="text-pink-500" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('videos');
                      setShowCategoryMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between ${
                      selectedCategory === 'videos' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800/50'
                    }`}
                  >
                    <span>Videos (الفيديوهات)</span>
                    {selectedCategory === 'videos' && <Check size={14} className="text-pink-500" />}
                  </button>
                </div>
              )}
            </div>

            {/* أزرار تحديد ورفع صور جديدة من الهاتف */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition"
              >
                <Upload size={13} className="text-pink-400" />
                <span>رفع من الهاتف</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition"
              >
                Select
              </button>
            </div>
          </div>

          {/* شبكة استوديو الصور (3-Column Gallery Grid) */}
          <div className="flex-1 overflow-y-auto p-1 pb-16">
            <div className="grid grid-cols-3 gap-1">
              {/* المربع الأول: أيقونة الكاميرا المباشرة */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="aspect-[9/16] bg-zinc-900 hover:bg-zinc-850 active:scale-95 rounded-sm flex flex-col items-center justify-center gap-2 transition group border border-zinc-800/50"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-pink-600/20 text-zinc-300 group-hover:text-pink-400 flex items-center justify-center transition border border-zinc-700">
                  <Camera size={24} />
                </div>
                <span className="text-[11px] font-medium text-zinc-400 group-hover:text-white transition">
                  Camera
                </span>
              </button>

              {/* بقية عناصر المعرض */}
              {allGalleryItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectMedia(item)}
                  className="relative aspect-[9/16] bg-zinc-900 rounded-sm overflow-hidden cursor-pointer group active:opacity-80 transition select-none"
                >
                  {item.type === 'video' ? (
                    <>
                      <video
                        src={item.url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        preload="metadata"
                      />
                      <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1">
                        <Play size={9} fill="currentColor" />
                        <span>{item.duration || '0:15'}</span>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.label || ''}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* طبقة تفاعلية عند المرور */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStoryModal;
