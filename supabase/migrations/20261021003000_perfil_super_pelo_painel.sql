-- O editor SQL não tem auth.uid(). A trava antiga devolvia papel, nível e rank
-- e a promoção da conta de criador não permanecia.

create or replace function public.protect_profile()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_super() then
    new.role = old.role;
    new.level = old.level;
    new.rank = old.rank;
  end if;
  return new;
end;
$$;
