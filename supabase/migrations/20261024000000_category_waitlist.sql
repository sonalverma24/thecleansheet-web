-- The Clean Sheet — category waitlist
-- Someone who lands on a product we do not rate yet (today: a nutraceutical) can leave an
-- email to be written to when we start rating that kind of product. One row per email and
-- category. Written by /api/unrated-notify with the service-role client.
--
-- Emails are personal data: RLS is on and there is NO policy, so the public (anon) key can
-- neither read nor write this table. Only the service role, which bypasses RLS, can.

create table if not exists public.category_waitlist (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  category     text not null,                 -- 'nutraceutical'
  product_name text not null default '',      -- the product they were looking at
  brand        text not null default '',
  product_slug text,
  created_at   timestamptz not null default now(),
  notified_at  timestamptz,                   -- set when we have written to them
  unique (email, category)
);

alter table public.category_waitlist enable row level security;
