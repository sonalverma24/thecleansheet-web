-- The Clean Sheet — product review repository (product-keyed)
-- Replaces the query-keyed cache: every review (any tier) is stored once per
-- canonical product; repeat searches serve the stored review.
-- Safe to run whether or not the earlier product_reviews table exists.

drop table if exists public.product_reviews;

create table public.product_reviews (
  product_slug text primary key,
  product_name text not null default '',
  brand        text not null default '',
  tier         text not null default 'needs-proof',
  image_url    text,
  result       jsonb not null,
  rubric_rev   text not null default '',
  reviewed_at  timestamptz not null default now()
);

alter table public.product_reviews enable row level security;

create policy "Anyone can read stored reviews"
  on public.product_reviews for select using (true);

create index if not exists product_reviews_tier_idx
  on public.product_reviews (tier, reviewed_at desc);
