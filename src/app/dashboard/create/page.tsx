'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CreateBusinessPage() {
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [siteId, setSiteId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName || !siteId) {
      alert('لطفاً اكتب اسم النشاط والمعرف الخاص بالرابط')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('يجب عليك تسجيل الدخول أولاً')
      setLoading(false)
      return
    }

    const cleanSiteId = siteId.trim().toLowerCase().replace(/\s+/g, '-')

    const { error } = await supabase.from('businesses').insert([
      {
        user_id: user.id,
        business_name: businessName,
        description: description,
        phone: phone,
        site_id: cleanSiteId,
      },
    ])

    setLoading(false)

    if (error) {
      alert('حدث خطأ أثناء إضافة النشاط: ' + error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-xl font-bold text-gray-800">إضافة نشاط جديد</h1>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            إلغاء ✕
          </Link>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">اسم النشاط / المطعم:</label>
            <input
              type="text"
              placeholder="مثال: مطعم شاورما"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full border p-2.5 rounded-xl text-sm outline-none text-gray-900 bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">معرف الرابط (Site ID):</label>
            <input
              type="text"
              placeholder="مثال: shawarma-123"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full border p-2.5 rounded-xl text-sm outline-none text-gray-900 bg-gray-50 dir-ltr text-right"
              required
            />
            <span className="text-[10px] text-gray-400 mt-1 block">سيكون الرابط: /s/{siteId || 'your-id'}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">وصف قصير:</label>
            <textarea
              placeholder="وصف للوجبات أو الخدمة"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2.5 rounded-xl text-sm outline-none text-gray-900 bg-gray-50 h-20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">رقم الجوال / الواتساب:</label>
            <input
              type="tel"
              placeholder="0500000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2.5 rounded-xl text-sm outline-none text-gray-900 bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:bg-gray-400 mt-2"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ وإنشاء النشاط 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}
