'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function QueuePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [myTicket, setMyTicket] = useState<any>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  // إجمالي عدد الطاولات الافتراضي للنشاط (مثلاً 7 طاولات)
  const TOTAL_TABLES = 7;
  const AVG_MINS_PER_TABLE = 12; // معدل الانتظار التقريبي لكل شخص باللاين

  useEffect(() => {
    async function loadQueueData() {
      const supabase = createClient();
      const { data: site } = await supabase
        .from('websites')
        .select(`business_id, businesses ( id, business_name, description )`)
        .eq('slug', slug)
        .single();

      if (site) {
        const biz = Array.isArray(site.businesses) ? site.businesses[0] : site.businesses;
        setBusiness(biz);

        if (biz) {
          fetchActiveTickets(biz.id);
        }
      }
      setLoading(false);
    }

    if (slug) loadQueueData();
  }, [slug]);

  const fetchActiveTickets = async (bizId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('queue_tickets')
      .select('*')
      .eq('business_id', bizId)
      .in('status', ['waiting', 'called'])
      .order('created_at', { ascending: true });

    if (data) {
      setTickets(data);
      // التحقق مما إذا كان العميل مسجلاً مسبقاً في هذه الجلسة
      const savedTicketId = localStorage.getItem(`queue_ticket_${bizId}`);
      if (savedTicketId) {
        const found = data.find((t) => t.id === savedTicketId);
        if (found) setMyTicket(found);
      }
    }
  };

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || submitting) return;

    setSubmitting(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('queue_tickets')
      .insert([{
        business_id: business.id,
        customer_name: name,
        customer_phone: phone,
        party_size: partySize,
        status: 'waiting'
      }])
      .select().single();

    if (data) {
      setMyTicket(data);
      localStorage.setItem(`queue_ticket_${business.id}`, data.id);
      fetchActiveTickets(business.id);
    } else {
      alert('حدث خطأ في التسجيل بالقائمة، حاول مرة أخرى.');
    }
    setSubmitting(false);
  };

  // حساب ترتيب العميل والوقت التقديري
  const calculateQueueDetails = () => {
    if (!myTicket) return { position: 0, waitTime: 0 };
    const waitingIndex = tickets.findIndex((t) => t.id === myTicket.id);
    if (waitingIndex === -1) return { position: 0, waitTime: 0 };

    const position = waitingIndex + 1; // ترتيبه في الطابور
    const waitTime = position * AVG_MINS_PER_TABLE; // الوقت التقديري بالدقائق
    return { position, waitTime };
  };

  if (loading) return <div className="text-center py-20 text-gray-500">جاري تحميل قائمة الانتظار...</div>;
  if (!business) return <div className="text-center py-20 text-red-500">النشاط غير موجود.</div>;

  const { position, waitTime } = calculateQueueDetails();

  return (
    <div className="min-h-screen bg-neutral-950 text-white dir-rtl px-4 py-10 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full space-y-6">
        
        {/* الهيدر */}
        <div className="text-center space-y-2">
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30">
            🚦 طابور الانتظار الذكي
          </span>
          <h1 className="text-3xl font-black text-white">{business.business_name}</h1>
          <p className="text-xs text-neutral-400">احجز دورك في الطابور وتابع وقت دخولك مباشرة من جوالك</p>
        </div>

        {/* إذا كان العميل مسجل بالفعل في القائمة */}
        {myTicket ? (
          <div className="bg-neutral-900 border border-emerald-500/40 rounded-3xl p-6 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse"></div>

            {myTicket.status === 'called' ? (
              <div className="space-y-4 py-4 animate-bounce">
                <span className="text-5xl block">🔔</span>
                <h2 className="text-2xl font-black text-emerald-400">طاولتك جاهزة الآن!</h2>
                <p className="text-xs text-neutral-300">تفضل بالتوجه للمستقبل/الكاشير لاستلام طاولتك فوراً.</p>
              </div>
            ) : (
              <>
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                  <span className="text-xs text-neutral-500 block font-bold mb-1">أهلاً بك يا {myTicket.customer_name}</span>
                  <span className="text-xs text-emerald-400 font-bold">عدد الأشخاص: {myTicket.party_size}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 text-center">
                    <span className="text-[11px] text-neutral-400 font-bold block mb-1">ترتيبك في اللاين</span>
                    <span className="text-4xl font-black text-emerald-400">#{position}</span>
                    <span className="text-[10px] text-neutral-500 block mt-1">أملمك {position - 1} طاولات</span>
                  </div>

                  <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 text-center">
                    <span className="text-[11px] text-neutral-400 font-bold block mb-1">الوقت التقديري</span>
                    <span className="text-4xl font-black text-amber-400">~{waitTime}</span>
                    <span className="text-[10px] text-neutral-500 block mt-1">دقيقة تقريباً</span>
                  </div>
                </div>

                <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl text-[11px] text-emerald-300">
                  💡 يمكنك الانتظار في سيارتك، وسيتحدث عداد الوقت وترتيبك تلقائياً!
                </div>
              </>
            )}

            <button
              onClick={() => {
                localStorage.removeItem(`queue_ticket_${business.id}`);
                setMyTicket(null);
              }}
              className="text-xs text-neutral-500 hover:text-red-400 transition underline pt-2 block mx-auto"
            >
              إلغاء الحجز من الطابور
            </button>
          </div>
        ) : (
          /* نموذج الانضمام للطابور */
          <form onSubmit={handleJoinQueue} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex justify-between items-center text-xs">
              <span className="text-neutral-400 font-bold">المشغول حالياً باللاين:</span>
              <span className="bg-amber-500/20 text-amber-400 font-black px-2.5 py-1 rounded-lg border border-amber-500/30">
                {tickets.length} طاولات في الانتظار ⏳
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">الاسم الكريم</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: فيصل عبدالله"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">رقم الجوال</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxx"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1.5">عدد الأشخاص (الحجم)</label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-emerald-500 transition"
              >
                <option value={1}>شخص واحد (1)</option>
                <option value={2}>شخصين (2)</option>
                <option value={3}>3 أشخاص</option>
                <option value={4}>4 أشخاص</option>
                <option value={5}>5+ أشخاص (عائلات)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-xl text-xs transition shadow-lg mt-2"
            >
              {submitting ? 'جاري الحجز...' : 'دخول طابور الانتظار 🚶‍♂️'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}