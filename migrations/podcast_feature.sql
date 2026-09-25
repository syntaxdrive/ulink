-- ============================================================
-- Podcast Feature Migration
-- Run this SQL in your Supabase SQL Editor
-- ============================================================
-- Creates: podcasts, podcast_episodes, podcast_follows,
--          podcast_episode_plays tables + all RLS, triggers,
--          and RPC functions.
-- Safe:    Uses IF NOT EXISTS on all tables/indexes.
--          Extends reports table with a nullable column only.
--          Does NOT alter any existing table constraints.
-- ============================================================


-- ============================================================
-- STEP 1: RATE LIMIT FUNCTION
-- Defined first because the podcast_episodes INSERT RLS policy
-- calls it. Max 3 episodes per podcast per day, 10 per week.
-- ============================================================

CREATE OR REPLACE FUNCTION check_episode_rate_limit(p_podcast_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  daily_count  INTEGER;
  weekly_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO daily_count
  FROM podcast_episodes
  WHERE podcast_id = p_podcast_id
    AND created_at > NOW() - INTERVAL '1 day';

  SELECT COUNT(*) INTO weekly_count
  FROM podcast_episodes
  WHERE podcast_id = p_podcast_id
    AND created_at > NOW() - INTERVAL '7 days';

  RETURN daily_count < 3 AND weekly_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- STEP 2: TABLES
-- ============================================================

-- Podcast channels (one per creator, requires admin approval)
CREATE TABLE IF NOT EXISTS podcasts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  description      TEXT,
  category         TEXT        NOT NULL CHECK (category IN (
                     'Technology', 'Business', 'Education', 'Entertainment',
                     'Health', 'Sports', 'News', 'Comedy', 'Arts', 'Other'
                   )),
  cover_url        TEXT,
  status           TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN (
                     'pending', 'approved', 'rejected', 'suspended'
                   )),
  rejection_reason TEXT,
  followers_count  INTEGER     NOT NULL DEFAULT 0,
  episodes_count   INTEGER     NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One channel per creator
CREATE UNIQUE INDEX IF NOT EXISTS podcasts_creator_id_unique ON podcasts(creator_id);
CREATE INDEX        IF NOT EXISTS podcasts_status_idx        ON podcasts(status);
CREATE INDEX        IF NOT EXISTS podcasts_category_idx      ON podcasts(category);
CREATE INDEX        IF NOT EXISTS podcasts_created_at_idx    ON podcasts(created_at DESC);


-- Podcast episodes
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id       UUID        NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  description      TEXT,
  audio_url        TEXT        NOT NULL,
  cover_url        TEXT,
  -- Minimum 2 minutes (120 seconds) — blocks noise/test uploads
  duration_seconds INTEGER     NOT NULL CHECK (duration_seconds >= 120),
  episode_number   INTEGER,
  plays_count      INTEGER     NOT NULL DEFAULT 0,
  is_published     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS podcast_episodes_podcast_id_idx   ON podcast_episodes(podcast_id);
CREATE INDEX IF NOT EXISTS podcast_episodes_created_at_idx   ON podcast_episodes(created_at DESC);
CREATE INDEX IF NOT EXISTS podcast_episodes_is_published_idx ON podcast_episodes(is_published);


-- Podcast follows (users subscribe to a podcast channel)
CREATE TABLE IF NOT EXISTS podcast_follows (
  podcast_id UUID        NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (podcast_id, user_id)
);

CREATE INDEX IF NOT EXISTS podcast_follows_podcast_id_idx ON podcast_follows(podcast_id);
CREATE INDEX IF NOT EXISTS podcast_follows_user_id_idx    ON podcast_follows(user_id);


-- Episode play log (used for analytics and incrementing plays_count)
CREATE TABLE IF NOT EXISTS podcast_episode_plays (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID        NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  user_id    UUID        REFERENCES profiles(id) ON DELETE SET NULL, -- nullable: anonymous plays
  played_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS podcast_episode_plays_episode_id_idx ON podcast_episode_plays(episode_id);
CREATE INDEX IF NOT EXISTS podcast_episode_plays_user_id_idx    ON podcast_episode_plays(user_id);


-- ============================================================
-- STEP 3: EXTEND REPORTS TABLE
-- Adds a nullable foreign key so episodes can be reported
-- through the existing moderation system. Safe: nullable,
-- no existing columns or constraints are changed.
-- ============================================================

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS reported_episode_id UUID
    REFERENCES podcast_episodes(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS reports_reported_episode_id_idx ON reports(reported_episode_id);


-- ============================================================
-- STEP 4: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE podcasts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_follows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episode_plays ENABLE ROW LEVEL SECURITY;


-- ── podcasts ──────────────────────────────────────────────

-- Anyone can read approved podcasts.
-- Creators can always read their own (e.g. to see pending/rejected status).
-- Admins can read all.
DROP POLICY IF EXISTS "podcasts_select" ON podcasts;
CREATE POLICY "podcasts_select" ON podcasts
  FOR SELECT USING (
    status = 'approved'
    OR creator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Authenticated users can submit a podcast application.
-- Requires ≥ 100 points (filters brand-new / inactive accounts).
-- The unique index on creator_id enforces one channel per user.
DROP POLICY IF EXISTS "podcasts_insert" ON podcasts;
CREATE POLICY "podcasts_insert" ON podcasts
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id
    AND (SELECT points FROM profiles WHERE id = auth.uid()) >= 100
  );

-- Creators can edit their own podcast's metadata (not status — protected by trigger).
-- Admins can edit anything (needed to approve / reject / suspend).
DROP POLICY IF EXISTS "podcasts_update" ON podcasts;
CREATE POLICY "podcasts_update" ON podcasts
  FOR UPDATE USING (
    auth.uid() = creator_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Creators or admins can delete a podcast channel.
DROP POLICY IF EXISTS "podcasts_delete" ON podcasts;
CREATE POLICY "podcasts_delete" ON podcasts
  FOR DELETE USING (
    auth.uid() = creator_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- ── podcast_episodes ──────────────────────────────────────

-- Public can see published episodes of approved podcasts.
-- Creators can see all their own episodes regardless of published state.
-- Admins can see everything.
DROP POLICY IF EXISTS "podcast_episodes_select" ON podcast_episodes;
CREATE POLICY "podcast_episodes_select" ON podcast_episodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM podcasts p
      WHERE p.id = podcast_id
        AND p.status = 'approved'
        AND is_published = TRUE
    )
    OR EXISTS (
      SELECT 1 FROM podcasts p
      WHERE p.id = podcast_id AND p.creator_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Only the creator of an *approved* podcast can upload episodes.
-- check_episode_rate_limit enforces 3/day and 10/week server-side.
DROP POLICY IF EXISTS "podcast_episodes_insert" ON podcast_episodes;
CREATE POLICY "podcast_episodes_insert" ON podcast_episodes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcasts p
      WHERE p.id = podcast_id
        AND p.creator_id = auth.uid()
        AND p.status = 'approved'
    )
    AND check_episode_rate_limit(podcast_id)
  );

-- Creators can edit their own episodes. Admins can edit any.
DROP POLICY IF EXISTS "podcast_episodes_update" ON podcast_episodes;
CREATE POLICY "podcast_episodes_update" ON podcast_episodes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM podcasts p
      WHERE p.id = podcast_id AND p.creator_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Creators or admins can delete episodes.
DROP POLICY IF EXISTS "podcast_episodes_delete" ON podcast_episodes;
CREATE POLICY "podcast_episodes_delete" ON podcast_episodes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM podcasts p
      WHERE p.id = podcast_id AND p.creator_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );


-- ── podcast_follows ───────────────────────────────────────

DROP POLICY IF EXISTS "podcast_follows_select" ON podcast_follows;
CREATE POLICY "podcast_follows_select" ON podcast_follows
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "podcast_follows_insert" ON podcast_follows;
CREATE POLICY "podcast_follows_insert" ON podcast_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "podcast_follows_delete" ON podcast_follows;
CREATE POLICY "podcast_follows_delete" ON podcast_follows
  FOR DELETE USING (auth.uid() = user_id);


-- ── podcast_episode_plays ─────────────────────────────────

-- Anyone (including anonymous) can log a play.
DROP POLICY IF EXISTS "podcast_episode_plays_insert" ON podcast_episode_plays;
CREATE POLICY "podcast_episode_plays_insert" ON podcast_episode_plays
  FOR INSERT WITH CHECK (TRUE);

-- Only admins and the podcast creator can read play analytics.
DROP POLICY IF EXISTS "podcast_episode_plays_select" ON podcast_episode_plays;
CREATE POLICY "podcast_episode_plays_select" ON podcast_episode_plays
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    OR EXISTS (
      SELECT 1
      FROM podcast_episodes pe
      JOIN podcasts p ON p.id = pe.podcast_id
      WHERE pe.id = episode_id AND p.creator_id = auth.uid()
    )
  );


-- ============================================================
-- STEP 5: PROTECT PODCAST STATUS
-- Prevents creators from approving their own podcasts.
-- Also auto-updates updated_at on every update.
-- ============================================================

DROP TRIGGER   IF EXISTS protect_podcast_status_trigger ON podcasts;
DROP FUNCTION  IF EXISTS protect_podcast_status();

CREATE OR REPLACE FUNCTION protect_podcast_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Block non-admins from changing the status field
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    ) THEN
      RAISE EXCEPTION 'Only admins can change podcast status';
    END IF;
  END IF;

  -- Auto-maintain updated_at
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_podcast_status_trigger
  BEFORE UPDATE ON podcasts
  FOR EACH ROW
  EXECUTE FUNCTION protect_podcast_status();


-- ============================================================
-- STEP 6: AUTO-MAINTAIN episodes_count ON podcasts
-- ============================================================

DROP TRIGGER   IF EXISTS on_episode_change ON podcast_episodes;
DROP FUNCTION  IF EXISTS update_podcast_episodes_count();

CREATE OR REPLACE FUNCTION update_podcast_episodes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE podcasts
    SET episodes_count = episodes_count + 1
    WHERE id = NEW.podcast_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE podcasts
    SET episodes_count = GREATEST(0, episodes_count - 1)
    WHERE id = OLD.podcast_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_episode_change
  AFTER INSERT OR DELETE ON podcast_episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_podcast_episodes_count();


-- ============================================================
-- STEP 7: AUTO-MAINTAIN followers_count ON podcasts
-- (mirrors the existing on_follow_change trigger pattern)
-- ============================================================

DROP TRIGGER   IF EXISTS on_podcast_follow_change ON podcast_follows;
DROP FUNCTION  IF EXISTS update_podcast_followers_count();

CREATE OR REPLACE FUNCTION update_podcast_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE podcasts
    SET followers_count = followers_count + 1
    WHERE id = NEW.podcast_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE podcasts
    SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.podcast_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_podcast_follow_change
  AFTER INSERT OR DELETE ON podcast_follows
  FOR EACH ROW
  EXECUTE FUNCTION update_podcast_followers_count();


-- ============================================================
-- STEP 8: AUTO-INCREMENT plays_count ON podcast_episodes
-- ============================================================

DROP TRIGGER   IF EXISTS on_episode_play ON podcast_episode_plays;
DROP FUNCTION  IF EXISTS update_episode_plays_count();

CREATE OR REPLACE FUNCTION update_episode_plays_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE podcast_episodes
  SET plays_count = plays_count + 1
  WHERE id = NEW.episode_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_episode_play
  AFTER INSERT ON podcast_episode_plays
  FOR EACH ROW
  EXECUTE FUNCTION update_episode_plays_count();


-- ============================================================
-- STEP 9: NOTIFY CREATOR ON APPROVAL / REJECTION
-- Uses the existing notifications table with type = 'system'
-- (already in the notifications.type CHECK constraint).
-- ============================================================

DROP TRIGGER   IF EXISTS on_podcast_status_change ON podcasts;
DROP FUNCTION  IF EXISTS notify_podcast_status_change();

CREATE OR REPLACE FUNCTION notify_podcast_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when status actually changes to approved or rejected
  IF OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status IN ('approved', 'rejected') THEN

    INSERT INTO notifications (user_id, type, title, message, data, action_url)
    VALUES (
      NEW.creator_id,
      'admin_announcement',
      CASE
        WHEN NEW.status = 'approved' THEN 'Podcast Approved!'
        ELSE 'Podcast Application Update'
      END,
      CASE
        WHEN NEW.status = 'approved'
          THEN 'Your podcast "' || NEW.title || '" has been approved! You can now publish episodes.'
        ELSE
          'Your podcast application "' || NEW.title || '" was not approved. Reason: '
          || COALESCE(NEW.rejection_reason, 'No reason provided.')
      END,
      jsonb_build_object('podcast_id', NEW.id),
      '/app/podcasts/manage'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_podcast_status_change
  AFTER UPDATE ON podcasts
  FOR EACH ROW
  EXECUTE FUNCTION notify_podcast_status_change();


-- ============================================================
-- STEP 10: RPC — increment_episode_plays
-- Called by the frontend when a user presses play.
-- Inserts into podcast_episode_plays which triggers the
-- plays_count increment. Matches the existing pattern used
-- by increment_course_views / increment_sponsored_post_impression.
-- ============================================================

CREATE OR REPLACE FUNCTION increment_episode_plays(p_episode_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO podcast_episode_plays (episode_id, user_id)
  VALUES (p_episode_id, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- SUCCESS
-- ============================================================
SELECT 'Podcast feature migration completed successfully!' AS message;
