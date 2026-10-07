create extension if not exists pgcrypto;

create type public.content_role as enum ('user', 'editor', 'admin');
create type public.bookmark_content_type as enum ('hadith', 'ayah', 'dua');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 120),
  role public.content_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_user();

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and coalesce(current_setting('role', true), '') <> 'service_role' then
    raise exception 'Profile role can only be changed by a privileged operator';
  end if;
  return new;
end;
$$;

create trigger prevent_profile_role_change
  before update on public.profiles
  for each row execute function public.prevent_profile_role_change();

create or replace function public.has_content_role(required_role public.content_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and (p.role = 'admin' or p.role = required_role)
  );
$$;

create table public.hadith_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (length(trim(name)) > 0),
  arabic_name text,
  author text,
  description text,
  source_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hadith_books (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.hadith_collections (id) on delete cascade,
  book_number integer not null check (book_number > 0),
  name text not null,
  arabic_name text,
  source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, book_number)
);

create table public.hadith_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.hadith_books (id) on delete cascade,
  chapter_number integer not null check (chapter_number > 0),
  title text not null,
  arabic_title text,
  source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, chapter_number)
);

create table public.hadiths (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.hadith_collections (id) on delete cascade,
  book_id uuid references public.hadith_books (id) on delete set null,
  chapter_id uuid references public.hadith_chapters (id) on delete set null,
  hadith_number text not null check (length(trim(hadith_number)) > 0),
  narrator text,
  arabic text not null check (length(trim(arabic)) > 0),
  tamil text,
  english text,
  grade text,
  source_reference text not null check (length(trim(source_reference)) > 0),
  source_url text,
  is_published boolean not null default false,
  search_document tsvector generated always as (
    to_tsvector('simple', coalesce(arabic, '') || ' ' || coalesce(tamil, '') || ' ' ||
      coalesce(english, '') || ' ' || coalesce(narrator, '') || ' ' ||
      coalesce(hadith_number, '') || ' ' || coalesce(source_reference, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, hadith_number)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  tamil_name text,
  arabic_name text,
  description text,
  icon text,
  color text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hadith_topics (
  hadith_id uuid not null references public.hadiths (id) on delete cascade,
  topic_id uuid not null references public.topics (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (hadith_id, topic_id)
);

create table public.quran_surahs (
  id smallint primary key check (id between 1 and 114),
  name_arabic text not null,
  name_transliteration text not null,
  name_english text,
  revelation_place text check (revelation_place in ('makkah', 'madinah')),
  verses_count smallint not null check (verses_count > 0),
  source_reference text not null default 'Quran',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quran_ayahs (
  id uuid primary key default gen_random_uuid(),
  surah_id smallint not null references public.quran_surahs (id) on delete cascade,
  ayah_number smallint not null check (ayah_number > 0),
  arabic text not null check (length(trim(arabic)) > 0),
  tamil text,
  english text,
  source_reference text not null default 'Quran',
  translation_source text,
  search_document tsvector generated always as (
    to_tsvector('simple', coalesce(arabic, '') || ' ' || coalesce(tamil, '') || ' ' ||
      coalesce(english, '') || ' ' || coalesce(source_reference, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (surah_id, ayah_number)
);

create table public.dua_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  tamil_name text,
  icon text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.duas (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.dua_categories (id) on delete set null,
  title text not null,
  tamil_title text,
  arabic text not null check (length(trim(arabic)) > 0),
  transliteration text,
  meaning_tamil text,
  meaning_english text,
  source_reference text not null check (length(trim(source_reference)) > 0),
  source_url text,
  grade text,
  recommended_count integer check (recommended_count is null or recommended_count > 0),
  editorial_note text,
  is_published boolean not null default false,
  search_document tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(tamil_title, '') || ' ' ||
      coalesce(arabic, '') || ' ' || coalesce(transliteration, '') || ' ' ||
      coalesce(meaning_tamil, '') || ' ' || coalesce(meaning_english, '') || ' ' ||
      coalesce(source_reference, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dhikr (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session text not null default 'general' check (session in ('after-prayer', 'morning', 'evening', 'general')),
  arabic text not null check (length(trim(arabic)) > 0),
  transliteration text,
  meaning text,
  meaning_tamil text,
  recommended_count integer check (recommended_count is null or recommended_count > 0),
  source_reference text not null check (length(trim(source_reference)) > 0),
  source_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_reminders (
  id uuid primary key default gen_random_uuid(),
  reminder_date date not null,
  content_type text not null check (content_type in ('quran', 'hadith', 'dua', 'dhikr')),
  ayah_id uuid references public.quran_ayahs (id) on delete cascade,
  hadith_id uuid references public.hadiths (id) on delete cascade,
  dua_id uuid references public.duas (id) on delete cascade,
  dhikr_id uuid references public.dhikr (id) on delete cascade,
  selected_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (content_type = 'quran' and ayah_id is not null and hadith_id is null and dua_id is null and dhikr_id is null) or
    (content_type = 'hadith' and hadith_id is not null and ayah_id is null and dua_id is null and dhikr_id is null) or
    (content_type = 'dua' and dua_id is not null and ayah_id is null and hadith_id is null and dhikr_id is null) or
    (content_type = 'dhikr' and dhikr_id is not null and ayah_id is null and hadith_id is null and dua_id is null)
  ),
  unique (reminder_date, content_type)
);

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type public.bookmark_content_type not null,
  hadith_id uuid references public.hadiths (id) on delete cascade,
  ayah_id uuid references public.quran_ayahs (id) on delete cascade,
  dua_id uuid references public.duas (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (
    (content_type = 'hadith' and hadith_id is not null and ayah_id is null and dua_id is null) or
    (content_type = 'ayah' and ayah_id is not null and hadith_id is null and dua_id is null) or
    (content_type = 'dua' and dua_id is not null and hadith_id is null and ayah_id is null)
  ),
  unique (user_id, content_type, hadith_id),
  unique (user_id, content_type, ayah_id),
  unique (user_id, content_type, dua_id)
);

create table public.reading_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type public.bookmark_content_type not null,
  hadith_id uuid references public.hadiths (id) on delete cascade,
  ayah_id uuid references public.quran_ayahs (id) on delete cascade,
  dua_id uuid references public.duas (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  check (
    (content_type = 'hadith' and hadith_id is not null and ayah_id is null and dua_id is null) or
    (content_type = 'ayah' and ayah_id is not null and hadith_id is null and dua_id is null) or
    (content_type = 'dua' and dua_id is not null and hadith_id is null and ayah_id is null)
  )
);

create unique index reading_history_hadith_unique on public.reading_history (user_id, hadith_id) where hadith_id is not null;
create unique index reading_history_ayah_unique on public.reading_history (user_id, ayah_id) where ayah_id is not null;
create unique index reading_history_dua_unique on public.reading_history (user_id, dua_id) where dua_id is not null;

create table public.youtube_cache (
  cache_key text primary key,
  response jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create table public.youtube_rate_limits (
  rate_key text primary key,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0)
);

alter table public.youtube_cache enable row level security;
alter table public.youtube_rate_limits enable row level security;

create or replace function public.take_youtube_request(rate_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
begin
  insert into public.youtube_rate_limits as limits (rate_key, window_start, request_count)
  values (take_youtube_request.rate_key, date_trunc('minute', now()), 1)
  on conflict (rate_key) do update
    set window_start = case
          when limits.window_start < date_trunc('minute', now()) then date_trunc('minute', now())
          else limits.window_start
        end,
        request_count = case
          when limits.window_start < date_trunc('minute', now()) then 1
          else limits.request_count + 1
        end
  returning request_count <= 30 into allowed;
  return allowed;
end;
$$;

revoke all on function public.take_youtube_request(text) from public, anon, authenticated;
grant execute on function public.take_youtube_request(text) to service_role;

create index hadiths_collection_number_idx on public.hadiths (collection_id, hadith_number);
create index hadiths_book_chapter_idx on public.hadiths (book_id, chapter_id);
create index hadiths_search_idx on public.hadiths using gin (search_document);
create index hadith_books_collection_idx on public.hadith_books (collection_id, book_number);
create index hadith_chapters_book_idx on public.hadith_chapters (book_id, chapter_number);
create index hadith_topics_topic_idx on public.hadith_topics (topic_id, hadith_id);
create index topics_search_idx on public.topics using gin (to_tsvector('simple', name || ' ' || coalesce(tamil_name, '') || ' ' || coalesce(description, '')));
create index quran_ayahs_surah_number_idx on public.quran_ayahs (surah_id, ayah_number);
create index quran_ayahs_search_idx on public.quran_ayahs using gin (search_document);
create index duas_category_idx on public.duas (category_id);
create index duas_search_idx on public.duas using gin (search_document);
create index dhikr_session_idx on public.dhikr (session);
create index bookmarks_user_created_idx on public.bookmarks (user_id, created_at desc);
create index reading_history_user_read_idx on public.reading_history (user_id, last_read_at desc);
create index daily_reminders_date_idx on public.daily_reminders (reminder_date desc);

create or replace function public.search_content(search_query text, result_limit integer default 20, result_offset integer default 0)
returns table (
  content_type text,
  content_id uuid,
  title text,
  excerpt text,
  source_reference text,
  rank real
)
language sql
stable
security invoker
set search_path = ''
as $$
  with q as (select websearch_to_tsquery('simple', left(trim(search_query), 200)) as term),
  matches as (
    select 'quran'::text, a.id, s.name_transliteration || ' ' || s.id::text || ':' || a.ayah_number::text,
      left(coalesce(a.english, a.tamil, a.arabic), 240), a.source_reference,
      ts_rank(a.search_document, q.term)
    from public.quran_ayahs a join public.quran_surahs s on s.id = a.surah_id cross join q
    where q.term <> ''::tsquery and a.search_document @@ q.term
    union all
    select 'hadith', h.id, c.name || ' ' || h.hadith_number,
      left(coalesce(h.english, h.tamil, h.arabic), 240), h.source_reference,
      ts_rank(h.search_document, q.term)
    from public.hadiths h join public.hadith_collections c on c.id = h.collection_id cross join q
    where q.term <> ''::tsquery and h.is_published and c.is_published and h.search_document @@ q.term
    union all
    select 'dua', d.id, d.title, left(coalesce(d.meaning_tamil, d.meaning_english, d.arabic), 240),
      d.source_reference, ts_rank(d.search_document, q.term)
    from public.duas d cross join q
    where q.term <> ''::tsquery and d.is_published and d.search_document @@ q.term
    union all
    select 'topic', t.id, t.name, left(coalesce(t.description, t.tamil_name, ''), 240),
      null::text, ts_rank(to_tsvector('simple', t.name || ' ' || coalesce(t.tamil_name, '') || ' ' || coalesce(t.description, '')), q.term)
    from public.topics t cross join q
    where q.term <> ''::tsquery and t.is_published and
      to_tsvector('simple', t.name || ' ' || coalesce(t.tamil_name, '') || ' ' || coalesce(t.description, '')) @@ q.term
  )
  select m.content_type, m.id, m.title, m.excerpt, m.source_reference, m.rank
  from matches m
  order by m.rank desc
  limit least(greatest(result_limit, 1), 50)
  offset greatest(result_offset, 0);
$$;

create or replace function public.record_read(
  read_type public.bookmark_content_type,
  read_hadith_id uuid default null,
  read_ayah_id uuid default null,
  read_dua_id uuid default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if (read_type = 'hadith' and (read_hadith_id is null or read_ayah_id is not null or read_dua_id is not null))
     or (read_type = 'ayah' and (read_ayah_id is null or read_hadith_id is not null or read_dua_id is not null))
     or (read_type = 'dua' and (read_dua_id is null or read_hadith_id is not null or read_ayah_id is not null)) then
    raise exception 'Content type and content id do not match';
  end if;
  insert into public.reading_history (user_id, content_type, hadith_id, ayah_id, dua_id)
  values (auth.uid(), read_type, read_hadith_id, read_ayah_id, read_dua_id)
  on conflict do nothing;
  update public.reading_history
  set last_read_at = now()
  where user_id = auth.uid()
    and ((read_type = 'hadith' and hadith_id = read_hadith_id)
      or (read_type = 'ayah' and ayah_id = read_ayah_id)
      or (read_type = 'dua' and dua_id = read_dua_id));
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'hadith_collections', 'hadith_books', 'hadith_chapters', 'hadiths',
    'hadith_topics', 'topics', 'quran_surahs', 'quran_ayahs', 'duas',
    'dua_categories', 'dhikr', 'daily_reminders', 'bookmarks', 'reading_history'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

create policy "Users read own profile" on public.profiles for select using (id = (select auth.uid()));
create policy "Users update own display name" on public.profiles for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Public read published collections" on public.hadith_collections for select using (is_published or (select public.has_content_role('editor')));
create policy "Editors manage collections" on public.hadith_collections for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read books in published collections" on public.hadith_books for select using (
  exists (select 1 from public.hadith_collections c where c.id = collection_id and (c.is_published or (select public.has_content_role('editor'))))
);
create policy "Editors manage books" on public.hadith_books for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read chapters in published collections" on public.hadith_chapters for select using (
  exists (select 1 from public.hadith_books b join public.hadith_collections c on c.id = b.collection_id
    where b.id = book_id and (c.is_published or (select public.has_content_role('editor'))))
);
create policy "Editors manage chapters" on public.hadith_chapters for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read published hadiths" on public.hadiths for select using (
  is_published and exists (select 1 from public.hadith_collections c where c.id = collection_id and c.is_published)
  or (select public.has_content_role('editor'))
);
create policy "Editors manage hadiths" on public.hadiths for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read published topics" on public.topics for select using (is_published or (select public.has_content_role('editor')));
create policy "Editors manage topics" on public.topics for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read hadith topics" on public.hadith_topics for select using (
  exists (select 1 from public.hadiths h where h.id = hadith_id and h.is_published)
);
create policy "Editors manage hadith topics" on public.hadith_topics for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read surahs" on public.quran_surahs for select using (true);
create policy "Editors manage surahs" on public.quran_surahs for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read ayahs" on public.quran_ayahs for select using (true);
create policy "Editors manage ayahs" on public.quran_ayahs for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read published dua categories" on public.dua_categories for select using (is_published or (select public.has_content_role('editor')));
create policy "Editors manage dua categories" on public.dua_categories for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read published duas" on public.duas for select using (is_published or (select public.has_content_role('editor')));
create policy "Editors manage duas" on public.duas for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read published dhikr" on public.dhikr for select using (is_published or (select public.has_content_role('editor')));
create policy "Editors manage dhikr" on public.dhikr for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Public read daily reminders" on public.daily_reminders for select using (true);
create policy "Editors manage daily reminders" on public.daily_reminders for all using ((select public.has_content_role('editor'))) with check ((select public.has_content_role('editor')));
create policy "Users manage own bookmarks" on public.bookmarks for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Users manage own reading history" on public.reading_history for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger hadith_collections_updated_at before update on public.hadith_collections for each row execute function public.set_updated_at();
create trigger hadith_books_updated_at before update on public.hadith_books for each row execute function public.set_updated_at();
create trigger hadith_chapters_updated_at before update on public.hadith_chapters for each row execute function public.set_updated_at();
create trigger hadiths_updated_at before update on public.hadiths for each row execute function public.set_updated_at();
create trigger topics_updated_at before update on public.topics for each row execute function public.set_updated_at();
create trigger quran_surahs_updated_at before update on public.quran_surahs for each row execute function public.set_updated_at();
create trigger quran_ayahs_updated_at before update on public.quran_ayahs for each row execute function public.set_updated_at();
create trigger dua_categories_updated_at before update on public.dua_categories for each row execute function public.set_updated_at();
create trigger duas_updated_at before update on public.duas for each row execute function public.set_updated_at();
create trigger dhikr_updated_at before update on public.dhikr for each row execute function public.set_updated_at();
