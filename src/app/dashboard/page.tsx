import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: websites } = await supabase
    .from('websites')
    .select(`
      id,
      slug,
      status,
      businesses (
        id,
        business_name,
        business_type
      )
    `)
    .eq('user_id', user?.id || '');

  const businessIds = websites?.map(w => {
    const biz = Array.isArray(w.businesses) ? w.businesses[0] : w.businesses;
    return biz?.id;
  }).filter(Boolean) || [];

  let totalViews = 0;
  if (businessIds.length > 0) {
    const { count } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true })
      .in('business_id', businessIds);
    
    totalViews = count || 0;
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 dir-rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">أنشطتي التجارية</h1>
          <p className="text-sm text-gray-500 mt-1">مرحباً بك، يمكنك متابعة أداء مواقعك وإدارتها من هنا.</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/orders"
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm"
          >
            👨‍🍳 شاشة الطلبات الحية
          </Link>
          <Link
            href="/dashboard/create"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm"
          >
            <span>+</span> إنشاء موقع جديد
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block mb-1">إجمالي الزيارات</span>
          <span className="text-3xl font-black text-emerald-600">{totalViews}</span>
          <span className="text-xs text-gray-500 block mt-1">مشاهدة حقيقية للمواقع</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block mb-1">عدد المواقع</span>
          <span className="text-3xl font-black text-gray-800">{websites?.length || 0}</span>
          <span className="text-xs text-gray-500 block mt-1">مواقع نشطة بالمشروع</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block mb-1">حالة السيرفر</span>
          <span className="text-3xl font-black text-blue-600">100%</span>
          <span className="text-xs text-emerald-600 font-bold block mt-1">● متصل أونلاين</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {websites && websites.length > 0 ? (
          websites.map((site: any) => {
            const biz = Array.isArray(site.businesses) ? site.businesses[0] : site.businesses;
            return (
              <Link
                key={site.id}
                href={`/dashboard/editor/${site.id}`}
                className="block bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition">
                    {biz?.business_name || 'نشاط بدون اسم'}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                    نشط
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  النوع: {biz?.business_type || 'غير محدد'}
                </p>

                <div className="text-xs font-semibold text-emerald-600 group-hover:underline flex items-center gap-1">
                  تعديل الموقع والمنيو ←
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">لا توجد لديك مواقع حالياً</p>
            <Link href="/dashboard/create" className="text-emerald-600 font-medium hover:underline">
              أنشئ موقعك الأول الآن
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}