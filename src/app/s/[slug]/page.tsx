'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PublicSitePage() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const slug = rawSlug ? decodeURIComponent(rawSlug).trim().toLowerCase() : '';

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  
  // حالات السلة والمودالات
  const [cart, setCart] = useState<{ [key: string]: { item: any; quantity: number } }>({});
  const [showCartModal, setShowCartModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // بيانات العميل للطلب
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('سفري'); // سفري / محلي / توصيل

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      setLoading(true);

      let { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('site_id', slug)
        .maybeSingle();

      if (!data) {
        const res = await supabase
          .from('businesses')
          .select('*')
          .eq('id', slug)
          .maybeSingle();
        data = res.data;
      }

      if (data) {
        setBusiness(data);
        const { data: sData } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', data.id);

        if (sData) setServices(sData);
      }

      setLoading(false);
    }

    fetchData();
  }, [slug]);

  // التحكم بالسلة
  const addToCart = (item: any) => {
    setCart((prev) => {
      const currentQty = prev[item.id]?.quantity || 0;
      return {
        ...prev,
        [item.id]: { item, quantity: currentQty + 1 },
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId]) {
        if (newCart[itemId].quantity > 1) {
          newCart[itemId].quantity -= 1;
        } else {
          delete newCart[itemId];
        }
      }
      return newCart;
    });
  };

  // إحصائيات السلة
  const cartItems = Object.values(cart);
  const totalItemsCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, i) => {
    const price = parseFloat(i.item.price || i.item.cost || 0);
    return sum + price * i.quantity;
  }, 0);

  // إرسال الطلب للمطعم عبر الواتساب
  const handleSendOrder = () => {
    if (!business?.phone) {
      alert('لم يتم إضافة رقم هاتف للمطعم بعد.');
      return;
    }
    if (!customerName.trim()) {
      alert('لطفاً اكتب اسمك لإكمال الطلب.');
      return;
    }

    let message = `*طلب جديد من: ${customerName}*\n`;
    message += `نوع الطلب: ${orderType}\n`;
    message += `------------------------\n`;

    cartItems.forEach(({ item, quantity }) => {
      const name = item.name || item.title || item.item_name || 'صنف';
      const price = item.price || item.cost || 0;
      message += `• ${name} x${quantity} (${price * quantity} ر.س)\n`;
    });

    message += `------------------------\n`;
    message += `*الإجمالي النهائي: ${totalPrice} ر.س*`;

    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = business.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium text-lg">جاري تحميل القائمة...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center" dir="rtl">
        <h1 className="text-2xl font-bold mb-2 text-red-600">الموقع غير موجود</h1>
        <p className="text-gray-600 mb-4">تأكد من صحة الرابط وحاول مرة أخرى.</p>
        <Link href="/" className="text-blue-600 underline font-medium">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 pb-28" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        
        {/* هيدر المطعم */}
        <div className="text-center border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{business.business_name || business.name}</h1>
          <p className="text-gray-600 mb-4">{business.description || 'أهلاً بكم في صفحتنا'}</p>

          <div className="flex justify-center gap-3 mt-4">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition shadow-sm"
            >
              📅 حجز طاولة
            </button>
            
            {business.phone && (
              <a 
                href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-sm"
              >
                💬 تواصل واتساب
              </a>
            )}
          </div>
        </div>

        {/* قائمة الأصناف */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">قائمة الطعام / الخدمات</h2>
        
        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-4">لا توجد أصناف مضافة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((item) => {
              const itemName = item.name || item.title || item.item_name || item.service_name || 'صنف';
              const itemDesc = item.description || item.desc || item.details;
              const itemPrice = item.price || item.cost || 0;
              const inCartQty = cart[item.id]?.quantity || 0;

              return (
                <div key={item.id} className="border border-gray-100 p-4 rounded-xl bg-gray-50 flex justify-between items-center shadow-sm">
                  <div className="flex-1 ml-2">
                    <h3 className="font-bold text-lg text-gray-900">{itemName}</h3>
                    {itemDesc && <p className="text-sm text-gray-500 mt-1">{itemDesc}</p>}
                    <span className="font-bold text-green-700 text-base mt-2 inline-block">{itemPrice} SAR</span>
                  </div>

                  {/* أزرار إضافة/إنقاص الصنف */}
                  <div className="flex items-center gap-2 bg-white border rounded-xl p-1 shadow-sm">
                    {inCartQty > 0 ? (
                      <>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="font-bold text-gray-900 w-5 text-center">{inCartQty}</span>
                      </>
                    ) : null}
                    <button 
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 flex items-center justify-center bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* شريط السلة العائم في الأسفل */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <button 
            onClick={() => setShowCartModal(true)}
            className="w-full bg-green-600 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center font-bold text-lg hover:bg-green-700 transition"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white text-green-700 w-7 h-7 rounded-full text-sm flex items-center justify-center">
                {totalItemsCount}
              </span>
              <span>عرض السلة</span>
            </div>
            <span>{totalPrice} ر.س</span>
          </button>
        </div>
      )}

      {/* مودال السلة وإرسال الطلب */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white p-6 rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900">سلة الطلبات</h3>
              <button onClick={() => setShowCartModal(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>

            {/* تفاصيل المنتجات بالداخل */}
            <div className="space-y-3">
              {cartItems.map(({ item, quantity }) => {
                const name = item.name || item.title || item.item_name || 'صنف';
                const price = item.price || item.cost || 0;

                return (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">{price} SAR × {quantity} = {price * quantity} SAR</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 bg-gray-200 rounded text-gray-800 font-bold">-</button>
                      <span className="font-bold">{quantity}</span>
                      <button onClick={() => addToCart(item)} className="w-7 h-7 bg-green-600 text-white rounded font-bold">+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* المجموع */}
            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t text-gray-900">
              <span>المجموع الكلي:</span>
              <span className="text-green-700">{totalPrice} ر.س</span>
            </div>

            {/* بيانات الزبون */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">الاسم الكريم:</label>
                <input 
                  type="text" 
                  placeholder="أدخل اسمك هنا"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm outline-none focus:border-green-600 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">نوع الطلب:</label>
                <select 
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm outline-none bg-white text-gray-900"
                >
                  <option value="سفري">سفري (استلام من الفرع)</option>
                  <option value="محلي">محلي (تناول في المطعم)</option>
                  <option value="توصيل">توصيل</option>
                </select>
              </div>
            </div>

            {/* زر إرسال الطلب */}
            <button 
              onClick={handleSendOrder}
              className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-center block hover:bg-green-700 transition"
            >
              📲 إرسال الطلب عبر الواتساب
            </button>
          </div>
        </div>
      )}

      {/* مودال حجز الطاولة */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-900">حجز طاولة</h3>
            <p className="text-sm text-gray-600">للحجز المباشر يرجى التواصل معنا عبر الواتساب أو الاتصال.</p>
            <div className="pt-2 flex flex-col gap-2">
              {business.phone ? (
                <a 
                  href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}?text=مرحباً،%20أرغب%20في%20حجز%20طاولة`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm"
                >
                  إرسال طلب حجز عبر الواتساب
                </a>
              ) : (
                <p className="text-xs text-red-500">لم يتم إضافة رقم هاتف للمطعم بعد.</p>
              )}
              <button 
                onClick={() => setShowBookingModal(false)}
                className="bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
