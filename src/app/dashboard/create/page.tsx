'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadBusinesses() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('user_id', user.id)
        
        if (data) setBusinesses(data)
      }
      setLoading(false)
    }
    loadBusinesses()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
        <Link 
          href="/dashboard/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + إضافة نشاط جديد
        </Link>
      </div>

      {businesses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">لا توجد أنشطة مضافة حالياً.</p>
      ) : (
        <div className="grid gap-4">
          {businesses.map((b) => (
            <div key={b.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{b.business_name}</h3>
                <p className="text-sm text-gray-500">{b.description}</p>
              </div>
              <Link 
                href={`/s/${b.site_id || b.id}`}
                className="text-blue-600 underline text-sm"
                target="_blank"
              >
                عرض الصفحة
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
