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

  // الفلتر الغذائي والساعد الذكي
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [aiNutritionPrompt, setAiNutritionPrompt] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  // تقسيم الحساب بين الأصدقاء
  const [splitCount, setSplitCount] = useState<number>(1);

  // بيانات خيار التوصيل للسيارة
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'takeaway' | 'car'>('takeaway');
  const [carModel, setCarModel] = useState('');
  const [carColor, setCarColor] = useState('');
  const [carPlate, setCarPlate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [arrivedAlert, setArrivedAlert] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      setLoading(true);

      // التعديل هنا: البحث برقم الـ id الطويل أو بالرابط القصير site_id
      const { data: bData, error: bError } = await supabase
        .from('businesses')
        .select('*')
        .or(`id.eq.${slug},site_id.eq.${slug}`)
        .single();

      if (bError || !bData) {
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-medium">جاري التحميل...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">المتجر غير موجود</h1>
        <p className="text-gray-600 mb-4">تأكد من الرابط وحاول مرة أخرى.</p>
        <Link href="/" className="text-blue-600 underline">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{business.business_name}</h1>
        <p className="text-gray-600 mb-6">{business.description || 'أهلاً بكم في صفحتنا'}</p>

        <h2 className="text-xl font-bold mb-4 border-b pb-2">الخدمات / المنتجات</h2>
        
        {services.length === 0 ? (
          <p className="text-gray-500">لا توجد منتجات مضافة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((item) => (
              <div key={item.id} className="border p-4 rounded-xl bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <span className="inline-block mt-2 font-bold text-green-700">{item.price} ر.س</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
