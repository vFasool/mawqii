'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selectedOptions?: { name: string; price: number }[];
};

export default function CartWidget({
  businessId,
  whatsapp,
  cart,
  onUpdateQuantity,
  onClearCart,
  primaryColor,
}: {
  businessId: string;
  whatsapp: string;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  primaryColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'apple_pay'>('apple_pay');
  const [loading, setLoading] = useState(false);

  // نظام الولاء بالنقاط
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [useLoyaltyDiscount, setUseLoyaltyDiscount] = useState(false);

  // الخصومات والكوبونات
  const [couponInput, setCouponInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // حساب المجموع مع خيارات الإضافات
  const subTotal = cart.reduce((sum, item) => {
    const optionsTotal = item.selectedOptions?.reduce((optSum, o) => optSum + o.price, 0) || 0;
    return sum + (item.price + optionsTotal) * item.quantity;
  }, 0);

  const loyaltyDiscount = useLoyaltyDiscount ? Math.min(subTotal, loyaltyPoints * 0.5) : 0; // كل نقطة = 0.5 ريال
  const finalTotal = Math.max(0, subTotal - discountAmount - loyaltyDiscount);

  // الفحص التلقائي لنقاط الولاء عند كتابة رقم الجوال
  useEffect(() => {
    async function checkPoints() {
      if (customerPhone.length >= 9) {
        const supabase = createClient();
        const { data } = await supabase
          .from('loyalty_points')
          .select('points')
          .eq('business_id', businessId)
          .eq('phone', customerPhone.trim())
          .single();

        if (data) setLoyaltyPoints(data.points || 0);
      }
    }
    checkPoints();
  }, [customerPhone, businessId]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    const supabase = createClient();

    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('business_id', businessId)
      .eq('code', couponInput.trim().toUpperCase())
      .single();

    if (data) {
      const calcDiscount = data.discount_type === 'percentage' ? (subTotal * data.discount_value) / 100 : data.discount_value;
      setDiscountAmount(calcDiscount);
      setAppliedCoupon(data.code);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || loading) return;

    setLoading(true);
    const supabase = createClient();

    // 1. تسجيل الطلب
    await supabase.from('orders').insert([
      {
        business_id: businessId,
        customer_name: customerName,
        customer_phone: customerPhone,
        order_type: orderType,
        payment_method: paymentMethod,
        items: cart,
        total_amount: finalTotal,
      },
    ]);

    // 2. تحديث/إضافة نقاط الولاء للزبون (كل 10 ر.س = 1 نقطة)
    const earnedPoints = Math.floor(finalTotal / 10);
    const newPointBalance = useLoyaltyDiscount ? earnedPoints : loyaltyPoints + earnedPoints;

    await supabase.from('loyalty_points').upsert(
      { business_id: businessId, phone: customerPhone.trim(), points: newPointBalance },
      { onConflict: 'business_id,phone' }
    );

    // 3. نص الفاتورة
    const itemsSummary = cart
      .map((item) => {
        const opts = item.selectedOptions?.map((o) => `+${o.name}`).join(' ') || '';
        return `• ${item.title} ${opts} × ${item.quantity}`;
      })
      .join('\n');

    const invoiceText = `🧾 *طلب جديد من الموقع*
-----------------------------
👤 *الاسم:* ${customerName || 'غير محدد'}
📱 *الجوال:* ${customerPhone}
⭐ *نقاط الولاء المكتسبة:* +${earnedPoints} نقطة

📦 *الطلبات:*
${itemsSummary}

💰 *الإجمالي النهائي:* ${finalTotal} ر.س
-----------------------------`;

    const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(invoiceText)}`;

    onClearCart();
    setLoading(false);
    setShowCheckout(false);
    setIsOpen(false);

    window.open(whatsappUrl, '_blank');
  };

  if (totalItems === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className={`${primaryColor} text-white font-bold px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition transform`}
        >
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-black">{totalItems}</span>
          <span className="text-sm">معاينة السلة ({finalTotal} ر.س) 🛒</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl text-white">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
              <h3 className="text-xl font-bold">🛒 سلة الطلبات</h3>
              <button onClick={() => setIsOpen(false)} className="text-neutral-400 font-bold">✕</button>
            </div>

            {!showCheckout ? (
              <>
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-white">{item.title}</h4>
                        {item.selectedOptions && item.selectedOptions.length > 0 && (
                          <div className="text-[10px] text-emerald-400 mt-0.5">
                            الإضافات: {item.selectedOptions.map((o) => `${o.name} (+${o.price}ر.س)`).join(', ')}
                          </div>
                        )}
                        <span className="text-xs text-neutral-400 block mt-1">{item.price} ر.س</span>
                      </div>
                      <div className="flex items-center gap-3 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-red-400 font-bold">-</button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-emerald-400 font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-800 pt-4 flex justify-between items-center">
                  <span className="text-sm text-neutral-400">الإجمالي:</span>
                  <span className="text-2xl font-black text-emerald-400">{subTotal} ر.س</span>
                </div>

                <button onClick={() => setShowCheckout(true)} className={`w-full ${primaryColor} text-white font-bold py-3 rounded-xl text-sm shadow-lg`}>
                  متابعة إتمام الطلب ←
                </button>
              </>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-4">
                <input type="text" required placeholder="الاسم الكريم" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs outline-none" />
                <input type="text" required placeholder="رقم الجوال (لحفظ نقاط مكافآتك ⭐)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs outline-none" />

                {/* كرت نقاط الولاء والمكافآت */}
                {loyaltyPoints > 0 && (
                  <div className="bg-amber-950/40 border border-amber-800/80 p-3 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-amber-400 block">رصيد مكافآتك: {loyaltyPoints} نقطة ⭐</span>
                      <span className="text-[10px] text-neutral-400">تخصم لك {loyaltyPoints * 0.5} ر.س مباشرة</span>
                    </div>
                    <button type="button" onClick={() => setUseLoyaltyDiscount(!useLoyaltyDiscount)} className={`px-3 py-1.5 rounded-lg font-bold text-xs ${useLoyaltyDiscount ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-amber-400'}`}>
                      {useLoyaltyDiscount ? 'تم الخصم ✓' : 'استبدال'}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <select value={orderType} onChange={(e) => setOrderType(e.target.value as any)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs outline-none">
                    <option value="delivery">🛵 توصيل للمنزل</option>
                    <option value="pickup">🛍️ استلام من الفرع</option>
                  </select>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs outline-none">
                    <option value="apple_pay">🍏 Apple Pay / مدى</option>
                    <option value="cod">💵 عند الاستلام</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowCheckout(false)} className="w-1/3 bg-neutral-800 text-neutral-300 font-bold py-3 rounded-xl text-xs">رجوع</button>
                  <button type="submit" disabled={loading} className={`w-2/3 ${primaryColor} text-white font-bold py-3 rounded-xl text-xs shadow-lg`}>
                    {loading ? 'جاري التجهيز...' : 'إرسال الطلب عبر الواتساب 📲'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}