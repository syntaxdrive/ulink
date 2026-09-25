-- ============================================================
-- Course Documents & Supporting Tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. Base courses table (safe if already exists) ───────────────────────────

CREATE TABLE IF NOT EXISTS courses (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title             TEXT NOT NULL,
    description       TEXT,
    youtube_url       TEXT NOT NULL DEFAULT '',
    video_id          TEXT NOT NULL DEFAULT '',
    thumbnail_url     TEXT,
    category          TEXT NOT NULL DEFAULT 'School',
    level             TEXT NOT NULL DEFAULT 'Beginner',
    tags              TEXT[],
    content_type      TEXT NOT NULL DEFAULT 'video',
    views_count       INT NOT NULL DEFAULT 0,
    likes_count       INT NOT NULL DEFAULT 0,
    enrollments_count INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_author   ON courses(author_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_created  ON courses(created_at DESC);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "courses_select" ON courses;
CREATE POLICY "courses_select" ON courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "courses_insert" ON courses;
CREATE POLICY "courses_insert" ON courses FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "courses_update" ON courses;
CREATE POLICY "courses_update" ON courses FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "courses_delete" ON courses;
CREATE POLICY "courses_delete" ON courses FOR DELETE USING (auth.uid() = author_id);

-- ── 2. Add missing columns to courses (safe if already exists) ────────────────

DO $$ BEGIN
    ALTER TABLE courses ADD COLUMN content_type TEXT NOT NULL DEFAULT 'video';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE courses ADD COLUMN views_count INT NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ── 3. Course Likes ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS course_likes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_likes_course ON course_likes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_likes_user   ON course_likes(user_id);

ALTER TABLE course_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "course_likes_select" ON course_likes;
CREATE POLICY "course_likes_select" ON course_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "course_likes_insert" ON course_likes;
CREATE POLICY "course_likes_insert" ON course_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "course_likes_delete" ON course_likes;
CREATE POLICY "course_likes_delete" ON course_likes FOR DELETE USING (auth.uid() = user_id);

-- ── 4. Course Enrollments ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS course_enrollments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id  UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user   ON course_enrollments(user_id);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "course_enrollments_select" ON course_enrollments;
CREATE POLICY "course_enrollments_select" ON course_enrollments FOR SELECT USING (true);
DROP POLICY IF EXISTS "course_enrollments_insert" ON course_enrollments;
CREATE POLICY "course_enrollments_insert" ON course_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "course_enrollments_delete" ON course_enrollments;
CREATE POLICY "course_enrollments_delete" ON course_enrollments FOR DELETE USING (auth.uid() = user_id);

-- ── 5. Course Documents ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS course_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    uploader_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    storage_path    TEXT NOT NULL,
    public_url      TEXT NOT NULL,
    file_type       TEXT NOT NULL,
    file_size       BIGINT NOT NULL DEFAULT 0,
    downloads_count INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_documents_course   ON course_documents(course_id);
CREATE INDEX IF NOT EXISTS idx_course_documents_uploader ON course_documents(uploader_id);

ALTER TABLE course_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "course_documents_select" ON course_documents;
CREATE POLICY "course_documents_select" ON course_documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "course_documents_insert" ON course_documents;
CREATE POLICY "course_documents_insert" ON course_documents FOR INSERT WITH CHECK (auth.uid() = uploader_id);
DROP POLICY IF EXISTS "course_documents_delete" ON course_documents;
CREATE POLICY "course_documents_delete" ON course_documents FOR DELETE USING (auth.uid() = uploader_id);

-- ── 6. User Document Downloads (My Library) ───────────────────────────────────

CREATE TABLE IF NOT EXISTS user_document_downloads (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id   UUID NOT NULL REFERENCES course_documents(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_user_doc_downloads_user ON user_document_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_doc_downloads_doc  ON user_document_downloads(document_id);

ALTER TABLE user_document_downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_doc_downloads_select" ON user_document_downloads;
CREATE POLICY "user_doc_downloads_select" ON user_document_downloads FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_doc_downloads_insert" ON user_document_downloads;
CREATE POLICY "user_doc_downloads_insert" ON user_document_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 7. RPC: track_document_download ──────────────────────────────────────────

DROP FUNCTION IF EXISTS track_document_download(uuid);
CREATE OR REPLACE FUNCTION track_document_download(p_document_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE course_documents
    SET downloads_count = downloads_count + 1
    WHERE id = p_document_id;

    IF auth.uid() IS NOT NULL THEN
        INSERT INTO user_document_downloads (user_id, document_id, downloaded_at)
        VALUES (auth.uid(), p_document_id, NOW())
        ON CONFLICT (user_id, document_id) DO UPDATE
            SET downloaded_at = NOW();
    END IF;
END;
$$;

-- ── 8. RPC: increment_course_views ───────────────────────────────────────────

DROP FUNCTION IF EXISTS increment_course_views(uuid);
CREATE OR REPLACE FUNCTION increment_course_views(course_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE courses SET views_count = views_count + 1 WHERE id = course_id;
END;
$$;

-- ── 9. Triggers: keep likes_count / enrollments_count in sync ─────────────────

CREATE OR REPLACE FUNCTION sync_course_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE courses SET likes_count = likes_count + 1 WHERE id = NEW.course_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE courses SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.course_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_likes_count ON course_likes;
CREATE TRIGGER trg_course_likes_count
    AFTER INSERT OR DELETE ON course_likes
    FOR EACH ROW EXECUTE FUNCTION sync_course_likes_count();

CREATE OR REPLACE FUNCTION sync_course_enrollments_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE courses SET enrollments_count = enrollments_count + 1 WHERE id = NEW.course_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE courses SET enrollments_count = GREATEST(enrollments_count - 1, 0) WHERE id = OLD.course_id;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_enrollments_count ON course_enrollments;
CREATE TRIGGER trg_course_enrollments_count
    AFTER INSERT OR DELETE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION sync_course_enrollments_count();

-- ── 10. Supabase Storage — 'uploads' bucket ───────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'uploads',
    'uploads',
    true,
    26214400,
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm'
    ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "uploads_select" ON storage.objects;
CREATE POLICY "uploads_select" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
DROP POLICY IF EXISTS "uploads_insert" ON storage.objects;
CREATE POLICY "uploads_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "uploads_delete" ON storage.objects;
CREATE POLICY "uploads_delete" ON storage.objects FOR DELETE USING (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);
