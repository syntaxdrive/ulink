-- ============================================================
-- Anonymous Campus Confessions / Support Board
-- Run this in Supabase SQL Editor
-- ============================================================

-- Main confessions table (fully anonymous — no user_id stored)
CREATE TABLE IF NOT EXISTS confessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
    category    TEXT NOT NULL DEFAULT 'General',
    university  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confessions_created  ON confessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_category ON confessions(category);

ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- Anyone (even guests) can read confessions
CREATE POLICY "confessions_select" ON confessions
    FOR SELECT USING (true);

-- Anyone authenticated can post (anon stored anonymously)
CREATE POLICY "confessions_insert" ON confessions
    FOR INSERT WITH CHECK (true);

-- Only admins / service role can delete
CREATE POLICY "confessions_delete" ON confessions
    FOR DELETE USING (auth.role() = 'service_role');


-- Reactions — ties user to emoji on a confession (authenticated users only)
CREATE TABLE IF NOT EXISTS confession_reactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confession_id   UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji           TEXT NOT NULL CHECK (emoji IN ('❤️','💪','🙏','😢')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(confession_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_confession_reactions_confession ON confession_reactions(confession_id);

ALTER TABLE confession_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "confession_reactions_select" ON confession_reactions
    FOR SELECT USING (true);

CREATE POLICY "confession_reactions_insert" ON confession_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "confession_reactions_delete" ON confession_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Upsert-style update for reaction change
CREATE POLICY "confession_reactions_update" ON confession_reactions
    FOR UPDATE USING (auth.uid() = user_id);


-- Anonymous replies — no author stored
CREATE TABLE IF NOT EXISTS confession_replies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confession_id   UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
    content         TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 300),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_confession_replies_confession ON confession_replies(confession_id);
CREATE INDEX IF NOT EXISTS idx_confession_replies_created    ON confession_replies(created_at ASC);

ALTER TABLE confession_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "confession_replies_select" ON confession_replies
    FOR SELECT USING (true);

CREATE POLICY "confession_replies_insert" ON confession_replies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "confession_replies_delete" ON confession_replies
    FOR DELETE USING (auth.role() = 'service_role');
