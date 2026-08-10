'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ExpressPOSPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBizId, setSelectedBizId] = useState<string>('');
  const [services, setServices] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('طلب محلي');
  const [customerPhone, setCustomerPhone] = useState('0500000000');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBiz() {
      const supabase = createClient();
      const { data } = await supabase.from('businesses').select('id, business_name');
      if (data && data.length > 0) {
        setBusinesses(data);
        setSelectedBizId(data[0].id);
      }
    }
    loadBiz();
  }, []);

  useEffect(() => {
    async function loadServices() {
      if (!selectedBizId) return;
      const supabase = createClient();
      const { data } = await supabase.from('services').select('*').eq('business_id', selectedBizId);
      if (data) setServices(data);
    }
    loadServices();
  }, [selectedBizId]);

  const addToCart = (item: any) => {
    const rawPrice = item.price ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0 : 0;
    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id);
      if (exist) return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { id: item.id, title: item.title, price: rawPrice, quantity: 1 }];
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePOSOrder = async () => {
    if (cart.length === 0 || loading) return;
    setLoading(true);
    const supabase = createClient();

    await supabase.from('orders').insert([
      {
        business_id: selectedBizId,
        customer_name: customerName,
        customer_phone: customerPhone,
        order_type: 'pickup',
        payment_method: 'cod',
        items: cart,
        total_amount: totalPrice,
        status: 'preparing',
      },
    ]);

    setCart([]);
    setLoading(false);
    alert('تم طباعة الطلب وإرساله للمطبخ فوراً! 🧾');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 dir-rtl text-gray-900">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">⚡ كاشير المبيعات السريع (Express POS)</h1>
          <p className="text-xs text-gray-500 mt-1">توليد فواتير سريعة للطلبات الداخلية والكاونتر.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedBizId}
            onChange={(e) => setSelectedBizId(e.target.value)}
            className="p-2 border rounded-xl text-xs font-bold bg-white"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.business_name}</option>
            ))}
          </select>
          <Link href="/dashboard/orders" className="bg-neutral-900 text-white font-bold px-4 py-2 rounded-xl text-xs">
            شاشة المطبخ ←
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-emerald-500 cursor-pointer transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h4>
                <p className="text-[10px] text-gray-400 line-clamp-2">{item.description}</p>
              </div>
              <div className="mt-3 flex justify-between items-center pt-2 border-t">
                <span className="font-black text-emerald-600 text-sm">{item.price}</span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg">+ أضف</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-gray-900 border-b pb-3">الفاتورة الحالية 🛒</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {cart.map((i, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">{i.title} × {i.quantity}</span>
                <span className="font-bold text-emerald-600">{i.price * i.quantity} ر.س</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="اسم العميل" />
            <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="رقم الجوال" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t font-black text-lg">
            <span>الإجمالي:</span>
            <span className="text-emerald-600">{totalPrice} ر.س</span>
          </div>

          <button onClick={handlePOSOrder} disabled={loading || cart.length === 0} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg">
            {loading ? 'جاري الطباعة...' : 'إصدار ودفع الفاتورة 🖨️'}
          </button>
        </div>
      </div>
    </div>
  );
}