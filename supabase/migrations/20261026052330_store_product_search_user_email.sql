-- Store the searcher's email as a text snapshot, then backfill prior searches
-- from the linked Auth account. user_email was incorrectly created as UUID in
-- production; no earlier migration creates it, so create it first for any
-- database that does not have the column yet. Neither statement drops or
-- rewrites rows: the add is skipped when the column exists, and the type change
-- keeps every value as text.
alter table public.product_searches
  add column if not exists user_email text;

alter table public.product_searches
  alter column user_email type text using user_email::text;

update public.product_searches as searches
set user_email = auth_user.email
from auth.users as auth_user
where auth_user.id = searches.user_id
  and searches.user_email is null
  and auth_user.email is not null;
