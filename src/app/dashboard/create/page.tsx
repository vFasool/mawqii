'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function CreateBusinessPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = Router()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('يجب عليك تسجيل الدخول أولاً')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert([
        {
          business_name: name,
          description: description,
          owner_id: user.id,
        },
      ])
      .select()

    if (error) {
      alert('حدث خطأ أثناء إنشاء الموقع: ' + error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">إنشاء موقع جديد</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">اسم النشاط التجارية</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border rounded-md"
            placeholder="مثال: مطعم السعادة"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="وصف قصير للنشاط..."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'جاري الإنشاء...' : 'إنشاء الموقع'}
        </button>
      </form>
    </div>
  )
}
