-- Init Schema for The Clean Sheet Safe Shopping App

-- 1. Profiles & Users
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    updated_at timestamp with time zone,
    full_name text,
    skin_type text, -- Dry, Oily, Combination, Normal
    concerns text[], -- Acne, Aging, Pigmentation, etc.
    sensitivity boolean default false,
    pregnancy_status boolean default false,
    baby_care_interest boolean default false,
    avoid_ingredients text[] default '{}'::text[],
    preferred_retailers text[] default '{}'::text[]
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
    for update using (auth.uid() = id);

-- 2. Brands
create table if not exists public.brands (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    slug text not null unique,
    logo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.brands enable row level security;
create policy "Anyone can read brands" on public.brands for select using (true);
create policy "Admins can insert brands" on public.brands for insert with check (auth.jwt() ->> 'role' = 'admin');
create policy "Admins can update brands" on public.brands for update using (auth.jwt() ->> 'role' = 'admin');

-- 3. Ingredients Library
create table if not exists public.ingredients (
    id uuid default gen_random_uuid() primary key,
    inci_name text not null unique,
    common_names text[] default '{}'::text[],
    slug text not null unique,
    function text,
    description text,
    concern_level text check (concern_level in ('low', 'medium', 'high', 'restricted', 'gap', 'beneficial', 'claim')),
    why_used text,
    why_matters text,
    regulatory_note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ingredients enable row level security;
create policy "Anyone can read ingredients" on public.ingredients for select using (true);
create policy "Admins can manage ingredients" on public.ingredients for all using (auth.jwt() ->> 'role' = 'admin');

-- 4. Products
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    brand_id uuid references public.brands(id) on delete cascade,
    brand_name text not null,
    product_name text not null,
    slug text not null unique,
    category text not null,
    subcategory text,
    size text,
    mrp numeric,
    price_min numeric,
    price_max numeric,
    price_per_ml numeric,
    product_image_url text,
    ingredient_list text not null,
    claims text[] default '{}'::text[],
    directions text,
    warnings text,
    status text default 'Public Data Review' check (status in ('Certified Product', 'Verified Scorecard', 'Public Data Review', 'User Submitted', 'Awaiting Evidence')),
    analysis_confidence text default 'High',
    is_published boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;
create policy "Anyone can read published products" on public.products for select using (is_published = true or (auth.jwt() ->> 'role' = 'admin'));
create policy "Admins can manage products" on public.products for all using (auth.jwt() ->> 'role' = 'admin');

-- 5. Product Retailer Links
create table if not exists public.product_retailer_links (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade,
    retailer_name text not null, -- Amazon, Nykaa, Tira, Myntra, Brand Website, etc.
    url text not null,
    is_active boolean default true,
    last_checked timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.product_retailer_links enable row level security;
create policy "Anyone can view active retailer links" on public.product_retailer_links for select using (is_active = true);
create policy "Admins can manage retailer links" on public.product_retailer_links for all using (auth.jwt() ->> 'role' = 'admin');

-- 6. Product Ingredients (Link Table)
create table if not exists public.product_ingredients (
    product_id uuid references public.products(id) on delete cascade,
    ingredient_id uuid references public.ingredients(id) on delete cascade,
    ingredient_order integer,
    primary key (product_id, ingredient_id)
);

alter table public.product_ingredients enable row level security;
create policy "Anyone can read product ingredients" on public.product_ingredients for select using (true);
create policy "Admins can manage product ingredients" on public.product_ingredients for all using (auth.jwt() ->> 'role' = 'admin');

-- 7. Product Scores & 4 Pillars
create table if not exists public.product_scores (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade unique,
    total_score integer not null check (total_score >= 0 and total_score <= 100),
    safety_score integer not null check (safety_score >= 0 and safety_score <= 50),
    formulation_score integer not null check (formulation_score >= 0 and formulation_score <= 20),
    claims_score integer not null check (claims_score >= 0 and claims_score <= 20),
    ethics_score integer not null check (ethics_score >= 0 and ethics_score <= 10),
    verdict text,
    best_for text[] default '{}'::text[],
    avoid_if text[] default '{}'::text[],
    expert_summary text,
    score_breakdown_json jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.product_scores enable row level security;
create policy "Anyone can read scores" on public.product_scores for select using (true);
create policy "Admins can manage scores" on public.product_scores for all using (auth.jwt() ->> 'role' = 'admin');

-- 8. Product Claims Audit
create table if not exists public.product_claims_audit (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade,
    claim text not null,
    status text check (status in ('Supported by available data', 'Plausible but not verified', 'Not verifiable from label', 'Potentially misleading', 'Requires lab test', 'Requires clinical evidence', 'Contradicted by ingredient list')),
    reason text,
    evidence_needed text
);

alter table public.product_claims_audit enable row level security;
create policy "Anyone can read claims audit" on public.product_claims_audit for select using (true);
create policy "Admins can manage claims audit" on public.product_claims_audit for all using (auth.jwt() ->> 'role' = 'admin');

-- 9. Saved Products
create table if not exists public.saved_products (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    product_id uuid references public.products(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, product_id)
);

alter table public.saved_products enable row level security;
create policy "Users can view their own saved products" on public.saved_products for select using (auth.uid() = user_id);
create policy "Users can manage their saved products" on public.saved_products for all using (auth.uid() = user_id);

-- 10. Reviews
create table if not exists public.product_reviews (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade,
    user_id uuid references auth.users(id) on delete set null,
    rating integer not null check (rating >= 1 and rating <= 5),
    skin_type text,
    duration_used text,
    bought_from text,
    review_text text,
    would_repurchase boolean,
    is_anonymous boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.product_reviews enable row level security;
create policy "Anyone can read reviews" on public.product_reviews for select using (true);
create policy "Logged in users can write reviews" on public.product_reviews for insert with check (auth.uid() = user_id);
create policy "Admins can manage reviews" on public.product_reviews for all using (auth.jwt() ->> 'role' = 'admin');

-- 11. User Routines
create table if not exists public.routines (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade unique,
    skin_type text,
    concerns text[],
    sensitivity boolean,
    pregnancy_status boolean,
    baby_care_interest boolean,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.routine_steps (
    id uuid default gen_random_uuid() primary key,
    routine_id uuid references public.routines(id) on delete cascade,
    time_of_day text check (time_of_day in ('morning', 'night')),
    step_order integer not null,
    product_id uuid references public.products(id) on delete set null
);

alter table public.routines enable row level security;
alter table public.routine_steps enable row level security;

create policy "Users can view their own routine" on public.routines for select using (auth.uid() = user_id);
create policy "Users can manage their own routine" on public.routines for all using (auth.uid() = user_id);

create policy "Users can view their routine steps" on public.routine_steps for select using (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid())
);
create policy "Users can manage their routine steps" on public.routine_steps for all using (
    exists (select 1 from public.routines r where r.id = routine_id and r.user_id = auth.uid())
);

-- 12. Analysis Logs / Requests
create table if not exists public.analysis_requests (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete set null,
    raw_input text not null,
    source_type text check (source_type in ('url', 'text', 'image')),
    source_url text,
    status text default 'pending', -- pending, completed, failed
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.analysis_results (
    id uuid default gen_random_uuid() primary key,
    request_id uuid references public.analysis_requests(id) on delete cascade,
    extracted_name text,
    extracted_brand text,
    detected_category text,
    normalised_ingredients text[],
    score_json jsonb,
    findings_json jsonb,
    confidence_score numeric,
    admin_approved boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.analysis_requests enable row level security;
alter table public.analysis_results enable row level security;

create policy "Users can view their own requests" on public.analysis_requests for select using (auth.uid() = user_id);
create policy "Users can insert requests" on public.analysis_requests for insert with check (auth.uid() = user_id or auth.uid() is null);

create policy "Users can view their analysis results" on public.analysis_results for select using (
    exists (select 1 from public.analysis_requests r where r.id = request_id and (r.user_id = auth.uid() or r.user_id is null))
);
create policy "Admins can manage analysis results" on public.analysis_results for all using (auth.jwt() ->> 'role' = 'admin');

-- 13. Educational Presets
create table if not exists public.educational_presets (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    score integer not null,
    category text,
    purpose text,
    expected_result text,
    pills text[] default '{}'::text[]
);

alter table public.educational_presets enable row level security;
create policy "Anyone can view presets" on public.educational_presets for select using (true);
