'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PublicSitePage() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const slug = rawSlug ? decodeURIComponent(rawSlug) : '';

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      setLoading(true);

      // البحث برقم الـ site_id أولاً، ثم الـ id
      let { data: bData, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('site_id', slug)
        .maybeSingle();

      if (!bData) {
        const { data: fallbackData } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', slug)
          .maybeSingle();
        bData = fallbackData;
      }

      if (!bData) {
        setLoading(false);
        return;
      }

      setBusiness(bData);

      const { data: sData } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', bData.id);

      if (sData) setServices(sData);
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
        <h1 className="text-2xl font-bold mb-2 text-red-600">الموقع غير موجود</h1>
        <p className="text-gray-600 mb-4">تأكد من صحة الرابط وحاول مرة أخرى.</p>
        <Link href="/" className="text-blue-600 underline font-medium">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 dir-rtl" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{business.business_name}</h1>
        <p className="text-gray-600 mb-6">{business.description || 'أهلاً بكم في صفحتنا'}</p>

        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">قائمة الطعام / الخدمات</h2>
        
        {services.length === 0 ? (
          <p className="text-gray-500">لا توجد أصناف مضافة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((item) => (
              <div key={item.id} className="border border-gray-200 p-4 rounded-xl bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                  {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                  <span className="inline-block mt-2 font-bold text-green-700 text-base">{item.price} ر.س</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
