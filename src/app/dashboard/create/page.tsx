'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)

      if (data) {
        setBusinesses(data)
      }
      setLoading(false)
    }

    fetchBusinesses()
  }, [])

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

        {/* عنوان لوحة التحكم مع زر إضافة نشاط معدل */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">لوحة التحكم</h2>
          
          {/* تم تعديل الزر إلى Link لفتح الصفحة فوراً عند الضغط عليه بالموبايل */}
          <Link
            href="/dashboard/create"
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition"
          >
            + إضافة نشاط جديد
          </Link>
        </div>

        {/* قائمة الأنشطة والمطاعم */}
        {loading ? (
          <p className="text-center py-10 text-gray-500 font-medium">جاري التحميل...</p>
        ) : businesses.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center space-y-3">
            <p className="text-gray-500">لا يوجد لديك أي نشاط حالياً.</p>
            <Link
              href="/dashboard/create"
              className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold"
            >
              إضافة أول نشاط الآن
            </Link>
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
    </div>
  )
}
