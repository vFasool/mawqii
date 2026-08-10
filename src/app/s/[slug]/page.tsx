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
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  const [cart, setCart] = useState<{ [key: string]: { item: any; quantity: number } }>({});
  const [showCartModal, setShowCartModal] = useState(false);

  // بيانات النموذج
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderType, setOrderType] = useState('استلام سفري 🛍️');
  const [paymentMethod, setPaymentMethod] = useState('كاش عند الاستلام 💵');

  const supabase = createClient();

  const parsePrice = (priceVal: any) => {
    if (!priceVal) return 0;
    const cleanNumber = String(priceVal).replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleanNumber);
    return isNaN(parsed) ? 0 : parsed;
  };

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

  const cartItems = Object.values(cart);
  const totalItemsCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, i) => {
    const price = parsePrice(i.item.price || i.item.cost);
    return sum + price * i.quantity;
  }, 0);

  const handleConfirmOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('لطفاً اكتب الاسم ورقم الجوال لتأكيد الطلب.');
      return;
    }

    if (orderType.includes('توصيل') && !customerAddress.trim()) {
      alert('لطفاً أدخل موقع التوصيل أو عنوانك.');
      return;
    }

    setSubmitting(true);

    const formattedItems = cartItems.map(({ item, quantity }) => ({
      id: item.id,
      name: item.name || item.title || item.item_name || 'صنف',
      price: parsePrice(item.price || item.cost),
      quantity,
    }));

    const orderPayload: any = {
      business_id: business.id,
      customer_name: customerName,
      customer_phone: customerPhone,
      address: customerAddress,
      order_type: orderType,
      payment_method: paymentMethod,
      items: formattedItems,
      total_price: totalPrice,
      total: totalPrice,
      status: 'جديد 🆕',
    };

    let { error } = await supabase.from('orders').insert([orderPayload]);

    setSubmitting(false);

    if (error) {
      alert('حدث خطأ أثناء إرسال الطلب: ' + error.message);
    } else {
      setOrderSuccess(true);
      setCart({});
    }
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
        <Link href="/" className="text-blue-600 underline font-medium">العودة للرئيسية</Link>
      </div>
    );
  }

  const phone = business.phone || business.phone_number || business.mobile;
  const location = business.location || business.address || business.map_url || business.google_maps;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 pb-28" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        
        {/* هيدر المطعم والمعلومات */}
        <div className="text-center border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{business.business_name || business.name}</h1>
          <p className="text-gray-600 mb-4">{business.description || 'مطعم سحابي يقدم وجبات سريعة'}</p>

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {phone && (
              <a 
                href={`tel:${phone}`}
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
              >
                📞 {phone}
              </a>
            )}
            {location && (
              <a 
                href={location.startsWith('http') ? location : `https://maps.google.com/?q=${encodeURIComponent(location)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
              >
                📍 موقع المطعم
              </a>
            )}
          </div>
        </div>

        {/* قائمة الأصناف */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">قائمة الطعام والمشروبات</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((item) => {
            const itemName = item.name || item.title || item.item_name || 'صنف';
            const itemPrice = parsePrice(item.price || item.cost);
            const inCartQty = cart[item.id]?.quantity || 0;

            return (
              <div key={item.id} className="border border-gray-100 p-4 rounded-xl bg-gray-50 flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{itemName}</h3>
                  <span className="font-bold text-gray-600 text-sm mt-1 inline-block">{itemPrice} ر.س</span>
                </div>

                <div className="flex items-center gap-2">
                  {inCartQty > 0 ? (
                    <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
                      <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 bg-gray-100 font-bold rounded text-gray-900">-</button>
                      <span className="font-bold text-sm text-gray-900">{inCartQty}</span>
                      <button onClick={() => addToCart(item)} className="w-7 h-7 bg-emerald-700 text-white font-bold rounded">+</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-900 transition"
                    >
                      + إضافة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* زر عرض السلة */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <button 
            onClick={() => { setOrderSuccess(false); setShowCartModal(true); }}
            className="w-full bg-emerald-800 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center font-bold text-lg hover:bg-emerald-900 transition"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white text-emerald-800 w-7 h-7 rounded-full text-sm flex items-center justify-center font-bold">
                {totalItemsCount}
              </span>
              <span>عرض سلة الطلبات</span>
            </div>
            <span>{totalPrice} ر.س</span>
          </button>
        </div>
      )}

      {/* نافذة السلة والدفع */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl" dir="rtl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">🛒 سلة الطلبات</h3>
              <button onClick={() => setShowCartModal(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-5xl">🎉</div>
                <h4 className="text-xl font-bold text-emerald-800">تم إرسال طلبك بنجاح!</h4>
                <p className="text-sm text-gray-600">تم توجيه الطلب إلى شاشة الاستقبال في المطعم وجاري تجهيزه.</p>
                <button 
                  onClick={() => setShowCartModal(false)}
                  className="w-full bg-emerald-800 text-white py-2.5 rounded-xl font-bold text-sm mt-4"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cartItems.map(({ item, quantity }) => {
                    const name = item.name || item.title || item.item_name || 'صنف';
                    const price = parsePrice(item.price || item.cost);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2 text-gray-700">
                        <span>{name} × {quantity}</span>
                        <span className="font-bold">{price * quantity} ر.س</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center font-bold text-base py-1 border-t text-gray-900">
                  <span>الإجمالي:</span>
                  <span className="text-emerald-800 font-extrabold">{totalPrice} ر.س</span>
                </div>

                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="الاسم الكريم"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 outline-none text-gray-900"
                  />
                  <input 
                    type="tel" 
                    placeholder="رقم الجوال (مثال: 0501234567)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">طريقة الاستلام:</label>
                  <select 
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-800 outline-none"
                  >
                    <option value="استلام سفري 🛍️">استلام سفري 🛍️</option>
                    <option value="تناول في المطعم (محلي) 🍽️">تناول في المطعم (محلي) 🍽️</option>
                    <option value="توصيل 🛵">توصيل 🛵</option>
                  </select>
                </div>

                {/* إظهار خانة الموقع/العنوان عند التوصيل */}
                {orderType.includes('توصيل') && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">📍 موقع التوصيل (رابط الخريطة أو الحي/الشارع):</label>
                    <input 
                      type="text" 
                      placeholder="ضع رابط موقعك من خرائط Google أو اسم الحي"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 outline-none text-gray-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">طريقة الدفع:</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-800 outline-none font-medium"
                  >
                    <option value="كاش عند الاستلام 💵">كاش عند الاستلام 💵</option>
                    <option value="Apple Pay 🍏">Apple Pay 🍏</option>
                    <option value="تابي (تقسيط) 🛍️">تابي (دفعة بعدين) 🛍️</option>
                  </select>
                </div>

                <button 
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                  className="w-full bg-emerald-800 text-white py-3 rounded-xl font-bold text-center block hover:bg-emerald-900 transition disabled:bg-gray-400"
                >
                  {submitting ? 'جاري تأكيد الطلب...' : 'تأكيد الطلب 🚀'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
