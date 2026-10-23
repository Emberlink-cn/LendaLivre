alter table public.works
  add column collects boolean not null default false,
  add column owner_id uuid references public.profiles (id) on delete set null;

update public.works set collects = true where id = 'terras';

alter table public.user_items
  add column level integer not null default 1 check (level >= 1);

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'profiles'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_role_check check (role in ('leitor', 'autor', 'super'));

create or replace function public.is_publisher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('autor', 'super')
  );
$$;

create or replace function public.owns_work(target text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.works
    where id = target and owner_id = auth.uid()
  );
$$;

revoke all on function public.is_publisher() from public;
revoke all on function public.owns_work(text) from public;
grant execute on function public.is_publisher() to anon, authenticated;
grant execute on function public.owns_work(text) to anon, authenticated;

create or replace function public.set_work_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_id is null or not public.is_super() then
    new.owner_id = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists works_owner on public.works;
create trigger works_owner
  before insert on public.works
  for each row execute function public.set_work_owner();

drop policy if exists works_read on public.works;
create policy works_read on public.works
  for select to anon, authenticated
  using (published_at is not null or public.is_super() or owner_id = auth.uid());

drop policy if exists works_write on public.works;
create policy works_insert on public.works
  for insert to authenticated
  with check (public.is_super() or (public.is_publisher() and owner_id = auth.uid()));

create policy works_update on public.works
  for update to authenticated
  using (public.is_super() or owner_id = auth.uid())
  with check (public.is_super() or owner_id = auth.uid());

create policy works_delete on public.works
  for delete to authenticated
  using (public.is_super() or owner_id = auth.uid());

drop policy if exists chapters_read on public.chapters;
create policy chapters_read on public.chapters
  for select to anon, authenticated
  using (published_at is not null or public.is_super() or public.owns_work(work_id));

drop policy if exists chapters_write on public.chapters;
create policy chapters_write on public.chapters
  for all to authenticated
  using (public.is_super() or public.owns_work(work_id))
  with check (public.is_super() or public.owns_work(work_id));

drop policy if exists tracks_read on public.tracks;
create policy tracks_read on public.tracks
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.chapters
      where chapters.id = tracks.chapter_id
        and (
          chapters.published_at is not null
          or public.is_super()
          or public.owns_work(chapters.work_id)
        )
    )
  );

drop policy if exists tracks_write on public.tracks;
create policy tracks_write on public.tracks
  for all to authenticated
  using (
    public.is_super()
    or exists (
      select 1 from public.chapters
      where chapters.id = tracks.chapter_id and public.owns_work(chapters.work_id)
    )
  )
  with check (
    public.is_super()
    or exists (
      select 1 from public.chapters
      where chapters.id = tracks.chapter_id and public.owns_work(chapters.work_id)
    )
  );

drop policy if exists media_write on public.media;
create policy media_insert on public.media
  for insert to authenticated
  with check (public.is_publisher() and created_by = auth.uid());

create policy media_update on public.media
  for update to authenticated
  using (public.is_super() or created_by = auth.uid())
  with check (public.is_super() or created_by = auth.uid());

create policy media_delete on public.media
  for delete to authenticated
  using (public.is_super() or created_by = auth.uid());

drop policy if exists "publicacao_insert" on storage.objects;
create policy "publicacao_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'publicacao' and public.is_publisher());
