'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function OrdersDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const previousOrdersCount = useRef(0);

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio playback error');
    }
  };

  const fetchOrders = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (data) {
      if (previousOrdersCount.current > 0 && data.length > previousOrdersCount.current) {
        playAlertSound();
      }
      previousOrdersCount.current = data.length;
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 4000);
    return () => clearInterval(interval);
  }, []);

  const sendWhatsAppStatusAlert = (order: any, statusText: string) => {
    if (!order.customer_phone) return;
    const msg = `أهلاً بك ${order.customer_name || 'عميلنا العزيز'} 👋\nتحديث طلبك رقم (#${order.id.slice(0, 6)}):\nحالة الطلب الآن: *${statusText}* 🚀\nشكراً لتعاملك معنا!`;
    const url = `https://wa.me/${order.customer_phone.trim()}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const updateOrderStatus = async (order: any, newStatus: string, statusText: string) => {
    const supabase = createClient();
    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
    setOrders(orders.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
    sendWhatsAppStatusAlert(order, statusText);
  };

  const handlePrintReceipt = (order: any) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>فاتورة طلب #${order.id.slice(0, 6)}</title>
        <style>
          body { font-family: monospace; font-size: 12px; padding: 10px; width: 280px; margin: 0 auto; text-align: center; }
          .header { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .title { font-size: 16px; font-weight: bold; }
          .item { display: flex; justify-content: space-between; margin: 4px 0; }
          .footer { border-top: 1px dashed #000; pt: 8px; margin-top: 10px; font-size: 10px; }
        </style>
      </head>

      <body>
        <div class="header">
          <div class="title">منصة موقعي 🧾</div>
          <div>رقم الطلب: #${order.id.slice(0, 6)}</div>
          <div>العميل: ${order.customer_name || 'غير محدد'}</div>
          <div>الجوال: ${order.customer_phone || '-'}</div>
          <div>التاريخ: ${new Date(order.created_at).toLocaleTimeString('ar-SA')}</div>
        </div>

        <div style="text-align: right; font-weight: bold; margin-bottom: 5px;">الطلبات:</div>
        ${items.map((i: any) => `
          <div class="item">
            <span>${i.title} × ${i.quantity}</span>
            <span>${i.price * i.quantity} ر.س</span>
          </div>
        `).join('')}

        <div class="header" style="margin-top: 10px; text-align: left; font-weight: bold; font-size: 14px;">
          الإجمالي: ${order.total_amount} ر.س
        </div>

        <div class="footer">شكراً لطلبكم!</div>
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">جديد ⏳</span>;
      case 'preparing': return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">قيد التحضير 🍳</span>;
      case 'completed': return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">جاهز ومكتمل ✅</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-bold">{status}</span>;
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 text-sm">جاري تحميل شاشة المطبخ...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 dir-rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>شاشة المطبخ مع التنبيهات المباشرة</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">إشعارات الواتساب تُرسل تلقائياً للعميل عند تغيير حالة الطلب.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pos" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs">
            ⚡ كاشير السريع (POS)
          </Link>
          <Link href="/dashboard" className="px-4 py-2 border rounded-lg text-xs bg-white font-bold">
            ← اللوحة
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length > 0 ? (
          orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start border-b pb-3 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{order.customer_name || 'زبون'}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{order.customer_phone}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    {items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs bg-gray-50 p-2 rounded-lg">
                        <span className="font-semibold text-gray-800">{item.title} × {item.quantity}</span>
                        <span className="text-emerald-600 font-bold">{item.price * item.quantity} ر.س</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                    <span>نوع الطلب: {order.order_type === 'delivery' ? 'توصيل 🛵' : 'استلام 🛍️'}</span>
                    <span className="font-black text-sm text-emerald-600">{order.total_amount} ر.س</span>
                  </div>
                </div>

                <div className="pt-3 border-t grid grid-cols-3 gap-2">
                  <button onClick={() => updateOrderStatus(order, 'preparing', 'جاري تحضير وجبتك بالمطبخ 🍳')} className="bg-blue-50 text-blue-700 font-bold py-2 rounded-lg text-xs">تحضير 🍳</button>
                  <button onClick={() => updateOrderStatus(order, 'completed', 'طلبك جاهز للاستلام الآن 🎉')} className="bg-emerald-50 text-emerald-700 font-bold py-2 rounded-lg text-xs">إكتمال ✅</button>
                  <button onClick={() => handlePrintReceipt(order)} className="bg-neutral-900 text-white font-bold py-2 rounded-lg text-xs">طباعة 🖨️</button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm">لا توجد طلبات حية حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
}