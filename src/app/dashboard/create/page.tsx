// @ts-nocheck
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CreateBusinessPage() {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('يجب تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }

      const { data: biz, error: insertError } = await (supabase
        .from('businesses') as any)
        .insert([{ user_id: user.id, business_name: businessName, business_type: businessType || 'cafe', description }])
        .select().single();

      if (insertError) {
        throw insertError;
      }

      if (biz) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء النشاط التجار');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">إضافة نشاط تجاري جديد</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">اسم النشاط التجاري</label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">نوع النشاط</label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="restaurant">مطعم</option>
            <option value="cafe">مقهى</option>
            <option value="barbershop">حلاق</option>
            <option value="car_wash">مغسلة سيارات</option>
            <option value="home_services">خدمات منزلية</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'جاري الإضافة...' : 'إضافة النشاط'}
        </button>
      </form>
    </div>
  );
}
