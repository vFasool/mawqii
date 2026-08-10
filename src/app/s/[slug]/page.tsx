'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PublicSitePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // حالة اللغة (ar, en, ur)
  const [lang, setLang] = useState<'ar' | 'en' | 'ur'>('ar');

  // الفلتر الغذائي والمساعد الذكي
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [aiNutritionPrompt, setAiNutritionPrompt] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // تقسيم الحساب بين الأصدقاء
  const [splitCount, setSplitCount] = useState<number>(1);

  // بيانات خيار التوصيل للسيارة
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState('takeaway');
  const [carModel, setCarModel] = useState('');
  const [carColor, setCarColor] = useState('');
  const [carPlate, setCarPlate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [arrivedAlert, setArrivedAlert] = useState(false);

  // نصوص الترجمة للواجهة
  const t = {
    ar: {
      menuTitle: 'قائمة الطعام والمشروبات',
      add: '+ إضافة',
      viewCart: 'عرض السلة والطلب 🛒',
      items: 'عناصر',
      cartTitle: 'سلة الطلبات 🧾',
      total: 'الإجمالي:',
      name: 'الاسم الكريم',
      phone: 'رقم الجوال',
      pickupType: 'طريقة الاستلام:',
      takeaway: 'استلام سفري 🛍️',
      dineIn: 'تناول بالفرع 🍽️',
      curbside: 'توصيل للسيارة (Curbside) 🚗',
      carInfo: 'بيانات السيارة لتسليم الطلب:',
      carModel: 'نوع السيارة (كامري..)',
      carColor: 'اللون (أبيض..)',
      carPlate: 'رقم اللوحة (أ ب ج 1234)',
      confirm: 'تأكيد الطلب 🚀',
      submitting: 'جاري الإرسال...',
      orderSuccess: 'تم إرسال طلبك بنجاح!',
      arrivedBtn: '🚨 أنا عند الباب / بالموقف الآن!',
      arrivedAlert: 'تم تنبيه الكاشير! الموظف قادم لسيارتك الآن 🏃‍♂️',
      currency: 'ر.س',
      aiNutritionTitle: '🥗 المساعد الغذائي الذكي (AI Health Advisor)',
      all: 'الكل 🍽️',
      keto: 'كيتو 🥩',
      lowCal: 'قليل السعرات 🥑',
      vegan: 'نباتي 🌿',
      askAiPlaceholder: 'اسأل الـ AI عن نظامك (مثلاً: مناسب للتنشيف؟)...',
      askAiBtn: 'تحليل الوجبة ✨',
      splitTitle: '💳 تقسيم الحساب بين الأصدقاء:',
      splitPerPerson: 'نصيب الفرد الواحد:',
      queueBtn: '🚦 طابور الانتظار والحجز'
    },
    en: {
      menuTitle: 'Menu & Dishes',
      add: '+ Add',
      viewCart: 'View Cart & Checkout 🛒',
      items: 'items',
      cartTitle: 'Your Cart 🧾',
      total: 'Total:',
      name: 'Your Name',
      phone: 'Phone Number',
      pickupType: 'Pickup Method:',
      takeaway: 'Takeaway 🛍️',
      dineIn: 'Dine-in 🍽️',
      curbside: 'Curbside Pickup 🚗',
      carInfo: 'Car Details for Pickup:',
      carModel: 'Car Model (e.g. Camry)',
      carColor: 'Car Color (e.g. White)',
      carPlate: 'License Plate Number',
      confirm: 'Confirm Order 🚀',
      submitting: 'Submitting...',
      orderSuccess: 'Order Placed Successfully!',
      arrivedBtn: "🚨 I'm at the Curb / Parking!",
      arrivedAlert: 'Staff Alerted! Coming to your car now 🏃‍♂️',
      currency: 'SAR',
      aiNutritionTitle: '🥗 AI Health Advisor',
      all: 'All 🍽️',
      keto: 'Keto 🥩',
      lowCal: 'Low Calorie 🥑',
      vegan: 'Vegan 🌿',
      askAiPlaceholder: 'Ask AI about your goal (e.g. High protein option?)...',
      askAiBtn: 'Analyze ✨',
      splitTitle: '💳 Split Bill with Friends:',
      splitPerPerson: 'Per person share:',
      queueBtn: '🚦 Table Line & Waiting'
    },
    ur: {
      menuTitle: 'مینو اور طعام',
      add: '+ شامل کریں',
      viewCart: 'کارٹ دیکھیں اور آرڈر کریں 🛒',
      items: 'اشیاء',
      cartTitle: 'آپ کی کارٹ 🧾',
      total: 'کل رقم:',
      name: 'آپ کا نام',
      phone: 'فون نمبر',
      pickupType: 'وصول کرنے کا طریقہ:',
      takeaway: 'ٹیک اوے 🛍️',
      dineIn: 'ڈائن ان 🍽️',
      curbside: 'گاڑی میں ترسیل 🚗',
      carInfo: 'گاڑی کی تفصیلات:',
      carModel: 'گاڑی کا ماڈل',
      carColor: 'رنگ',
      carPlate: 'نمبر پلیٹ',
      confirm: 'آرڈر کی تصدیق کریں 🚀',
      submitting: 'ارسال ہو رہا ہے...',
      orderSuccess: 'آرڈر کامیابی کے ساتھ موصول ہو گیا!',
      arrivedBtn: '🚨 میں پارکنگ میں پہنچ گیا ہوں!',
      arrivedAlert: 'عملے کو اطلاع دے دی گئی ہے! 🏃‍♂️',
      currency: 'SAR',
      aiNutritionTitle: '🥗 AI نیوٹریشن گائیڈ',
      all: 'تمام 🍽️',
      keto: 'کیٹو 🥩',
      lowCal: 'کم کیلوریز 🥑',
      vegan: 'سبزی خور 🌿',
      askAiPlaceholder: 'اپنی صحت سے متعلق سوال پوچھیں...',
      askAiBtn: 'تجزیہ کریں ✨',
      splitTitle: '💳 بل تقسیم کریں:',
      splitPerPerson: 'فی شخص حصہ:',
      queueBtn: '🚦 انتظار کی لائن'
    }
  }[lang];

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: site } = await supabase
        .from('websites')
        .select(`id, business_id, businesses ( id, business_name, description, whatsapp, map_url, is_open, work_hours )`)
        .eq('slug', slug)
        .single();

      if (site) {
        const biz = Array.isArray(site.businesses) ? site.businesses[0] : site.businesses;
        setBusiness(biz);

        if (biz) {
          const { data: serv } = await supabase.from('services').select('*').eq('business_id', biz.id);
          if (serv) setServices(serv);
        }
      }
      setLoading(false);
    }

    if (slug) loadData();
  }, [slug]);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      return sum + itemPrice * item.quantity;
    }, 0);
  };

  const handleAiNutritionCheck = () => {
    if (!aiNutritionPrompt.trim()) return;
    const bestItem = services[Math.floor(Math.random() * services.length)];
    if (bestItem) {
      setAiRecommendation(`بناءً على طلبك ("${aiNutritionPrompt}"): نوصي بـ ${bestItem.title} - خيار متوازن وممتاز!`);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || submitting) return;

    setSubmitting(true);
    const supabase = createClient();

    const orderData = {
      business_id: business.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      order_type: orderType,
      car_details: orderType === 'curbside' ? { model: carModel, color: carColor, plate: carPlate } : null,
      items: cart,
      total_amount: calculateTotal(),
      status: 'pending'
    };

    const { data, error } = await supabase.from('orders').insert([orderData]).select().single();

    if (!error && data) {
      setCreatedOrder(data);
      setOrderSuccess(true);
      setCart([]);
    } else {
      alert('حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى.');
    }
    setSubmitting(false);
  };

  const handleNotifyArrival = async () => {
    if (!createdOrder) return;
    const supabase = createClient();
    await supabase.from('orders').update({ status: 'car_arrived' }).eq('id', createdOrder.id);
    setArrivedAlert(true);
  };

  if (loading) return <div className="text-center py-20 text-gray-500">جاري التحميل...</div>;
  if (!business) return <div className="text-center py-20 text-red-500">الموقع غير موجود.</div>;

  const totalAmount = calculateTotal();
  const perPersonAmount = (totalAmount / (splitCount || 1)).toFixed(2);

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 pb-24 ${lang === 'ar' || lang === 'ur' ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* هيدر الترجمة واللغات */}
      <div className="bg-neutral-900 text-white py-3 px-4 flex justify-between items-center border-b border-neutral-800 text-xs">
        <span className="text-emerald-400 font-bold">🌐 Language / اللغة</span>
        <div className="flex gap-1.5">
          <button onClick={() => setLang('ar')} className={`px-2.5 py-1 rounded-lg font-bold transition ${lang === 'ar' ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>🇸🇦 عربي</button>
          <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-lg font-bold transition ${lang === 'en' ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>🇺🇸 EN</button>
          <button onClick={() => setLang('ur')} className={`px-2.5 py-1 rounded-lg font-bold transition ${lang === 'ur' ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>🇵🇰 أردو</button>
        </div>
      </div>

      {/* الهيدر الرئيسي وتنبيه الحجز والطاولات */}
      <div className="bg-neutral-900 text-white py-10 px-4 text-center space-y-3 shadow-lg">
        <h1 className="text-3xl font-black text-emerald-400">{business.business_name}</h1>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">{business.description}</p>
        
        {/* زر الوصول المباشر لطابور الانتظار وحجز الطاولة */}
        <div className="pt-2">
          <Link
            href={`/queue/${slug}`}
            className="inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            <span>{t.queueBtn}</span>
            <span>⏱️</span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* المساعد الغذائي الذكي والفلتر */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-emerald-700 flex items-center gap-1.5">
            {t.aiNutritionTitle}
          </h3>

          <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
            <button onClick={() => setSelectedDiet('all')} className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${selectedDiet === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{t.all}</button>
            <button onClick={() => setSelectedDiet('keto')} className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${selectedDiet === 'keto' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{t.keto}</button>
            <button onClick={() => setSelectedDiet('lowCal')} className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${selectedDiet === 'lowCal' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{t.lowCal}</button>
            <button onClick={() => setSelectedDiet('vegan')} className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${selectedDiet === 'vegan' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{t.vegan}</button>
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={aiNutritionPrompt}
              onChange={(e) => setAiNutritionPrompt(e.target.value)}
              placeholder={t.askAiPlaceholder}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
            />
            <button
              onClick={handleAiNutritionCheck}
              className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0 hover:bg-emerald-500 transition"
            >
              {t.askAiBtn}
            </button>
          </div>

          {aiRecommendation && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-900 font-bold animate-fade-in">
              💡 {aiRecommendation}
            </div>
          )}
        </div>

        {/* المنيو والوجبات */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.menuTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  <span className="text-sm font-black text-emerald-600 block">{item.price} {t.currency}</span>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="bg-neutral-900 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shrink-0"
                >
                  {t.add}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* شريط السلة العائم */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-2xl flex justify-between items-center transition"
          >
            <span className="bg-emerald-800 text-xs px-2.5 py-1 rounded-lg">{cart.reduce((a, b) => a + b.quantity, 0)} {t.items}</span>
            <span className="text-sm">{t.viewCart}</span>
            <span className="text-sm font-black">{totalAmount} {t.currency}</span>
          </button>
        </div>
      )}

      {/* مودال السلة والدفع */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg">{t.cartTitle}</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 text-xl font-bold">✕</button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-6 space-y-4">
                <span className="text-4xl block">🎉</span>
                <h4 className="font-bold text-emerald-600 text-lg">{t.orderSuccess}</h4>
                
                {createdOrder?.order_type === 'curbside' && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-amber-800 block">🚗 {t.curbside}</span>
                    
                    {arrivedAlert ? (
                      <div className="bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs animate-pulse">
                        {t.arrivedAlert}
                      </div>
                    ) : (
                      <button
                        onClick={handleNotifyArrival}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl text-xs shadow-md transition"
                      >
                        {t.arrivedBtn}
                      </button>
                    )}
                  </div>
                )}

                <button onClick={() => { setOrderSuccess(false); setIsCartOpen(false); }} className="bg-neutral-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl">OK</button>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-xl">
                      <span className="font-bold">{item.title} × {item.quantity}</span>
                      <span className="font-black text-emerald-600">{parseFloat(item.price) * item.quantity} {t.currency}</span>
                    </div>
                  ))}
                </div>

                {/* حاسبة تقسيم الحساب بين الأصدقاء */}
                <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold text-emerald-900">
                    <span>{t.splitTitle}</span>
                    <select
                      value={splitCount}
                      onChange={(e) => setSplitCount(parseInt(e.target.value))}
                      className="bg-white border rounded-lg px-2 py-1 outline-none text-xs font-bold"
                    >
                      <option value={1}>شخص واحد (كامل)</option>
                      <option value={2}>شخصين (2)</option>
                      <option value={3}>3 أشخاص</option>
                      <option value={4}>4 أشخاص</option>
                      <option value={5}>5 أشخاص</option>
                    </select>
                  </div>
                  {splitCount > 1 && (
                    <div className="flex justify-between items-center font-black text-emerald-700 pt-1 border-t border-emerald-200">
                      <span>{t.splitPerPerson}</span>
                      <span>{perPersonAmount} {t.currency}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-2 flex justify-between font-black text-sm">
                  <span>{t.total}</span>
                  <span className="text-emerald-600">{totalAmount} {t.currency}</span>
                </div>

                <div className="space-y-2 pt-1">
                  <input type="text" required placeholder={t.name} value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs outline-none" />
                  <input type="tel" required placeholder={t.phone} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs outline-none" />
                  
                  <label className="text-xs font-bold block pt-1 text-gray-700">{t.pickupType}</label>
                  <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="w-full p-2.5 border rounded-xl text-xs outline-none bg-gray-50 font-bold">
                    <option value="takeaway">{t.takeaway}</option>
                    <option value="dine_in">{t.dineIn}</option>
                    <option value="curbside">{t.curbside}</option>
                  </select>

                  {orderType === 'curbside' && (
                    <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200 space-y-2 animate-fade-in">
                      <span className="text-[11px] font-bold text-emerald-800 block">{t.carInfo}</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" required placeholder={t.carModel} value={carModel} onChange={(e) => setCarModel(e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white" />
                        <input type="text" required placeholder={t.carColor} value={carColor} onChange={(e) => setCarColor(e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white" />
                      </div>
                      <input type="text" required placeholder={t.carPlate} value={carPlate} onChange={(e) => setCarPlate(e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white" />
                    </div>
                  )}
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs shadow-lg mt-2">
                  {submitting ? t.submitting : t.confirm}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}