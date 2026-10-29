import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, Lightbulb, Copy, Check } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPostText?: (text: string) => void;
  initialPrompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyPostText,
  initialPrompt,
}) => {
  const [input, setInput] = useState(initialPrompt || '');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'أهلاً بك في مساعد آني الذكي! ✨ أنا هنا لمساعدتك في كتابة منشورات مميزة، اقتراح أفكار تفاعلية، وتحسين تجربة النشر والتواصل.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    '💡 فكرة لمنشور تفاعلي شيق',
    '✍️ صياغة نص ترحيبي بمجتمع آني',
    '#️⃣ أفضل وسوم للمحتوى البرمجي والتصميم',
    '💬 رد لطيف ومحفز على تعليق',
  ];

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply = '';
      const lower = promptText.toLowerCase();

      if (lower.includes('فكرة') || lower.includes('منشور')) {
        reply =
          'إليك فكرة منشور تفاعلي:\n\n"سؤال لكل المطورين والمصممين في آني: ما هي الأداة أو التقنية التي غيرت مسار عملكم هذا العام تماماً وتتمنون لو بدأتم باستخدامها مبكراً؟ شاركونا تجاربكم! 🚀💬"\n\nالوسوم المقترحة: #تقنية #تطوير #آني #تجارب';
      } else if (lower.includes('ترحيب') || lower.includes('ترحيب')) {
        reply =
          'صياغة ترحيبية جاهزة:\n\n"يسعدني الانضمام إلى مجتمع آني (Ani Social)! أتطلع لمشاركة رحلتي في التصميم والبرمجة والتواصل مع كل المبدعين هنا. مرحباً بالجميع! 👋✨"\n\nالوسوم: #آني #بداية_جديدة #مرحبا_بالجميع';
      } else if (lower.includes('وسوم') || lower.includes('هاشتاق')) {
        reply =
          'أفضل الوسوم الرائجة:\n#برمجة #تصميم_واجهات #ذكاء_اصطناعي #رياكت #تقنية_عربية #آني_سوشيال';
      } else {
        reply = `شكراً لسؤالك! بخصوص "${promptText}":\nيمكنك دائماً التركيز على مشاركة القيمة الواقعية والقصص الشخصية، وإرفاق صورة جذابة، وطرح سؤال في نهاية المنشور لزيادة التفاعل في مجتمع آني! 🌟`;
      }

      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: reply,
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 600);
  };

  const handleCopyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-slide-up text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100">مساعد آني الذكي (AI)</h3>
              <p className="text-[10px] text-zinc-400">توليد أفكار، تحسين صياغة، واقتراح محتوى تفاعلي</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-850 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-zinc-850">
          {quickPrompts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSendPrompt(q)}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1 rounded-full border border-zinc-800 transition whitespace-nowrap flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-pink-400 flex-shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-br-none'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.sender === 'assistant' && m.id !== 'welcome' && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopyText(m.text, m.id)}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>

                    {onApplyPostText && (
                      <button
                        type="button"
                        onClick={() => {
                          onApplyPostText(m.text);
                          onClose();
                        }}
                        className="text-[11px] text-pink-400 hover:underline"
                      >
                        استخدم كمنشور
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-zinc-400">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-pink-400">
                <Bot size={15} />
              </div>
              <div className="bg-zinc-900 p-2.5 rounded-2xl border border-zinc-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-zinc-850">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اطلب أي فكرة أو صياغة لمنشورك..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white disabled:opacity-40 hover:opacity-90 transition flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AIAssistantModal;
