-- ============================================================
-- The Clean Sheet — Full Schema Migration
-- Run once in Supabase → SQL Editor
-- ============================================================

-- ─── 1. PROFILES ────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid references auth.users on delete cascade primary key,
  full_name        text,
  avatar_url       text,
  email            text,
  skin_type        text,
  concerns         text[]  default '{}'::text[],
  sensitivity      boolean default false,
  pregnancy_status boolean default false,
  baby_care_interest boolean default false,
  avoid_ingredients  text[] default '{}'::text[],
  preferred_retailers text[] default '{}'::text[],
  budget_range     text,
  role             text    default 'consumer' check (role in ('consumer','admin','brand')),
  updated_at       timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins manage profiles"   on public.profiles for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 2. BRANDS ──────────────────────────────────────────────
create table if not exists public.brands (
  id          uuid default gen_random_uuid() primary key,
  name        text not null unique,
  slug        text not null unique,
  logo_url    text,
  tagline     text,
  description text,
  founded     text,
  headquarters text,
  website_url text,
  instagram_url text,
  nykaa_url   text,
  avg_score   numeric,
  verdict     text,
  is_published boolean default true,
  created_at  timestamptz default now()
);
alter table public.brands enable row level security;
create policy "Anyone reads brands"   on public.brands for select using (true);
create policy "Admins manage brands"  on public.brands for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 3. INGREDIENTS ─────────────────────────────────────────
create table if not exists public.ingredients (
  id              uuid default gen_random_uuid() primary key,
  inci_name       text not null unique,
  common_names    text[] default '{}'::text[],
  slug            text not null unique,
  function        text,
  description     text,
  why_used        text,
  why_matters     text,
  concern_level   text check (concern_level in ('low','medium','high','restricted','gap','beneficial','claim_relevant')),
  regulatory_note text,
  eu_status       text,
  india_status    text,
  us_fda_status   text,
  allergen_flag   boolean default false,
  pregnancy_flag  boolean default false,
  baby_flag       boolean default false,
  vegan           boolean,
  created_at      timestamptz default now()
);
alter table public.ingredients enable row level security;
create policy "Anyone reads ingredients"  on public.ingredients for select using (true);
create policy "Admins manage ingredients" on public.ingredients for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ingredient aliases (common names → INCI lookup)
create table if not exists public.ingredient_aliases (
  id            uuid default gen_random_uuid() primary key,
  ingredient_id uuid references public.ingredients(id) on delete cascade,
  alias         text not null,
  unique(ingredient_id, alias)
);
alter table public.ingredient_aliases enable row level security;
create policy "Anyone reads aliases" on public.ingredient_aliases for select using (true);

-- ─── 4. PRODUCTS ────────────────────────────────────────────
create table if not exists public.products (
  id                  uuid default gen_random_uuid() primary key,
  brand_id            uuid references public.brands(id) on delete cascade,
  brand_name          text not null,
  brand_slug          text not null,
  product_name        text not null,
  slug                text not null unique,
  category            text not null,
  subcategory         text,
  product_type        text,
  size_value          numeric,
  size_unit           text,
  mrp                 numeric,
  price_min           numeric,
  price_max           numeric,
  price_per_ml        numeric,
  product_image_url   text,
  ingredient_list     text not null,
  claims              text[] default '{}'::text[],
  directions          text,
  warnings            text,
  source_url          text,
  fragrance_free      boolean default false,
  pregnancy_caution   boolean default false,
  baby_safe           boolean default false,
  skin_type_tags      text[] default '{}'::text[],
  concern_tags        text[] default '{}'::text[],
  suitability_tags    text[] default '{}'::text[],
  caution_tags        text[] default '{}'::text[],
  status              text default 'Public Data Review' check (status in (
    'Certified Product','Verified Scorecard','Public Data Review',
    'User Submitted','Awaiting Evidence'
  )),
  analysis_confidence text default 'High' check (analysis_confidence in ('High','Medium','Low')),
  analyzed_at         timestamptz,
  is_published        boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
alter table public.products enable row level security;
create policy "Anyone reads published products" on public.products
  for select using (is_published = true or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));
create policy "Admins manage products" on public.products for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 5. PRODUCT IMAGES ──────────────────────────────────────
create table if not exists public.product_images (
  id          uuid default gen_random_uuid() primary key,
  product_id  uuid references public.products(id) on delete cascade,
  url         text not null,
  alt_text    text,
  is_primary  boolean default false,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);
alter table public.product_images enable row level security;
create policy "Anyone reads product images" on public.product_images for select using (true);
create policy "Admins manage product images" on public.product_images for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 6. RETAILER LINKS ──────────────────────────────────────
create table if not exists public.product_retailer_links (
  id            uuid default gen_random_uuid() primary key,
  product_id    uuid references public.products(id) on delete cascade,
  retailer_name text not null,
  url           text not null,
  affiliate_tag text,
  is_active     boolean default true,
  last_checked  timestamptz default now(),
  created_at    timestamptz default now()
);
alter table public.product_retailer_links enable row level security;
create policy "Anyone reads active links" on public.product_retailer_links
  for select using (is_active = true);
create policy "Admins manage retailer links" on public.product_retailer_links for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 7. PRODUCT INGREDIENTS (junction) ──────────────────────
create table if not exists public.product_ingredients (
  product_id       uuid references public.products(id) on delete cascade,
  ingredient_id    uuid references public.ingredients(id) on delete cascade,
  ingredient_order integer,
  flag             text check (flag in ('ok','warn','info','restrict')),
  notes            text,
  primary key (product_id, ingredient_id)
);
alter table public.product_ingredients enable row level security;
create policy "Anyone reads product ingredients" on public.product_ingredients for select using (true);
create policy "Admins manage product ingredients" on public.product_ingredients for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 8. PRODUCT SCORES ──────────────────────────────────────
create table if not exists public.product_scores (
  id                  uuid default gen_random_uuid() primary key,
  product_id          uuid references public.products(id) on delete cascade unique,
  total_score         integer not null check (total_score between 0 and 100),
  safety_score        integer not null check (safety_score between 0 and 50),
  formulation_score   integer not null check (formulation_score between 0 and 20),
  claims_score        integer not null check (claims_score between 0 and 20),
  ethics_score        integer not null check (ethics_score between 0 and 10),
  score_label         text check (score_label in ('Excellent','Good','Fair','Use with Caution','Insufficient Data')),
  verdict             text,
  best_for            text[] default '{}'::text[],
  avoid_if            text[] default '{}'::text[],
  expert_summary      text,
  formula_logic       text,
  pass_badges         text[] default '{}'::text[],
  warn_badges         text[] default '{}'::text[],
  info_badges         text[] default '{}'::text[],
  score_breakdown_json jsonb,
  admin_override      boolean default false,
  override_reason     text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
alter table public.product_scores enable row level security;
create policy "Anyone reads scores" on public.product_scores for select using (true);
create policy "Admins manage scores" on public.product_scores for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 9. CLAIMS AUDIT ────────────────────────────────────────
create table if not exists public.product_claims_audit (
  id              uuid default gen_random_uuid() primary key,
  product_id      uuid references public.products(id) on delete cascade,
  claim           text not null,
  status          text check (status in (
    'Supported by available data',
    'Plausible but not verified',
    'Not verifiable from label',
    'Potentially misleading',
    'Requires lab test',
    'Requires clinical evidence',
    'Contradicted by ingredient list'
  )),
  reason          text,
  evidence_needed text,
  sort_order      integer default 0
);
alter table public.product_claims_audit enable row level security;
create policy "Anyone reads claims audit" on public.product_claims_audit for select using (true);
create policy "Admins manage claims audit" on public.product_claims_audit for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 10. SAVED PRODUCTS ──────────────────────────────────────
create table if not exists public.saved_products (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  product_id  uuid references public.products(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);
alter table public.saved_products enable row level security;
create policy "Users manage own saved products" on public.saved_products
  for all using (auth.uid() = user_id);

-- ─── 11. COMPARE LISTS ───────────────────────────────────────
create table if not exists public.compare_lists (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  product_ids uuid[] default '{}'::uuid[],
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.compare_lists enable row level security;
create policy "Users manage own compare lists" on public.compare_lists
  for all using (auth.uid() = user_id);

-- ─── 12. REVIEWS ─────────────────────────────────────────────
create table if not exists public.product_reviews (
  id              uuid default gen_random_uuid() primary key,
  product_id      uuid references public.products(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
  rating          integer not null check (rating between 1 and 5),
  skin_type       text,
  duration_used   text,
  bought_from     text,
  review_text     text,
  would_repurchase boolean,
  is_anonymous    boolean default false,
  is_approved     boolean default false,
  created_at      timestamptz default now()
);
alter table public.product_reviews enable row level security;
create policy "Anyone reads approved reviews" on public.product_reviews
  for select using (is_approved = true);
create policy "Logged in users write reviews" on public.product_reviews
  for insert with check (auth.uid() = user_id);
create policy "Admins manage reviews" on public.product_reviews for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 13. ROUTINES ────────────────────────────────────────────
create table if not exists public.routines (
  id                 uuid default gen_random_uuid() primary key,
  user_id            uuid references auth.users(id) on delete cascade unique,
  skin_type          text,
  concerns           text[] default '{}'::text[],
  sensitivity        boolean default false,
  pregnancy_status   boolean default false,
  baby_care_interest boolean default false,
  budget_range       text,
  preferred_retailers text[] default '{}'::text[],
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create table if not exists public.routine_steps (
  id           uuid default gen_random_uuid() primary key,
  routine_id   uuid references public.routines(id) on delete cascade,
  time_of_day  text check (time_of_day in ('morning','night')),
  step_order   integer not null,
  step_label   text,
  product_id   uuid references public.products(id) on delete set null,
  notes        text
);
alter table public.routines enable row level security;
alter table public.routine_steps enable row level security;
create policy "Users manage own routine" on public.routines
  for all using (auth.uid() = user_id);
create policy "Users manage own routine steps" on public.routine_steps
  for all using (exists (
    select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid()
  ));

-- ─── 14. ANALYSIS REQUESTS & RESULTS ─────────────────────────
create table if not exists public.analysis_requests (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete set null,
  raw_input   text not null,
  source_type text check (source_type in ('url','text','image','preset')),
  source_url  text,
  status      text default 'pending' check (status in ('pending','processing','completed','failed')),
  created_at  timestamptz default now()
);
create table if not exists public.analysis_results (
  id                    uuid default gen_random_uuid() primary key,
  request_id            uuid references public.analysis_requests(id) on delete cascade,
  extracted_name        text,
  extracted_brand       text,
  detected_category     text,
  extracted_ingredients text,
  normalised_ingredients text[],
  claims_found          text[],
  score_json            jsonb,
  findings_json         jsonb,
  claims_json           jsonb,
  confidence_score      numeric,
  source_type           text,
  missing_data          text[],
  admin_approved        boolean default false,
  created_at            timestamptz default now()
);
alter table public.analysis_requests enable row level security;
alter table public.analysis_results enable row level security;
create policy "Users view own requests" on public.analysis_requests
  for select using (auth.uid() = user_id or user_id is null);
create policy "Users insert requests" on public.analysis_requests
  for insert with check (auth.uid() = user_id or auth.uid() is null);
create policy "Users view own results" on public.analysis_results
  for select using (exists (
    select 1 from public.analysis_requests r
    where r.id = request_id and (r.user_id = auth.uid() or r.user_id is null)
  ));
create policy "Admins manage analysis" on public.analysis_results for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 15. ARTICLES ────────────────────────────────────────────
create table if not exists public.articles (
  id            uuid default gen_random_uuid() primary key,
  title         text not null,
  slug          text not null unique,
  category      text,
  excerpt       text,
  content       text,
  cover_image   text,
  author        text default 'The Clean Sheet',
  tags          text[] default '{}'::text[],
  is_published  boolean default false,
  published_at  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.articles enable row level security;
create policy "Anyone reads published articles" on public.articles
  for select using (is_published = true or exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));
create policy "Admins manage articles" on public.articles for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 16. EDUCATIONAL PRESETS ─────────────────────────────────
create table if not exists public.educational_presets (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  subtitle        text,
  category        text,
  score           integer not null,
  score_label     text,
  purpose         text,
  ingredient_list text not null,
  expected_flags  text[] default '{}'::text[],
  expected_result text,
  sort_order      integer default 0,
  is_active       boolean default true
);
alter table public.educational_presets enable row level security;
create policy "Anyone reads presets" on public.educational_presets
  for select using (is_active = true);
create policy "Admins manage presets" on public.educational_presets for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ─── 17. ADMIN AUDIT LOG ─────────────────────────────────────
create table if not exists public.admin_audit_logs (
  id          uuid default gen_random_uuid() primary key,
  admin_id    uuid references auth.users(id) on delete set null,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  notes       text,
  created_at  timestamptz default now()
);
alter table public.admin_audit_logs enable row level security;
create policy "Admins read audit logs" on public.admin_audit_logs
  for select using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));
create policy "Admins insert audit logs" on public.admin_audit_logs
  for insert with check (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

-- ─── 18. BUY CLICK TRACKING ──────────────────────────────────
create table if not exists public.buy_click_events (
  id            uuid default gen_random_uuid() primary key,
  product_id    uuid references public.products(id) on delete cascade,
  retailer_name text,
  user_id       uuid references auth.users(id) on delete set null,
  created_at    timestamptz default now()
);
alter table public.buy_click_events enable row level security;
create policy "Admins read click events" on public.buy_click_events
  for select using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));
create policy "Anyone inserts click events" on public.buy_click_events
  for insert with check (true);

-- ─── 19. CERTIFICATION ENQUIRIES ─────────────────────────────
create table if not exists public.certification_enquiries (
  id            uuid default gen_random_uuid() primary key,
  brand_name    text not null,
  contact_name  text not null,
  email         text not null,
  website       text,
  message       text,
  status        text default 'new' check (status in ('new','in_review','approved','rejected')),
  created_at    timestamptz default now()
);
alter table public.certification_enquiries enable row level security;
create policy "Admins manage enquiries" on public.certification_enquiries for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Anyone inserts enquiries" on public.certification_enquiries
  for insert with check (true);

-- ─── 20. LEADS ───────────────────────────────────────────────
create table if not exists public.leads (
  id          uuid default gen_random_uuid() primary key,
  email       text not null,
  name        text,
  source      text,
  notes       text,
  created_at  timestamptz default now()
);
alter table public.leads enable row level security;
create policy "Admins manage leads" on public.leads for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "Anyone inserts leads" on public.leads for insert with check (true);

-- ─── SEED: Educational Presets ───────────────────────────────
insert into public.educational_presets (title, subtitle, category, score, score_label, purpose, ingredient_list, expected_flags, expected_result, sort_order) values

('Authentic Mild Baby Hydrator', 'See how an excellent profile looks', 'Baby Care', 96, 'Excellent',
'Previews an excellent, baby-safe squalane and lipid composition with minimal irritation risk.',
'Aqua, Squalane, Glycerin, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Sodium Hyaluronate, Tocopherol, Carbomer, Xanthan Gum, Sodium Lauroyl Lactylate',
ARRAY['Excellent safety profile','No fragrance','Baby-safe ingredient set','Strong barrier support','Minimal claim risk'],
'Excellent profile. Low irritation risk. Strong barrier support. Baby safety logic triggered. No red flags.',
1),

('Questionable "15% Vitamin C" Serum', 'Watch the Phenoxyethanol Rule in action', 'Serum', 58, 'Fair',
'Demonstrates the Phenoxyethanol Rule — actives listed after the preservative threshold are likely below meaningful concentration.',
'Aqua, Glycerin, Niacinamide, Propanediol, Panthenol, Sodium Ascorbyl Phosphate, Ascorbic Acid, Ferulic Acid, Tocopherol, Phenoxyethanol, Ascorbyl Glucoside, Vitamin C (15%), Ethylhexylglycerin, Disodium EDTA, Carbomer',
ARRAY['Active ingredient concentration flag','Phenoxyethanol threshold rule triggered','Potentially deceptive active claim','Missing proof for 15% Vitamin C claim'],
'Active ingredients listed after the preservative threshold are likely below meaningful concentration. The "15% Vitamin C" claim is flagged as potentially deceptive based on INCI order.',
2),

('Stripping "Gentle" Charcoal Wash', 'Claim mismatch and safety flags combined', 'Cleanser', 42, 'Use with Caution',
'Triggers severe safety and claim mismatch flags — "gentle" claim contradicted by harsh surfactants and a formaldehyde releaser.',
'Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Activated Charcoal, DMDM Hydantoin, Fragrance, Sodium Chloride, Citric Acid, PEG-7 Glyceryl Cocoate, Disodium EDTA',
ARRAY['Sodium Laureth Sulfate flagged','DMDM Hydantoin (formaldehyde releaser) flagged','Fragrance flagged','Claim contradiction: gentle vs harsh surfactant','High stripping potential'],
'Sodium Laureth Sulfate and DMDM Hydantoin flagged. Fragrance present. "Gentle" claim directly contradicted by formulation. High concern profile.',
3),

('Standard SPF 50 Chemical Sunscreen', 'Systemic absorption and reef concerns explained', 'Sunscreen', 54, 'Fair',
'Explains systemic absorption concerns and reef risk linked to Oxybenzone — triggers the sunscreen evaluation module.',
'Aqua, Homosalate (10%), Oxybenzone (6%), Octinoxate (7.5%), Octocrylene (5%), Glycerin, Dimethicone, Niacinamide, Phenoxyethanol, Fragrance, Carbomer, Disodium EDTA, Tocopheryl Acetate',
ARRAY['Oxybenzone flagged (systemic absorption + reef concern)','SPF validation proof required','UVA protection proof required','Photostability evidence needed','Sunscreen module triggered','Fragrance present'],
'Sunscreen module triggered. Oxybenzone flagged for systemic absorption risk and reef impact. SPF, UVA, and photostability evidence required. Fragrance noted.',
4)

on conflict do nothing;
