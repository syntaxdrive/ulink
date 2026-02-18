-- =====================================================
-- FIX POINTS HISTORY TABLE
-- =====================================================
-- Add missing columns to points_history table

-- Add points_earned column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'points_history' AND column_name = 'points_earned'
    ) THEN
        ALTER TABLE points_history ADD COLUMN points_earned INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add reference_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'points_history' AND column_name = 'reference_id'
    ) THEN
        ALTER TABLE points_history ADD COLUMN reference_id UUID;
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'points_history'
ORDER BY ordinal_position;
