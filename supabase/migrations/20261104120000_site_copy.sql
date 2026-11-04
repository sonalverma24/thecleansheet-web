-- Site wording an admin has changed from the live site (see src/lib/site-copy.ts).
-- One row per edited line. A line with no row shows the wording written in the code,
-- so deleting a row puts the original wording back. Nothing here is dropped or truncated.

create table if not exists public.site_copy (
  key         text primary key check (key ~ '^[a-z0-9][a-z0-9._-]{0,119}$'),
  value       text not null check (char_length(value) <= 5000),
  updated_by  text not null,
  updated_at  timestamptz not null default now()
);

alter table public.site_copy enable row level security;

drop policy if exists "Anyone can read site wording" on public.site_copy;
create policy "Anyone can read site wording"
on public.site_copy for select to anon, authenticated
using (true);

grant select on public.site_copy to anon, authenticated;

-- No browser-side insert/update/delete grants: edits go through /api/admin/copy,
-- which checks ADMIN_EMAILS and writes with the service-role client.
