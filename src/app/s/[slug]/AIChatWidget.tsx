'use client';

import { useState } from 'react';

export default function AIChatWidget({
  businessId,
  businessName,
  menu,
  primaryColor,
}: {
  businessId: string;
  businessName: string;
  menu: any[];
  primaryColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: `مرحباً بك! أنا مساعد ${businessName} الذكي 🤖. كيف يمكنني مساعدتك في اختيار وجبتك اليوم؟` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, message: userText, menu }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      }
    } catch {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'عذراً، حدث خطأ أثناء التواصل مع المساعد الذكي.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`${primaryColor} text-white font-bold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition transform`}
        >
          <span>🤖</span>
          <span className="text-sm">المساعد الذكي للطلبات</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-neutral-900 border border-neutral-800 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden dir-rtl">
          <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="font-bold text-sm text-white">مساعد {businessName}</h4>
                <p className="text-[10px] text-emerald-400 font-semibold">متصل الآن بالذكاء الاصطناعي</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white text-sm font-bold">✕</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-neutral-950/40 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-semibold mr-auto text-left'
                    : 'bg-neutral-800 text-neutral-200 border border-neutral-700 ml-auto'
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-neutral-500 text-xs italic">جاري التفكير واقتراح الوجبات...</div>}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              placeholder="اسأل عن الوجبات أو الأسعار..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
            <button type="submit" disabled={loading} className={`${primaryColor} text-white font-bold px-4 py-2 rounded-xl text-xs`}>
              إرسال
            </button>
          </form>
        </div>
      )}
    </div>
  );
}