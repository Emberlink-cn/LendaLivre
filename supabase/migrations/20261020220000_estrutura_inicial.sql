-- Estrutura inicial do LendaLivre.
-- O leitor vê só o que tem published_at preenchido.
-- A conta super publica obra, capítulo, item, trilha e imagem.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar text not null default 'leaf' check (avatar in ('leaf', 'mark', 'river', 'ember')),
  role text not null default 'leitor' check (role in ('leitor', 'super')),
  level integer not null default 1 check (level >= 1),
  rank text not null default 'Leitor',
  created_at timestamptz not null default now()
);

create or replace function public.is_super()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super'
  );
$$;

create or replace function public.protect_profile()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.is_super() then
    new.role = old.role;
    new.level = old.level;
    new.rank = old.rank;
  end if;
  return new;
end;
$$;

create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_profile();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1), 'Leitor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'publicacao',
  path text not null,
  mime text not null,
  bytes integer not null check (bytes >= 0),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create table public.works (
  id text primary key,
  title text not null,
  line text not null default '',
  cover_id uuid references public.media (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger works_updated_at
  before update on public.works
  for each row execute function public.set_updated_at();

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  work_id text not null references public.works (id) on delete cascade,
  slug text not null,
  source_key text not null unique,
  number integer not null check (number > 0),
  name text not null,
  title text not null,
  line text not null default '',
  paragraphs jsonb not null default '[]'::jsonb,
  note text not null default '',
  cover_id uuid references public.media (id) on delete set null,
  moods text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (work_id, slug)
);

create trigger chapters_updated_at
  before update on public.chapters
  for each row execute function public.set_updated_at();

create table public.items (
  id text primary key,
  name text not null,
  word text not null,
  type text not null,
  rarity text not null default 'comum',
  atmosphere text not null default '',
  frame text,
  passive text not null default '',
  energia integer not null default 0,
  ataque integer not null default 0,
  defesa integer not null default 0,
  sorte integer not null default 0,
  azar integer not null default 0,
  image_id uuid references public.media (id) on delete set null,
  published_at timestamptz,
  removed_at timestamptz
);

create table public.chapter_items (
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  item_id text not null references public.items (id) on delete restrict,
  position integer not null default 0,
  primary key (chapter_id, item_id)
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  title text not null,
  embed_url text not null,
  position integer not null default 0
);

create table public.user_items (
  user_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null references public.items (id) on delete restrict,
  chapter_id uuid references public.chapters (id) on delete set null,
  collected_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table public.reading_state (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  last_chapter_id uuid references public.chapters (id) on delete set null,
  updated_at timestamptz not null default now()
);

create trigger reading_state_updated_at
  before update on public.reading_state
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'publicacao',
  'publicacao',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.media enable row level security;
alter table public.works enable row level security;
alter table public.chapters enable row level security;
alter table public.items enable row level security;
alter table public.chapter_items enable row level security;
alter table public.tracks enable row level security;
alter table public.user_items enable row level security;
alter table public.reading_state enable row level security;

create policy profiles_read on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_super());

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_super())
  with check (id = auth.uid() or public.is_super());

create policy media_read on public.media
  for select to anon, authenticated
  using (
    public.is_super()
    or exists (
      select 1 from public.works
      where cover_id = media.id and published_at is not null
    )
    or exists (
      select 1 from public.chapters
      where cover_id = media.id and published_at is not null
    )
    or exists (
      select 1 from public.items
      where image_id = media.id and published_at is not null and removed_at is null
    )
  );

create policy media_write on public.media
  for all to authenticated
  using (public.is_super())
  with check (public.is_super());

create policy works_read on public.works
  for select to anon, authenticated
  using (published_at is not null or public.is_super());

create policy works_write on public.works
  for all to authenticated
  using (public.is_super())
  with check (public.is_super());

create policy chapters_read on public.chapters
  for select to anon, authenticated
  using (published_at is not null or public.is_super());

create policy chapters_write on public.chapters
  for all to authenticated
  using (public.is_super())
  with check (public.is_super());

create policy items_read on public.items
  for select to anon, authenticated
  using (public.is_super() or (published_at is not null and removed_at is null));

create policy items_write on public.items
  for all to authenticated
  using (public.is_super())
  with check (public.is_super());

create policy chapter_items_read on public.chapter_items
  for select to anon, authenticated
  using (
    public.is_super()
    or exists (
      select 1 from public.chapters
      where id = chapter_id and published_at is not null
    )
  );

create policy chapter_items_write on public.chapter_items
  for all to authenticated
  using (public.is_super())
  with check (public.is_super());

create policy tracks_read on public.tracks
  for select to anon, authenticated
  using (
    public.is_super()
    or exists (
      select 1 from public.chapters
      where id = chapter_id and published_at is not null
    )
  );

create policy tracks_write on public.tracks
  for all to authenticated
  using (public.is_super())
  with check (public.is_super());

create policy user_items_read on public.user_items
  for select to authenticated
  using (user_id = auth.uid() or public.is_super());

create policy user_items_insert on public.user_items
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.items
      where id = item_id and published_at is not null and removed_at is null
    )
  );

create policy user_items_delete on public.user_items
  for delete to authenticated
  using (user_id = auth.uid() or public.is_super());

create policy reading_state_read on public.reading_state
  for select to authenticated
  using (user_id = auth.uid() or public.is_super());

create policy reading_state_insert on public.reading_state
  for insert to authenticated
  with check (user_id = auth.uid());

create policy reading_state_update on public.reading_state
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy publicacao_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'publicacao');

create policy publicacao_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'publicacao' and public.is_super());

create policy publicacao_update on storage.objects
  for update to authenticated
  using (bucket_id = 'publicacao' and public.is_super())
  with check (bucket_id = 'publicacao' and public.is_super());

create policy publicacao_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'publicacao' and public.is_super());

grant select on public.works, public.chapters, public.items, public.chapter_items, public.tracks, public.media to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.works, public.chapters, public.items, public.chapter_items, public.tracks, public.media to authenticated;
grant select, insert, delete on public.user_items to authenticated;
grant select, insert, update on public.reading_state to authenticated;

revoke all on function public.is_super() from public;
grant execute on function public.is_super() to anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.protect_profile() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
