'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CreateWebsitePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('cafe');
  const [description, setDescription] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || loading) return;

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      setLoading(false);
      return;
    }

    const { data: biz } = await supabase
      .from('businesses')
      .insert([{ user_id: user.id, business_name: businessName, business_type: businessType || 'cafe', description }])
      .select().single();

    if (biz) {
      const slug = `site-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data: site } = await supabase
        .from('websites')
        .insert([{ user_id: user.id, business_id: biz.id, slug, status: 'published' }])
        .select().single();

      if (site) router.push(`/dashboard/editor/${site.id}`);
    }
    setLoading(false);
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || loading) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('يرجى تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }

      const lower = aiPrompt.toLowerCase();
      let bizName = "كافيه القهوة السوداء المختصة";
      let type = "cafe";
      let desc = "وجهتك الأولى لأجود أنواع القهوة المختصة والمشروبات الباردة والحارّة.";
      let items = [
        { title: "V60 إثيوبي بارد", price: "22 ر.س", description: "قهوة مقطرة طازجة بإيحاءات الفواكه" },
        { title: "سبانيش لاتيه بارد", price: "20 ر.س", description: "إسبرسو غني مع حليب ومزيج خاص" },
        { title: "كيكة السينابون الطازجة", price: "18 ر.س", description: "قطعة سينابون طازجة مع صوص الجبن" }
      ];

      if (lower.includes('برجر') || lower.includes('مطعم') || lower.includes('وجبات')) {
        bizName = "سماش برجر الأصلي";
        type = "restaurant";
        desc = "أشهى أنواع البرجر الطازجة المحضرة يومياً مع الصوصات الخاصة.";
        items = [
          { title: "كلاسيك سماش برجر", price: "28 ر.س", description: "لحم طازج مع جبنة شيدر وصوص خاص" },
          { title: "بطاطس بالجبنة", price: "14 ر.س", description: "بطاطس مقرمشة مع صوص الجبن الذائب" }
        ];
      }

      // 1. إنشاء النشاط
      const { data: biz, error: bizErr } = await supabase
        .from('businesses')
        .insert([{
          user_id: user.id,
          business_name: bizName,
          business_type: type,
          description: desc,
          primary_color: 'emerald'
        }])
        .select().single();

      if (bizErr) throw bizErr;

      // 2. إنشاء الموقع بدون تمرير template_id
      const slug = `site-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data: site, error: siteErr } = await supabase
        .from('websites')
        .insert([{
          user_id: user.id,
          business_id: biz.id,
          slug: slug,
          status: 'published'
        }])
        .select().single();

      if (siteErr) throw siteErr;

      // 3. إضافة المنيو
      const servicesToInsert = items.map(item => ({
        business_id: biz.id,
        title: item.title,
        price: item.price,
        description: item.description
      }));

      await supabase.from('services').insert(servicesToInsert);

      router.push(`/dashboard/editor/${site.id}`);
    } catch (err: any) {
      alert('حدث خطأ أثناء الإنشاء: ' + (err.message || 'حاول مرة أخرى'));
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 dir-rtl text-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">إنشاء موقع إلكتروني جديد 🚀</h1>
        <p className="text-sm text-gray-500">اختر طريقة إنشاء موقعك والمنيو الخاص بك</p>

        <div className="flex justify-center gap-2 mt-6 bg-gray-100 p-1.5 rounded-2xl w-fit mx-auto border border-gray-200">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${mode === 'ai' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600'}`}
          >
            ✨ الإنشاء الفوري بالذكاء الاصطناعي (AI)
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${mode === 'manual' ? 'bg-neutral-900 text-white shadow-md' : 'text-gray-600'}`}
          >
            ✍️ إدخال البيانات يدوياً
          </button>
        </div>
      </div>

      {mode === 'ai' ? (
        <form onSubmit={handleAISubmit} className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xl space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <span className="text-xs font-bold text-emerald-900 block mb-1">🤖 كيف يعمل المولد الذكي؟</span>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              صف فكرتك أو نشاطك بجملة بسيطة، وسيقوم الذكاء الاصطناعي بإنشاء الاسم والوصف والمنيو والأسعار الافتراضية تلقائياً في ثوانٍ!
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">اكتب وصف نشاطك التجاري</label>
            <textarea
              rows={4}
              required
              placeholder="مثال: عندي كافيه مختص يقدم مشروبات باردة وحارة مع حلى السينابون والكيك..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? 'جاري العصف الذهني وبناء الموقع بالذكاء الاصطناعي... 🪄' : 'توليد وبناء الموقع بالذكاء الاصطناعي ✨'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block">اسم النشاط</label>
            <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full p-3 border rounded-xl text-sm outline-none" placeholder="مثال: كافيه الصباح" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block">نوع النشاط</label>
            <input type="text" value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full p-3 border rounded-xl text-sm outline-none" placeholder="cafe / restaurant" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block">الوصف</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-xl text-sm outline-none" placeholder="وصف قصير" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-neutral-900 text-white font-bold py-3.5 rounded-xl text-sm transition">
            {loading ? 'جاري الإنشاء...' : 'إنشاء الموقع'}
          </button>
        </form>
      )}
    </div>
  );
}