alter table public.items
  add column if not exists atmospheres text[] not null default '{}',
  add column if not exists image_zoom numeric not null default 1,
  add column if not exists image_x numeric not null default 50,
  add column if not exists image_y numeric not null default 50;

alter table public.items drop constraint if exists items_image_zoom_range;
alter table public.items drop constraint if exists items_image_x_range;
alter table public.items drop constraint if exists items_image_y_range;

alter table public.items
  add constraint items_image_zoom_range check (image_zoom >= 1 and image_zoom <= 3),
  add constraint items_image_x_range check (image_x >= 0 and image_x <= 100),
  add constraint items_image_y_range check (image_y >= 0 and image_y <= 100);

update public.items
set atmospheres = array[btrim(atmosphere)]
where btrim(atmosphere) <> ''
  and position('·' in atmosphere) = 0
  and cardinality(atmospheres) = 0;

update public.items
set atmospheres = (
  select coalesce(array_agg(mood), '{}')
  from (
    select btrim(part) as mood
    from unnest(string_to_array(atmosphere, '·')) as part
    where btrim(part) <> ''
  ) moods
)
where position('·' in atmosphere) > 0
  and cardinality(atmospheres) = 0;
