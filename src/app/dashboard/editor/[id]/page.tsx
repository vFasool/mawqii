'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function BusinessEditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<any>(null);

  // بيانات النشاط الأساسية
  const [businessName, setBusinessName] = useState('');
  const [siteId, setSiteId] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  // المنيو والخدمات
  const [services, setServices] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    async function fetchBusinessData() {
      if (!id) return;
      setLoading(true);

      // جلب بيانات النشاط
      const { data: bData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (bData) {
        setBusiness(bData);
        setBusinessName(bData.business_name || bData.name || '');
        setSiteId(bData.site_id || '');
        setDescription(bData.description || '');
        setPhone(bData.phone || bData.phone_number || '');
        setLocation(bData.location || bData.address || '');

        // جلب قائمة المنيو
        const { data: sData } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', bData.id);

        if (sData) setServices(sData);
      }

      setLoading(false);
    }

    fetchBusinessData();
  }, [id]);

  // حفظ التغييرات على بيانات النشاط
  const handleSaveBusiness = async () => {
    if (!businessName.trim() || !siteId.trim()) {
      alert('لطفاً اكتب اسم النشاط والرابط الفريد');
      return;
    }

    setSaving(true);
    const cleanSiteId = siteId.trim().toLowerCase().replace(/\s+/g, '-');

    const { error } = await supabase
      .from('businesses')
      .update({
        business_name: businessName,
        site_id: cleanSiteId,
        description: description,
        phone: phone,
        location: location,
      })
      .eq('id', id);

    setSaving(false);

    if (error) {
      alert('حدث خطأ أثناء الحفظ: ' + error.message);
    } else {
      setSiteId(cleanSiteId);
      alert('تم حفظ التغيرات بنجاح! 🎉');
    }
  };

  // إضافة صنف جديد للمنيو
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice.trim()) {
      alert('لطفاً ادخل اسم الوجبة وسعرها');
      return;
    }

    setAddingItem(true);

    const { data, error } = await supabase.from('services').insert([
      {
        business_id: id,
        name: newItemName,
        price: parseFloat(newItemPrice),
        description: newItemDesc,
      },
    ]).select();

    setAddingItem(false);

    if (error) {
      alert('حدث خطأ أثناء إضافة الصنف: ' + error.message);
    } else if (data) {
      setServices([...services, ...data]);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemDesc('');
      alert('تمت إضافة الصنف إلى المنيو! 🍔');
    }
  };

  // حذف صنف من المنيو
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('هل أنت تأكد من حذف هذا الصنف؟')) return;

    const { error } = await supabase.from('services').delete().eq('id', itemId);

    if (error) {
      alert('حدث خطأ أثناء الحذف: ' + error.message);
    } else {
      setServices(services.filter((item) => item.id !== itemId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">جاري تحميل بيانات المحرر...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center" dir="rtl">
        <p className="text-red-600 font-bold mb-4">النشاط غير موجود</p>
        <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  const previewUrl = `/s/${siteId || id}`;

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* الشريط العلوي للتحكم */}
        <div className="flex flex-wrap justify-between items-center bg-white p-4 rounded-2xl border shadow-sm gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">محرر النشاط الاحترافي الشامل</h1>
            <p className="text-xs text-gray-500 mt-1">
              الرابط الفريد حالياً: <span className="font-mono text-blue-600 font-bold">/s/{siteId || 'slug'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
            >
              اللوحة
            </Link>

            <Link
              href={previewUrl}
              target="_blank"
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
            >
              معاينة حية ↗
            </Link>

            <button
              onClick={handleSaveBusiness}
              disabled={saving}
              className="bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-emerald-900 transition shadow-sm disabled:bg-gray-400"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغيرات 💾'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* الجانب الأيمن: تعديل البيانات الأساسية والرابط الفريد */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b pb-3">⚙️ بيانات النشاط الأساسية</h2>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">اسم النشاط / المطعم:</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الرابط الفريد (Site ID):</label>
              <input
                type="text"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                placeholder="maketh"
                className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-900 outline-none dir-ltr text-right font-mono"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">رابط المعاينة: /s/{siteId || 'your-id'}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الوصف:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-900 outline-none h-20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رقم الجوال / الواتساب:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رابط الموقع (Google Maps):</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-900 outline-none text-xs"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <button
              onClick={handleSaveBusiness}
              disabled={saving}
              className="w-full bg-emerald-800 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-900 transition mt-2"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
            </button>
          </div>

          {/* الجانب الأيسر: إدارة المنيو وإضافة الأصناف */}
          <div className="md:col-span-2 space-y-6">
            
            {/* نموذج إضافة صنف جديد */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b pb-3">➕ إضافة عنصر وخيارات المنيو</h2>

              <form onSubmit={handleAddMenuItem} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">اسم الوجبة / الصنف:</label>
                    <input
                      type="text"
                      placeholder="مثال: برجر دجاج"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">السعر (ر.س):</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="15"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الوصف (اختياري):</label>
                  <input
                    type="text"
                    placeholder="مكونات الوجبة أو التفاصيل"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full border p-2.5 rounded-xl text-sm bg-gray-50 text-gray-900 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingItem}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {addingItem ? 'جاري الإضافة...' : '+ إضافة للمنيو'}
                </button>
              </form>
            </div>

            {/* معاينة وقائمة الأصناف المضافة */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 border-b pb-3">📋 قائمة الطعام الحالية ({services.length})</h2>

              {services.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm">لا توجد أصناف مضافة في المنيو حتى الآن.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((item) => (
                    <div key={item.id} className="border p-3 rounded-xl bg-gray-50 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{item.name || item.title}</h4>
                        <span className="text-xs text-emerald-800 font-bold">{item.price || item.cost} ر.س</span>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-bold bg-red-50 p-1.5 rounded-lg border border-red-100"
                      >
                        حذف 🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
