-- Brand intelligence is independently edited and evidence checked before publication.
-- The existing product_reviews table remains the only source of product ratings.

create table if not exists public.brand_intelligence (
  brand_slug text primary key,
  summary text,
  founded_year integer check (founded_year between 1800 and 2100),
  headquarters text,
  country_of_origin text,
  india_presence text,
  global_presence text,
  source_url text,
  checked_at timestamptz,
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.brand_manufacturer_records (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null,
  product_slug text,
  manufacturer_name text not null,
  facility_location text,
  disclosure_type text check (disclosure_type in ('packaging', 'regulatory', 'brand', 'other')),
  source_url text not null,
  checked_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists brand_manufacturer_records_brand_slug_idx
  on public.brand_manufacturer_records (brand_slug);

create table if not exists public.brand_reddit_sentiment (
  brand_slug text primary key,
  standing text not null check (standing in ('positive', 'negative', 'mixed', 'insufficient')),
  discussion_count integer not null default 0 check (discussion_count >= 0),
  period_start date,
  period_end date,
  checked_at timestamptz,
  praise_themes text[] not null default '{}',
  complaint_themes text[] not null default '{}',
  source_urls text[] not null default '{}',
  method_notes text,
  is_published boolean not null default false,
  constraint sentiment_source_check check (
    standing = 'insufficient' or
    (discussion_count >= 3 and cardinality(source_urls) >= 1 and checked_at is not null)
  )
);

alter table public.brand_intelligence enable row level security;
alter table public.brand_manufacturer_records enable row level security;
alter table public.brand_reddit_sentiment enable row level security;

-- Only published editorial entries are accessible publicly.
drop policy if exists "Anyone can read published brand facts" on public.brand_intelligence;
create policy "Anyone can read published brand facts"
on public.brand_intelligence for select to anon, authenticated
using (is_published = true);

drop policy if exists "Anyone can read published manufacturer disclosures" on public.brand_manufacturer_records;
create policy "Anyone can read published manufacturer disclosures"
on public.brand_manufacturer_records for select to anon, authenticated
using (is_published = true);

drop policy if exists "Anyone can read published sentiment summaries" on public.brand_reddit_sentiment;
create policy "Anyone can read published sentiment summaries"
on public.brand_reddit_sentiment for select to anon, authenticated
using (is_published = true);

grant select on public.brand_intelligence to anon, authenticated;
grant select on public.brand_manufacturer_records to anon, authenticated;
grant select on public.brand_reddit_sentiment to anon, authenticated;

-- No browser-side insert/update/delete grants. Editing is via trusted admin workflows.
