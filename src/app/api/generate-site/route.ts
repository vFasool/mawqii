import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json();

    if (!prompt || !userId) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    // الربط المباشر بـ Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const lower = prompt.toLowerCase();
    let bizName = "كافيه وقهوة مختصة";
    let type = "كافيه ومقهى";
    let desc = "وجهتك الأولى لأجود أنواع القهوة المختصة والمشروبات الباردة والحارّة.";
    let items = [
      { title: "V60 إثيوبي بارد", price: "22 ر.س", description: "قهوة مقطرة طازجة بإيحاءات الفواكه" },
      { title: "سبانيش لاتيه بارد", price: "20 ر.س", description: "إسبرسو غني مع حليب ومزيج خاص" },
      { title: "كيكة السينابون الطازجة", price: "18 ر.س", description: "قطعة سينابون طازجة مع صوص الجبن" }
    ];

    if (lower.includes('برجر') || lower.includes('مطعم') || lower.includes('وجبات')) {
      bizName = "سماش برجر الأصلي";
      type = "مطعم وجبات سريعة";
      desc = "أشهى أنواع البرجر الطازجة المحضرة يومياً مع الصوصات الخاصة.";
      items = [
        { title: "كلاسيك سماش برجر", price: "28 ر.س", description: "لحم طازج مع جبنة شيدر وصوص خاص" },
        { title: "بطاطس بالجبنة", price: "14 ر.س", description: "بطاطس مقرمشة مع صوص الجبن الذائب" }
      ];
    }

    // 1. إنشاء النشاط
    const { data: biz, error: bizError } = await supabase
      .from('businesses')
      .insert([{
        user_id: userId,
        business_name: bizName,
        business_type: type,
        description: desc,
        primary_color: 'emerald'
      }])
      .select().single();

    if (bizError) throw bizError;

    // 2. إنشاء الموقع
    const slug = `site-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data: site, error: siteError } = await supabase
      .from('websites')
      .insert([{
        user_id: userId,
        business_id: biz.id,
        slug: slug,
        status: 'published'
      }])
      .select().single();

    if (siteError) throw siteError;

    // 3. إضافة المنيو
    const servicesToInsert = items.map(item => ({
      business_id: biz.id,
      title: item.title,
      price: item.price,
      description: item.description
    }));

    await supabase.from('services').insert(servicesToInsert);

    return NextResponse.json({ siteId: site.id, slug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'حدث خطأ أثناء الإنشاء' }, { status: 500 });
  }
}