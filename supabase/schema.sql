-- ============================================================================
--  مخطط قاعدة بيانات وصلة (Wasla) على Supabase / PostgreSQL
--  شغّل هذا السكربت في: Supabase Dashboard → SQL Editor → New query
-- ============================================================================

-- ----- جدول الملفات الشخصية -----
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text unique not null,
  display_name text not null,
  bio text default '' not null,
  email text not null,
  avatar_url text,
  verified boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

-- القراءة متاحة للجميع (الصفحات العامة)
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- المستخدم يعدّل ملفه فقط
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ----- جدول الروابط -----
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete cascade not null,
  title text not null,
  url text not null,
  position integer default 0 not null,
  created_at timestamptz default now() not null
);

create index if not exists links_profile_id_idx on public.links (profile_id);

alter table public.links enable row level security;

create policy "Links are viewable by everyone"
  on public.links for select
  using (true);

create policy "Users can manage their own links"
  on public.links for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = links.profile_id and p.id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = links.profile_id and p.id = auth.uid()
    )
  );

-- ----- إنشاء الملف الشخصي تلقائياً عند أول تسجيل دخول (اختياري) -----
-- ملاحظة: التطبيق يُنشئ الملف عبر صفحة الإعداد (/onboarding)،
-- لذا هذه الدالة غير إلزامية ويمكن تفعيلها إن رغبت بإنشاء تلقائي.
