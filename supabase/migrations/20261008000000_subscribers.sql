-- Newsletter subscribers (opt-in via login modal checkbox or newsletter form).
-- Written only by the server (service role); no public policies.

create table if not exists public.subscribers (
  email         text primary key,
  source        text not null default '',
  subscribed_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;
