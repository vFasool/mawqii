'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function HostessQueueDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('queue_tickets')
      .select('*')
      .in('status', ['waiting', 'called'])
      .order('created_at', { ascending: true });

    if (data) setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (ticketId: string, status: string) => {
    const supabase = createClient();
    await supabase.from('queue_tickets').update({ status }).eq('id', ticketId);
    fetchTickets();
  };

  if (loading) return <div className="text-center py-20 text-gray-500">جاري تحميل لوحة الطابور...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 dir-rtl font-sans text-gray-900">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">شاشة الاستقبال وإدارة اللاين 🚦</h1>
          <p className="text-xs text-gray-500">التحكم المباشر في طابور انتظار الطاولات ورسائل النداء</p>
        </div>
        <span className="bg-amber-100 text-amber-800 font-bold px-4 py-1.5 rounded-full text-xs">
          في الانتظار حالياً: {tickets.length}
        </span>
      </div>

      <div className="space-y-3">
        {tickets.map((t, index) => (
          <div
            key={t.id}
            className={`p-5 rounded-2xl border flex justify-between items-center transition ${
              t.status === 'called' ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-xl bg-neutral-900 text-white font-black text-base flex items-center justify-center">
                #{index + 1}
              </span>
              <div>
                <h3 className="font-bold text-sm text-gray-900">{t.customer_name} ({t.party_size} أشخاص)</h3>
                <span className="text-xs text-gray-500 font-mono">📱 {t.customer_phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {t.status === 'waiting' && (
                <button
                  onClick={() => updateStatus(t.id, 'called')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow"
                >
                  النداء للطاولة 🔔
                </button>
              )}

              {t.status === 'called' && (
                <button
                  onClick={() => updateStatus(t.id, 'seated')}
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow"
                >
                  تم الجلوس ✅
                </button>
              )}

              <button
                onClick={() => updateStatus(t.id, 'cancelled')}
                className="bg-gray-100 text-red-600 hover:bg-red-50 font-bold px-3 py-2 rounded-xl text-xs transition"
              >
                إلغاء ✕
              </button>
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed text-gray-400 text-xs">
            لا يوجد زبائن في طابور الانتظار حالياً ☕️
          </div>
        )}
      </div>
    </div>
  );
}