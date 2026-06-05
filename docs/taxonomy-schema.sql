-- The Clean Sheet - Controlled Taxonomy Database Schema
-- Reference schema for future backend implementation.
-- Current implementation uses TypeScript data files (src/data/taxonomy/).

-- ── taxonomy_items ────────────────────────────────────────────────────────────

CREATE TABLE taxonomy_items (
  id               TEXT PRIMARY KEY,          -- Stable ID e.g. cat_face_cleansers, ai_niacinamide
  family           TEXT NOT NULL,             -- product_category | product_type | active_ingredient | concern | suitability | caution | certification_status | evidence_status | prism_module | skin_type | hair_type | format | price_segment | availability_source
  parent_id        TEXT REFERENCES taxonomy_items(id) ON DELETE SET NULL,
  label            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT DEFAULT '',
  synonyms         TEXT[] DEFAULT '{}',       -- Consumer-language alternate terms for search
  display_order    INTEGER DEFAULT 0,
  is_filterable    BOOLEAN DEFAULT TRUE,      -- Show in filter panel
  is_searchable    BOOLEAN DEFAULT TRUE,      -- Include in search synonym index
  is_public        BOOLEAN DEFAULT TRUE,      -- Show on consumer-facing UI
  is_admin_only    BOOLEAN DEFAULT FALSE,     -- Hide from consumers, show only in admin
  status           TEXT DEFAULT 'active'      -- active | draft | deprecated
    CHECK (status IN ('active', 'draft', 'deprecated')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_taxonomy_family     ON taxonomy_items (family);
CREATE INDEX idx_taxonomy_parent     ON taxonomy_items (parent_id);
CREATE INDEX idx_taxonomy_status     ON taxonomy_items (status);
CREATE INDEX idx_taxonomy_filterable ON taxonomy_items (is_filterable) WHERE is_filterable = TRUE;
CREATE INDEX idx_taxonomy_slug       ON taxonomy_items (slug);

-- ── product_taxonomy_map ──────────────────────────────────────────────────────

CREATE TABLE product_taxonomy_map (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         TEXT NOT NULL,           -- References products table
  taxonomy_item_id   TEXT NOT NULL REFERENCES taxonomy_items(id) ON DELETE RESTRICT,
  relationship_type  TEXT NOT NULL            -- primary_category | primary_product_type | active_ingredient | concern | suitability | caution | certification_status | evidence_status | prism_module | skin_type | hair_type | format | price_segment | availability_source
    CHECK (relationship_type IN (
      'primary_category', 'primary_product_type',
      'active_ingredient', 'concern', 'suitability', 'caution',
      'certification_status', 'evidence_status', 'prism_module',
      'skin_type', 'hair_type', 'format', 'price_segment', 'availability_source'
    )),
  source             TEXT DEFAULT 'manual'    -- manual | auto | inference
    CHECK (source IN ('manual', 'auto', 'inference')),
  confidence         INTEGER DEFAULT 100      -- 0-100, manual=100
    CHECK (confidence BETWEEN 0 AND 100),
  is_primary         BOOLEAN DEFAULT FALSE,   -- True for the single primary_category and primary_product_type
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW(),

  -- Each product can have only one primary category and one primary product type
  UNIQUE NULLS NOT DISTINCT (product_id, taxonomy_item_id, relationship_type)
);

-- Enforce single primary category per product
CREATE UNIQUE INDEX idx_one_primary_category
  ON product_taxonomy_map (product_id)
  WHERE relationship_type = 'primary_category' AND is_primary = TRUE;

-- Enforce single primary product type per product
CREATE UNIQUE INDEX idx_one_primary_type
  ON product_taxonomy_map (product_id)
  WHERE relationship_type = 'primary_product_type' AND is_primary = TRUE;

CREATE INDEX idx_ptmap_product    ON product_taxonomy_map (product_id);
CREATE INDEX idx_ptmap_taxonomy   ON product_taxonomy_map (taxonomy_item_id);
CREATE INDEX idx_ptmap_reltype    ON product_taxonomy_map (relationship_type);

-- ── taxonomy_admin_events ─────────────────────────────────────────────────────

CREATE TABLE taxonomy_admin_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action            TEXT NOT NULL              -- approve | reject | deprecate | merge | add_synonym | reorder | toggle_public
    CHECK (action IN ('approve', 'reject', 'deprecate', 'merge', 'add_synonym', 'reorder', 'toggle_public')),
  taxonomy_item_id  TEXT NOT NULL REFERENCES taxonomy_items(id),
  metadata          JSONB DEFAULT '{}',        -- e.g. { "merged_into": "ai_niacinamide", "old_display_order": 3 }
  performed_by      TEXT NOT NULL,             -- User ID or email
  performed_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_events_item ON taxonomy_admin_events (taxonomy_item_id);
CREATE INDEX idx_admin_events_time ON taxonomy_admin_events (performed_at DESC);

-- ── Helper views ──────────────────────────────────────────────────────────────

-- Public filterable taxonomy for UI
CREATE VIEW v_public_filterable_taxonomy AS
SELECT id, family, parent_id, label, slug, synonyms, display_order, description
FROM taxonomy_items
WHERE status = 'active'
  AND is_public = TRUE
  AND is_filterable = TRUE
  AND is_admin_only = FALSE
ORDER BY family, display_order;

-- Product category tree (categories with their child types)
CREATE VIEW v_product_type_tree AS
SELECT
  c.id        AS category_id,
  c.label     AS category_label,
  c.slug      AS category_slug,
  t.id        AS type_id,
  t.label     AS type_label,
  t.slug      AS type_slug,
  t.display_order
FROM taxonomy_items c
JOIN taxonomy_items t ON t.parent_id = c.id AND t.family = 'product_type'
WHERE c.family = 'product_category'
  AND c.status = 'active'
  AND t.status = 'active'
ORDER BY c.display_order, t.display_order;

-- Active ingredients with their group context
CREATE VIEW v_active_ingredients AS
SELECT
  g.label  AS group_label,
  a.id,
  a.label,
  a.slug,
  a.synonyms,
  a.display_order
FROM taxonomy_items a
JOIN taxonomy_items g ON a.parent_id = g.id
WHERE a.family = 'active_ingredient'
  AND a.is_filterable = TRUE
  AND a.status = 'active'
  AND g.status = 'active'
ORDER BY g.display_order, a.display_order;

-- ── Validation function ───────────────────────────────────────────────────────

-- Validate a product before insert/update
CREATE OR REPLACE FUNCTION validate_product_taxonomy(p_product_id TEXT)
RETURNS TABLE (severity TEXT, message TEXT) AS $$
BEGIN
  -- Check primary category exists
  IF NOT EXISTS (
    SELECT 1 FROM product_taxonomy_map
    WHERE product_id = p_product_id
      AND relationship_type = 'primary_category'
      AND is_primary = TRUE
  ) THEN
    RETURN QUERY SELECT 'error'::TEXT, 'Product is missing a primary category.'::TEXT;
  END IF;

  -- Check primary product type exists
  IF NOT EXISTS (
    SELECT 1 FROM product_taxonomy_map
    WHERE product_id = p_product_id
      AND relationship_type = 'primary_product_type'
      AND is_primary = TRUE
  ) THEN
    RETURN QUERY SELECT 'error'::TEXT, 'Product is missing a primary product type.'::TEXT;
  END IF;

  -- Check product type belongs to declared category
  IF NOT EXISTS (
    SELECT 1
    FROM product_taxonomy_map ptm_cat
    JOIN taxonomy_items cat ON ptm_cat.taxonomy_item_id = cat.id
    JOIN product_taxonomy_map ptm_type ON ptm_type.product_id = ptm_cat.product_id
    JOIN taxonomy_items typ ON ptm_type.taxonomy_item_id = typ.id
    WHERE ptm_cat.product_id = p_product_id
      AND ptm_cat.relationship_type = 'primary_category'
      AND ptm_type.relationship_type = 'primary_product_type'
      AND typ.parent_id = cat.id
  ) THEN
    RETURN QUERY SELECT 'error'::TEXT, 'Product type does not belong to the declared product category.'::TEXT;
  END IF;

END;
$$ LANGUAGE plpgsql;
