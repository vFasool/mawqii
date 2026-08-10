// تأكد من وجود حالة الـ site_id
const [siteId, setSiteId] = useState('');

// داخل دالة جلب البيانات useEffect:
// setSiteId(data.site_id || '');

// داخل دالة الحفظ handleSave:
const { error } = await supabase
  .from('businesses')
  .update({
    business_name: businessName,
    site_id: siteId.trim().toLowerCase().replace(/\s+/g, '-'), // تحويل الاسم لرابط صريح بأحرف صغيرة
    description: description,
    phone: phone,
    location: location,
  })
  .eq('id', id);
