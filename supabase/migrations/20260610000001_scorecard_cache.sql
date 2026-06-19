create table if not exists public.scorecard_cache (
  id          uuid default gen_random_uuid() primary key,
  cache_key   text not null unique,       -- normalized URL or query string
  source_url  text,                        -- original input URL if applicable
  slug        text not null unique,        -- used in /analyzed/[slug]
  product_name text not null,
  brand_name  text not null,
  scorecard   jsonb not null,             -- full Gemini scorecard JSON
  hit_count   integer default 1,
  created_at  timestamptz default now(),
  last_hit_at timestamptz default now()
);
alter table public.scorecard_cache enable row level security;
create policy "Anyone reads scorecard cache" on public.scorecard_cache for select using (true);
-- writes done via service role (bypasses RLS)
