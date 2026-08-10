-- =============================================================================
-- 0001_init_schema.sql
-- مخطط قاعدة بيانات منصة "موقعي" — المرحلة 1
-- شغّل هذا الملف عبر: supabase db push  أو  لصقه في SQL Editor في لوحة Supabase
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.business_type as enum (
  'restaurant',    -- مطعم
  'cafe',          -- كافيه
  'barbershop',    -- حلاق
  'car_wash',      -- مغسلة سيارات
  'home_services'  -- خدمات منزلية
);

create type public.website_status as enum (
  'draft',
  'published'
);

-- -----------------------------------------------------------------------------
-- Helper: تحديث updated_at تلقائيًا عند كل UPDATE
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles: بيانات إضافية لكل مستخدم (مرتبطة 1:1 بـ auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- إنشاء صف profile تلقائيًا عند تسجيل مستخدم جديد في auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- businesses: بيانات النشاط التجاري (نشاط واحد أو أكثر لكل مستخدم)
-- -----------------------------------------------------------------------------
create table public.businesses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,

  business_name   text not null,
  business_type   public.business_type not null,
  description     text,

  -- الخدمات والأسعار: [{ "name": "قص شعر", "price": 40, "currency": "SAR" }, ...]
  services        jsonb not null default '[]'::jsonb,

  phone           text,
  whatsapp        text,
  city            text,
  address         text,

  -- ساعات العمل: { "sun": {"open": "09:00", "close": "22:00", "closed": false}, ... }
  working_hours   jsonb not null default '{}'::jsonb,

  instagram       text,
  tiktok          text,
  logo_url        text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_businesses_user_id on public.businesses (user_id);

create trigger trg_businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- business_images: صور النشاط (معرض صور، غير الشعار)
-- -----------------------------------------------------------------------------
create table public.business_images (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id) on delete cascade,
  url          text not null,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index idx_business_images_business_id on public.business_images (business_id);

-- -----------------------------------------------------------------------------
-- templates: القوالب المتاحة (بيانات ثابتة تُدار من لوحة الإدارة/Seed فقط)
-- -----------------------------------------------------------------------------
create table public.templates (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  business_type      public.business_type not null,
  preview_image_url  text,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- websites: الموقع المُنشأ لكل نشاط (نسخة واحدة قابلة للنشر لكل business حاليًا)
-- -----------------------------------------------------------------------------
create table public.websites (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  template_id    uuid not null references public.templates (id),

  -- رابط عام فريد: mawqii.com/s/<slug>
  slug           text not null unique,

  -- تخصيصات المحرر
  colors         jsonb not null default '{"primary": "#114B3F", "accent": "#E8942A"}'::jsonb,
  font           text not null default 'el-messiri',
  sections_order jsonb not null default '["hero","about","services","gallery","hours","contact"]'::jsonb,
  content_overrides jsonb not null default '{}'::jsonb,

  status         public.website_status not null default 'draft',
  published_at   timestamptz,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_websites_business_id on public.websites (business_id);
create index idx_websites_user_id on public.websites (user_id);
create index idx_websites_slug on public.websites (slug);

create trigger trg_websites_updated_at
  before update on public.websites
  for each row execute function public.set_updated_at();
