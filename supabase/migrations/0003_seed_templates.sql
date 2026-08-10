-- =============================================================================
-- 0003_seed_templates.sql
-- القوالب الخمسة الأساسية للنسخة الأولى (المرحلة 3 ستبني الـ UI الفعلي لها).
-- preview_image_url فارغ الآن عمدًا — يُملأ بروابط Supabase Storage الحقيقية
-- بعد رفع صور المعاينة في المرحلة 3.
-- =============================================================================

insert into public.templates (slug, name, business_type, preview_image_url, is_active) values
  ('restaurant-classic', 'مطعم كلاسيكي',        'restaurant',    null, true),
  ('cafe-cozy',          'كافيه دافئ',           'cafe',          null, true),
  ('barbershop-modern',  'حلاقة عصرية',          'barbershop',    null, true),
  ('carwash-bold',       'مغسلة سيارات جريئة',   'car_wash',      null, true),
  ('home-services-trust','خدمات منزلية موثوقة', 'home_services', null, true);
