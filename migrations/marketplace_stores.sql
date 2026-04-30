-- ============================================================
-- Migration: Marketplace Store Branding
-- Purpose:   Allows sellers to have branded stores with names,
--            banners, and descriptions.
-- ============================================================

-- 1. Add Store fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS store_name TEXT,
ADD COLUMN IF NOT EXISTS store_description TEXT,
ADD COLUMN IF NOT EXISTS store_banner_url TEXT,
ADD COLUMN IF NOT EXISTS store_slug TEXT UNIQUE;

-- 2. Create index for store search
CREATE INDEX IF NOT EXISTS idx_profiles_store_name ON public.profiles(store_name) WHERE store_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_store_slug ON public.profiles(store_slug) WHERE store_slug IS NOT NULL;

-- 3. Function to auto-generate store slug if name is provided but slug is not
CREATE OR REPLACE FUNCTION generate_store_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.store_name IS NOT NULL AND (NEW.store_slug IS NULL OR NEW.store_slug = '') THEN
        NEW.store_slug := lower(regexp_replace(NEW.store_name, '[^a-zA-Z0-9]+', '-', 'g'));
        -- Ensure unique slug by appending ID if needed
        IF EXISTS (SELECT 1 FROM profiles WHERE store_slug = NEW.store_slug AND id != NEW.id) THEN
            NEW.store_slug := NEW.store_slug || '-' || substr(NEW.id::text, 1, 5);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger for slug generation
DROP TRIGGER IF EXISTS trg_generate_store_slug ON public.profiles;
CREATE TRIGGER trg_generate_store_slug
BEFORE INSERT OR UPDATE OF store_name ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION generate_store_slug();

-- 5. Helper function to get marketplace store stats
CREATE OR REPLACE FUNCTION get_store_stats(seller_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    listing_count INT;
    sold_count INT;
    avg_price DECIMAL;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE is_sold = true), AVG(price)
    INTO listing_count, sold_count, avg_price
    FROM marketplace_listings
    WHERE seller_id = seller_uuid;

    RETURN jsonb_build_object(
        'total_listings', listing_count,
        'sold_listings', sold_count,
        'average_price', COALESCE(avg_price, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
