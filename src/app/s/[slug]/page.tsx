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
  const [showBookingModal, setShowBookingModal] = useState(false);

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
    <main className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        
        {/* هيدر المطعم/النشاط */}
        <div className="text-center border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{business.business_name || business.name}</h1>
          <p className="text-gray-600 mb-4">{business.description || 'أهلاً بكم في صفحتنا'}</p>

          {/* أزرار حجز الطاولة والواتساب */}
          <div className="flex justify-center gap-3 mt-4">
            <button 
              onClick={() => setShowBookingModal(true)}
              className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition shadow-sm"
            >
              📅 حجز طاولة
            </button>
            
            {business.phone && (
              <a 
                href={`https://wa.me/${business.phone}`} 
                target="_blank" 
                rel="noreferrer"
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-sm"
              >
                💬 تواصل واتساب
              </a>
            )}
          </div>
        </div>

        {/* قائمة الطعام */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">قائمة الطعام / الخدمات</h2>
        
        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-4">لا توجد أصناف مضافة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((item) => {
              // البحث عن الاسم بغض النظر عن اسم العمود في قاعدة البيانات
              const itemName = item.name || item.title || item.item_name || item.service_name || item.label || 'صنف';
              const itemDesc = item.description || item.desc || item.details;
              const itemPrice = item.price || item.cost || 0;

              return (
                <div key={item.id} className="border border-gray-100 p-4 rounded-xl bg-gray-50 flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{itemName}</h3>
                    {itemDesc && <p className="text-sm text-gray-500 mt-1">{itemDesc}</p>}
                  </div>
                  <span className="font-bold text-green-700 text-base dir-ltr">{itemPrice} SAR</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* نافذة حجز الطاولة popup */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-900">حجز طاولة</h3>
            <p className="text-sm text-gray-600">للحجز المباشر يرجى التواصل معنا عبر الواتساب أو الاتصال.</p>
            <div className="pt-2 flex flex-col gap-2">
              {business.phone ? (
                <a 
                  href={`https://wa.me/${business.phone}?text=مرحباً،%20أرغب%20في%20حجز%20طاولة`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm"
                >
                  إرسال طلب حجز عبر الواتساب
                </a>
              ) : (
                <p className="text-xs text-red-500">يرجى إضافة رقم الهاتف في لوحة التحكم لتفعيل الحجز.</p>
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
