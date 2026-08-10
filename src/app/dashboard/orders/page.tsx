'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function KitchenOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // جلب جميع الطلبات
  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // تحديث الطلبات تلقائياً كل 10 ثوانٍ
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // تغيير حالة الطلب في قاعدة البيانات
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      alert('حدث خطأ أثناء تحديث الحالة: ' + error.message);
    }
  };

  // إرسال إشعار للعميل عبر الواتساب بحالة الطلب
  const sendWhatsAppUpdate = (order: any, newStatus: string) => {
    let cleanPhone = (order.customer_phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('05')) {
      cleanPhone = '966' + cleanPhone.substring(1);
    }

    let msg = `مرحباً ${order.customer_name} 👋\n\n`;
    msg += `تحديث حالة طلبك لدى المطعم:\n`;
    msg += `📌 الحالة الحالية: *${newStatus}*\n`;
    msg += `💰 الإجمالي: ${order.total_price || order.total || 0} ر.س\n\n`;
    msg += `شكراً لاختيارك لنا! ❤️`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📺 شاشة طلبات المطعم والاستقبال</h1>
          <button 
            onClick={fetchOrders} 
            className="bg-emerald-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-900 transition"
          >
            🔄 تحديث الطلبات
          </button>
        </div>

        {loading ? (
          <p className="text-center py-10 text-gray-500 font-medium">جاري جلب الطلبات...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-500 shadow-sm">
            لا توجد طلبات جديدة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const totalPrice = order.total_price || order.total || 0;

              return (
                <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    {/* رأس الكرت */}
                    <div className="flex justify-between items-start border-b pb-3 mb-3">
                      <div>
                        <h2 className="font-bold text-lg text-gray-900">{order.customer_name}</h2>
                        <a href={`tel:${order.customer_phone}`} className="text-sm text-emerald-700 font-semibold block mt-0.5">
                          📞 {order.customer_phone}
                        </a>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        {order.status || 'جديد'}
                      </span>
                    </div>

                    {/* تفاصيل الطلب والتوصيل */}
                    <div className="space-y-1 text-xs text-gray-600 mb-3 bg-gray-50 p-2.5 rounded-xl">
                      <p>🛍️ <b>نوع الطلب:</b> {order.order_type || 'سفري'}</p>
                      <p>💳 <b>طريقة الدفع:</b> {order.payment_method || 'كاش'}</p>
                      {order.address && (
                        <p className="text-emerald-900 font-semibold mt-1">
                          📍 <b>موقع التوصيل:</b>{' '}
                          {order.address.startsWith('http') ? (
                            <a href={order.address} target="_blank" rel="noreferrer" className="underline text-blue-600">
                              فتح خرائط Google
                            </a>
                          ) : (
                            order.address
                          )}
                        </p>
                      )}
                    </div>

                    {/* الأصناف */}
                    <div className="space-y-1 border-t pt-2">
                      <p className="text-xs font-bold text-gray-500 mb-1">المنتجات المطلوب تحضيرها:</p>
                      {items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-800 font-medium">
                          <span>• {it.name} × {it.quantity}</span>
                          <span>{it.price * it.quantity} ر.س</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {/* الإجمالي */}
                    <div className="flex justify-between items-center border-t pt-3 mt-3 font-bold text-base text-gray-900">
                      <span>الإجمالي:</span>
                      <span className="text-emerald-800 font-extrabold">{totalPrice} ر.س</span>
                    </div>

                    {/* تغيير حالة الطلب والتواصل */}
                    <div className="space-y-2 mt-4">
                      <label className="block text-xs font-bold text-gray-500">تحديث حالة الطلب وإشعاره:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => { updateOrderStatus(order.id, 'قيد التجهيز ⏳'); sendWhatsAppUpdate(order, 'جاري تحضير طلبك في المطبخ ⏳'); }}
                          className="bg-yellow-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-yellow-600 transition"
                        >
                          ⏳ قيد التحضير
                        </button>

                        <button 
                          onClick={() => { updateOrderStatus(order.id, 'جاهز للاستلام 🎯'); sendWhatsAppUpdate(order, 'طلبك جاهز للاستلام الآن 🎯'); }}
                          className="bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          🎯 جاهز
                        </button>

                        <button 
                          onClick={() => { updateOrderStatus(order.id, 'جاري التوصيل 🛵'); sendWhatsAppUpdate(order, 'مندوبنا في الطريق إليك الآن 🛵'); }}
                          className="bg-purple-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                          🛵 جاري التوصيل
                        </button>

                        <button 
                          onClick={() => { updateOrderStatus(order.id, 'مكتمل ✅'); sendWhatsAppUpdate(order, 'تم تسليم الطلب بنجاح، بالعافية! ✅'); }}
                          className="bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-800 transition"
                        >
                          ✅ اكتمال
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
