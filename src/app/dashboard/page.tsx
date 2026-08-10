'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // بيانات النشاط الجديد
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('مطعم')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [siteId, setSiteId] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const fetchBusinesses = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)

    if (data) setBusinesses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim() || !siteId.trim()) {
      alert('لطفاً اكتب اسم النشاط ورابط التعريف (Site ID)')
      return
    }

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('جلسة الدخول انتهت، يرجى إعادة تسجيل الدخول')
      setSubmitting(false)
      return
    }

    const cleanSiteId = siteId.trim().toLowerCase().replace(/\s+/g, '-')

    const { error } = await supabase.from('businesses').insert([
      {
        user_id: user.id,
        business_name: businessName,
        business_type: businessType, // تم إضافة هذا العمود لحل خطأ not-null
        description: description,
        phone: phone,
        site_id: cleanSiteId,
      },
    ])

    setSubmitting(false)

    if (error) {
      alert('حدث خطأ أثناء إضافة النشاط: ' + error.message)
    } else {
      setShowModal(false)
      setBusinessName('')
      setBusinessType('مطعم')
      setDescription('')
      setPhone('')
      setSiteId('')
      fetchBusinesses() // تحديث القائمة فوراً
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* الشريط العلوي */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
          <h1 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
            🏠 موقعي
          </h1>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-2 rounded-xl hover:bg-gray-200 transition"
          >
            🚪 تسجيل الخروج
          </button>
        </div>

        {/* هيدر لوحة التحكم والزر */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">لوحة التحكم</h2>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition"
          >
            + إضافة نشاط جديد
          </button>
        </div>

        {/* قائمة الأنشطة والمطاعم */}
        {loading ? (
          <p className="text-center py-10 text-gray-500 font-medium">جاري التحميل...</p>
        ) : businesses.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center space-y-3">
            <p className="text-gray-500">لا يوجد لديك أي نشاط حالياً.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              إضافة أول نشاط الآن
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((b) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{b.business_name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{b.description || 'لا يوجد وصف'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/s/${b.site_id || b.id}`}
                    target="_blank"
                    className="text-blue-600 text-sm font-bold underline px-3 py-1.5"
                  >
                    عرض الصفحة
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* النافذة المنبثقة لإضافة نشاط جديد Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4" dir="rtl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">إضافة نشاط جديد</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم النشاط / المطعم:</label>
                <input
                  type="text"
                  placeholder="مثال: ماكت | Maketh"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm outline-none text-gray-900 bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">نوع النشاط:</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm outline-none text-gray-900 bg-gray-50"
                >
                  <option value="مطعم">مطعم / وجبات سريعة</option>
                  <option value="مقهى">مقهى / كافيه</option>
                  <option value="متجر">متجر / خدمات أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">معرف الرابط (Site ID):</label>
                <input
                  type="text"
                  placeholder="مثال: maketh"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm outline-none text-gray-900 bg-gray-50 dir-ltr text-right"
                  required
                />
                <span className="text-[10px] text-gray-400 mt-1 block">سيكون رابط الصفحة: /s/{siteId || 'your-id'}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">وصف قصير:</label>
                <textarea
                  placeholder="وصف للنشاط أو الوجبات"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm outline-none text-gray-900 bg-gray-50 h-16"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رقم الجوال / الواتساب:</label>
                <input
                  type="tel"
                  placeholder="0541407675"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border p-2.5 rounded-xl text-sm outline-none text-gray-900 bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:bg-gray-400 mt-2"
              >
                {submitting ? 'جاري الحفظ...' : 'حفظ وإنشاء النشاط 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
