'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TableReservationModal({
  businessId,
  whatsapp,
  primaryColor,
}: {
  businessId: string;
  whatsapp: string;
  primaryColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date || !time || loading) return;

    setLoading(true);
    try {
      const supabase = createClient();

      await supabase.from('table_reservations').insert([
        {
          business_id: businessId,
          customer_name: name,
          customer_phone: phone,
          guests_count: guests,
          reservation_date: date,
          reservation_time: time,
        },
      ]);
    } catch (err) {
      console.log('Reservation save error:', err);
    }

    const text = `🍽️ *طلب حجز طاولة جديد*
-----------------------------
👤 *الاسم:* ${name}
📱 *الجوال:* ${phone}
👥 *عدد الأشخاص:* ${guests}
📅 *التاريخ:* ${date}
⏰ *الوقت:* ${time}
-----------------------------`;

    const whatsappUrl = whatsapp
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`
      : '#';

    setLoading(false);
    setIsOpen(false);

    if (whatsapp) {
      window.open(whatsappUrl, '_blank');
    } else {
      alert('تم إرسال طلب الحجز بنجاح!');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-4 py-2 rounded-full text-xs transition border border-neutral-700"
      >
        حجز طاولة 🍽️
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl text-white">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-lg">🍽️ حجز طاولة بالمطعم</h3>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">الاسم الكريم</label>
                <input type="text" required placeholder="أدخل اسمك" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">رقم الجوال</label>
                <input type="text" required placeholder="0500000000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500" />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">عدد الأشخاص</label>
                  <input type="number" min="1" value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">التاريخ</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs outline-none text-neutral-300" />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">الوقت</label>
                  <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs outline-none text-neutral-300" />
                </div>
              </div>

              <button type="submit" disabled={loading} className={`w-full ${primaryColor} text-white font-bold py-3 rounded-xl text-xs transition shadow-lg mt-2`}>
                {loading ? 'جاري التأكيد...' : 'تأكيد حجز الطاولة 📲'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}