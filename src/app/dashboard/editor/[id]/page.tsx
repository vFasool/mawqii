'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('emerald');
  const [isOpen, setIsOpen] = useState(true);
  const [workHours, setWorkHours] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  const [businessId, setBusinessId] = useState('');
  const [slug, setSlug] = useState('');

  const [services, setServices] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [addonsText, setAddonsText] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');

  // أخصائي التسويق بالذكاء الاصطناعي
  const [platform, setPlatform] = useState<'x' | 'instagram' | 'tiktok'>('instagram');
  const [generatedPost, setGeneratedPost] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    async function fetchWebsite() {
      const supabase = createClient();
      const { data } = await supabase
        .from('websites')
        .select(`id, slug, custom_domain, business_id, businesses ( id, business_name, description, whatsapp, map_url, primary_color, is_open, work_hours )`)
        .eq('id', siteId)
        .single();

      if (data) {
        setSlug(data.slug);
        setCustomDomain(data.custom_domain || '');
        setBusinessId(data.business_id);
        const biz = Array.isArray(data.businesses) ? data.businesses[0] : data.businesses;
        if (biz) {
          setBusinessName(biz.business_name || '');
          setDescription(biz.description || '');
          setWhatsapp(biz.whatsapp || '');
          setMapUrl(biz.map_url || '');
          setPrimaryColor(biz.primary_color || 'emerald');
          setIsOpen(biz.is_open ?? true);
          setWorkHours(biz.work_hours || '');

          const { data: serviceData } = await supabase.from('services').select('*').eq('business_id', biz.id);
          if (serviceData) setServices(serviceData);

          const { data: couponData } = await supabase.from('coupons').select('*').eq('business_id', biz.id);
          if (couponData) setCoupons(couponData);

          const { data: resData } = await supabase.from('table_reservations').select('*').eq('business_id', biz.id).order('created_at', { ascending: false });
          if (resData) setReservations(resData);
        }
      }
      setLoading(false);
    }

    if (siteId) fetchWebsite();
  }, [siteId]);

  const handleGenerateAIMarketing = () => {
    setGeneratingAi(true);
    setTimeout(() => {
      const topItems = services.map(s => s.title).join('، ');
      if (platform === 'x') {
        setGeneratedPost(`☕️ اشتهي شيء يضبط مزاجك اليوم؟\n\nفي ${businessName} جهزنا لك أحلى الأطباق والمشروبات: ${topItems || 'أفضل الوجبات'}.\n\nاطلب الآن مباشرة عبر موقعنا الإلكتروني وسلّم على الزحام! 👇🔥\nhttps://mawqii.com/s/${slug}`);
      } else if (platform === 'instagram') {
        setGeneratedPost(`اللحظات الحلوة تبدأ من ${businessName} ✨\n\nنقدم لك تجربة استثنائية مع قائمتنا المتميزة: ${topItems || 'أشهر وجباتنا'}.\n\n📍 اطلب عبر الرابط في البايو أو زُرنا اليوم!\n\n#كافيهات #مطاعم #موقعي #${businessName.replace(/\s+/g, '_')}`);
      } else {
        setGeneratedPost(`🎬 فكرة فيديو تيك توك ترند:\n1. افتح الفيديو بمقطع سريع لتجهيز إحدى وجباتك (${services[0]?.title || 'الوجبة الرئيسية'}).\n2. اكتب النص العريض: "لو ما جربت ${businessName} لليوم فإنت مفوت كثير!"\n3. الكابشن: رابط الطلب المباشر في البايو 🔥\nhttps://mawqii.com/s/${slug}`);
      }
      setGeneratingAi(false);
    }, 400);
  };

  const handleAddService = async () => {
    if (!newTitle.trim()) return;

    const parsedOptions = addonsText.split(',').map(item => {
      const [name, price] = item.split(':');
      if (name && price) {
        return { name: name.trim(), price: parseFloat(price.trim()) || 0 };
      }
      return null;
    }).filter(Boolean);

    const supabase = createClient();
    const { data } = await supabase
      .from('services')
      .insert([{ 
        business_id: businessId, 
        title: newTitle, 
        price: newPrice, 
        description: newDesc, 
        image_url: newImage,
        options: parsedOptions 
      }])
      .select().single();

    if (data) {
      setServices([...services, data]);
      setNewTitle(''); setNewPrice(''); setNewDesc(''); setNewImage(''); setAddonsText('');
    }
  };

  const handleAddCoupon = async () => {
    if (!couponCode.trim() || !discountValue) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('coupons')
      .insert([{ business_id: businessId, code: couponCode.toUpperCase(), discount_type: discountType, discount_value: parseFloat(discountValue) }])
      .select().single();

    if (data) {
      setCoupons([...coupons, data]);
      setCouponCode(''); setDiscountValue('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from('websites').update({ custom_domain: customDomain }).eq('id', siteId);
    await supabase.from('businesses').update({ 
      business_name: businessName, description, whatsapp, map_url: mapUrl, primary_color: primaryColor,
      is_open: isOpen, work_hours: workHours
    }).eq('id', businessId);

    setSaving(false);
    router.refresh();
  };

  if (loading) return <div className="text-center py-20 text-gray-500">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 dir-rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">محرر النشاط الاحترافي الشامل</h1>
          <p className="text-xs text-gray-500">الرابط الفريد: {slug}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/dashboard')} className="px-4 py-2 border rounded-lg text-sm">اللوحة</button>
          <a href={`/s/${slug}`} target="_blank" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">معاينة حيّة ↗</a>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold">
            {saving ? 'جاري الحفظ...' : 'حفظ التغيرات'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* كرت التسويق بالذكاء الاصطناعي البارز */}
          <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-5 rounded-2xl shadow-xl border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-sm text-purple-200">📸 أخصائي تسويق إنستغرام وX (AI)</h2>
              <span className="text-[10px] bg-purple-500/40 border border-purple-400/50 px-2 py-0.5 rounded-full font-bold">جديد ✨</span>
            </div>
            <p className="text-[11px] text-purple-200">صياغة منشورات وإنستغرام وتغريدات جاهزة لنشاطك تلقائياً!</p>
            
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-purple-500/20">
              <button type="button" onClick={() => setPlatform('instagram')} className={`py-1.5 text-xs font-bold rounded-lg transition ${platform === 'instagram' ? 'bg-purple-600 text-white' : 'text-purple-300'}`}>إنستغرام 📸</button>
              <button type="button" onClick={() => setPlatform('x')} className={`py-1.5 text-xs font-bold rounded-lg transition ${platform === 'x' ? 'bg-purple-600 text-white' : 'text-purple-300'}`}>منصة X 🐦</button>
              <button type="button" onClick={() => setPlatform('tiktok')} className={`py-1.5 text-xs font-bold rounded-lg transition ${platform === 'tiktok' ? 'bg-purple-600 text-white' : 'text-purple-300'}`}>تيك توك 🎬</button>
            </div>

            <button type="button" onClick={handleGenerateAIMarketing} disabled={generatingAi} className="w-full bg-white text-purple-950 font-black py-2.5 rounded-xl text-xs transition shadow hover:bg-purple-50">
              {generatingAi ? 'جاري الصياغة... 🪄' : 'توليد بوست تسويقي ✨'}
            </button>

            {generatedPost && (
              <div className="bg-black/60 border border-purple-500/40 p-3 rounded-xl space-y-2 mt-2">
                <p className="text-xs text-purple-100 whitespace-pre-line leading-relaxed select-all">{generatedPost}</p>
                <button type="button" onClick={() => { navigator.clipboard.writeText(generatedPost); alert('تم نسخ المحتوى! 📋'); }} className="w-full bg-purple-500/30 hover:bg-purple-500/40 text-purple-200 font-bold py-1.5 rounded-lg text-xs">
                  نسخ النص 📋
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl border border-indigo-200 space-y-3">
            <h2 className="font-bold text-indigo-900 text-sm">🌐 إعدادات الدومين الخاص (Custom Domain)</h2>
            <input 
              type="text" 
              value={customDomain} 
              onChange={(e) => setCustomDomain(e.target.value)} 
              placeholder="مثال: myrestaurant.com" 
              className="w-full p-2 border rounded-lg text-sm ltr text-left" 
            />
          </div>

          <div className="bg-white p-5 rounded-xl border space-y-3">
            <h2 className="font-bold text-gray-800 text-sm">🕒 حالة النشاط وأوقات العمل</h2>
            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border">
              <span className="text-xs font-bold text-gray-700">حالة استقبال الطلبات:</span>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full text-white transition ${isOpen ? 'bg-emerald-600' : 'bg-red-600'}`}
              >
                {isOpen ? 'مفتوح للطلبات 🟢' : 'مغلق حالياً 🔴'}
              </button>
            </div>
            <input type="text" value={workHours} onChange={(e) => setWorkHours(e.target.value)} placeholder="أوقات العمل" className="w-full p-2 border rounded-lg text-sm" />
          </div>

          <div className="bg-white p-5 rounded-xl border space-y-3">
            <h2 className="font-bold text-gray-800">بيانات النشاط الأساسية</h2>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="اسم النشاط" />
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="الوصف" />
            <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="966500000000" className="w-full p-2 border rounded-lg text-sm" />
            <input type="text" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="رابط الخريطة" className="w-full p-2 border rounded-lg text-sm" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-purple-200 space-y-3">
            <h2 className="font-bold text-purple-900 text-sm">🎟️ إنشاء كود خصم</h2>
            <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="w-full p-2 border rounded-lg text-sm uppercase" placeholder="AHLY10" />
            <div className="grid grid-cols-2 gap-2">
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="p-2 border rounded-lg text-xs">
                <option value="percentage">نسبة مئوية (%)</option>
                <option value="fixed">مبلغ ثابت (ر.س)</option>
              </select>
              <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="p-2 border rounded-lg text-sm" placeholder="القيمة" />
            </div>
            <button onClick={handleAddCoupon} className="w-full bg-purple-600 text-white py-2 rounded-lg text-xs font-bold">+ إضافة كود الخصم</button>
          </div>

          <div className="bg-white p-5 rounded-xl border space-y-3">
            <h2 className="font-bold text-gray-800">إضافة عنصر وخيارات المنيو</h2>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="اسم الوجبة" />
            <input type="text" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="السعر" />
            <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="الوصف" />
            <input type="text" value={newImage} onChange={(e) => setNewImage(e.target.value)} className="w-full p-2 border rounded-lg text-sm" placeholder="رابط الصورة" />
            
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">الإضافات والخيارات (اسم:سعر تفصلها فاصلة)</label>
              <input 
                type="text" 
                value={addonsText} 
                onChange={(e) => setAddonsText(e.target.value)} 
                className="w-full p-2 border rounded-lg text-xs" 
                placeholder="مثال: جبنة دبل:3, صوص حار:2" 
              />
            </div>

            <button onClick={handleAddService} className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-semibold">+ إضافة للمنيو</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🍽️ حجوزات الطاولات القادمة ({reservations.length})</h3>
            {reservations.length > 0 ? (
              <div className="space-y-3">
                {reservations.map((r) => (
                  <div key={r.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">{r.customer_name} ({r.guests_count} أشخاص)</span>
                      <span className="text-gray-500">📱 {r.customer_phone} | 📅 {r.reservation_date} | ⏰ {r.reservation_time}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full">مؤكد ✅</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">لا توجد حجوزات طاولات حتى الآن.</p>
            )}
          </div>

          <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 space-y-6">
            <div className="text-center border-b border-neutral-800 pb-4">
              <h2 className="text-3xl font-extrabold text-emerald-400">{businessName || 'اسم مطعمك'}</h2>
              <p className="text-neutral-400 text-sm mt-1">{description}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-emerald-400 text-center">معاينة قائمة الطعام والإضافات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s, index) => (
                  <div key={s.id || index} className="bg-neutral-800/80 p-4 rounded-xl border border-neutral-700 space-y-2">
                    <div className="flex gap-3 items-center">
                      {s.image_url && <img src={s.image_url} alt={s.title} className="w-12 h-12 object-cover rounded-lg" />}
                      <div>
                        <h4 className="font-bold text-white text-sm">{s.title}</h4>
                        <p className="text-xs text-neutral-400">{s.description}</p>
                        <span className="text-xs font-bold text-emerald-400 mt-1 block">{s.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}