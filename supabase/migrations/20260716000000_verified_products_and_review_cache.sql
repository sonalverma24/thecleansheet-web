-- The Clean Sheet — durable review persistence
-- 1) verified_products: the "Clean Sheet Approved" registry (tiles on /review and /verified)
-- 2) product_reviews: cached review results so a product's verdict/score is stable across cold starts
-- Writes happen server-side via the service-role client (bypasses RLS); reads are public.

create table if not exists public.verified_products (
  slug                text primary key,
  product_name        text not null default '',
  brand               text not null default '',
  score               integer not null default 0,
  score_label         text not null default '',
  integrity_score     integer,
  image_url           text,
  summary             text default '',
  usage_guidance      jsonb,
  verified_at         timestamptz not null default now(),
  methodology_version text not null default '',
  updated_at          timestamptz not null default now()
);

alter table public.verified_products enable row level security;

create policy "Anyone can read verified products"
  on public.verified_products for select using (true);

create index if not exists verified_products_verified_at_idx
  on public.verified_products (verified_at desc);

create table if not exists public.product_reviews (
  query_key   text primary key,
  result      jsonb not null,
  created_at  timestamptz not null default now()
);

alter table public.product_reviews enable row level security;

create policy "Anyone can read cached reviews"
  on public.product_reviews for select using (true);
