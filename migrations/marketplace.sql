-- ============================================================
-- Campus Marketplace
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS marketplace_listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    price           NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    category        TEXT NOT NULL DEFAULT 'Other',
    condition       TEXT NOT NULL DEFAULT 'Good',
    images          TEXT[] DEFAULT '{}',
    is_sold         BOOLEAN NOT NULL DEFAULT FALSE,
    contact_info    TEXT,           -- WhatsApp number (e.g. 08012345678)
    university      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION marketplace_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS marketplace_updated_at ON marketplace_listings;
CREATE TRIGGER marketplace_updated_at
    BEFORE UPDATE ON marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION marketplace_set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_seller    ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_category  ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_is_sold   ON marketplace_listings(is_sold);
CREATE INDEX IF NOT EXISTS idx_marketplace_created   ON marketplace_listings(created_at DESC);

-- Row Level Security
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read active (not sold) listings
CREATE POLICY "marketplace_select" ON marketplace_listings
    FOR SELECT USING (true);

-- Authenticated users can create listings
CREATE POLICY "marketplace_insert" ON marketplace_listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Seller can update/delete their own listing
CREATE POLICY "marketplace_update" ON marketplace_listings
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "marketplace_delete" ON marketplace_listings
    FOR DELETE USING (auth.uid() = seller_id);
