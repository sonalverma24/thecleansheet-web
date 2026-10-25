-- Registration attribution: first touch is immutable for each user.
-- Safe to run where the table already exists (as in the current project).
create table if not exists public.user_attribution (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_seen_at timestamptz,
  first_source text,
  first_medium text,
  first_campaign text,
  first_referrer_host text,
  first_landing_path text,
  last_source text,
  last_medium text,
  last_campaign text,
  signup_path text,
  recorded_at timestamptz default now()
);

alter table public.user_attribution enable row level security;
grant select, insert on public.user_attribution to authenticated;
revoke all on public.user_attribution from anon;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_attribution'
      and policyname = 'Users read own attribution'
  ) then
    create policy "Users read own attribution"
      on public.user_attribution for select to authenticated
      using ((select auth.uid()) = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_attribution'
      and policyname = 'Users insert own attribution'
  ) then
    create policy "Users insert own attribution"
      on public.user_attribution for insert to authenticated
      with check ((select auth.uid()) = user_id);
  end if;
end
$$;

-- No UPDATE or DELETE policies for browsers: first-touch cannot be overwritten.
