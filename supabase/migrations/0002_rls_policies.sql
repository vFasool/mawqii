-- =============================================================================
-- 0002_rls_policies.sql
-- Row Level Security — كل مستخدم يرى ويعدّل بياناته فقط.
-- الاستثناء الوحيد: المواقع المنشورة (status = 'published') تكون قابلة للقراءة
-- للجميع (بما فيهم الزوار غير المسجّلين) لأنها الصفحة العامة للنشاط.
-- =============================================================================

alter table public.profiles         enable row level security;
alter table public.businesses       enable row level security;
alter table public.business_images  enable row level security;
alter table public.templates        enable row level security;
alter table public.websites         enable row level security;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- لا يوجد insert policy للمستخدمين: الإدراج يتم فقط عبر trigger (security definer)
-- عند إنشاء المستخدم في auth.users.

-- -----------------------------------------------------------------------------
-- businesses
-- -----------------------------------------------------------------------------
create policy "businesses_select_own"
  on public.businesses for select
  using (auth.uid() = user_id);

create policy "businesses_insert_own"
  on public.businesses for insert
  with check (auth.uid() = user_id);

create policy "businesses_update_own"
  on public.businesses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "businesses_delete_own"
  on public.businesses for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- business_images (الملكية تُتحقق عبر business_id -> businesses.user_id)
-- -----------------------------------------------------------------------------
create policy "business_images_select_own"
  on public.business_images for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_images.business_id
        and b.user_id = auth.uid()
    )
  );

create policy "business_images_insert_own"
  on public.business_images for insert
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_images.business_id
        and b.user_id = auth.uid()
    )
  );

create policy "business_images_delete_own"
  on public.business_images for delete
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_images.business_id
        and b.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- templates: قراءة عامة (حتى للزوار غير المسجّلين) — لا insert/update/delete
-- إلا عبر service_role (لوحة الإدارة الداخلية، خارج نطاق هذه السياسات)
-- -----------------------------------------------------------------------------
create policy "templates_select_all"
  on public.templates for select
  using (is_active = true);

-- -----------------------------------------------------------------------------
-- websites
-- -----------------------------------------------------------------------------
-- المالك يرى مواقعه كلها (مسودة أو منشورة)
create policy "websites_select_own"
  on public.websites for select
  using (auth.uid() = user_id);

-- أي زائر (بما فيهم غير المسجّلين) يرى الموقع فقط إذا كان منشورًا
-- هذه السياسة تُطبَّق بالتوازي مع السابقة (OR)، فتفتح باب القراءة العامة
-- للصفحة المنشورة دون كشف المسودات.
create policy "websites_select_published_public"
  on public.websites for select
  using (status = 'published');

create policy "websites_insert_own"
  on public.websites for insert
  with check (auth.uid() = user_id);

create policy "websites_update_own"
  on public.websites for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "websites_delete_own"
  on public.websites for delete
  using (auth.uid() = user_id);
