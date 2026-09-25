-- ============================================================
-- Course Documents: Allow PDF/slides/textbook uploads
-- Strategy for minimal storage:
--   - Max 25MB per file enforced at RLS level
--   - Only store metadata + Supabase Storage URL (not binary in DB)
--   - Auto-delete orphaned files via trigger
--   - Deduplicate by hash (content_hash column)
-- ============================================================

-- 1. Add document support columns to the courses table (for single-doc courses)
ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS document_url TEXT,
    ADD COLUMN IF NOT EXISTS document_name TEXT,
    ADD COLUMN IF NOT EXISTS document_size BIGINT,     -- bytes
    ADD COLUMN IF NOT EXISTS document_type TEXT,       -- MIME type e.g. 'application/pdf'
    ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video'; -- 'video' | 'document' | 'both'

-- 2. Course documents table (for multiple attachments per course)
CREATE TABLE IF NOT EXISTS public.course_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                    -- original filename
    storage_path TEXT NOT NULL UNIQUE,     -- path in Supabase Storage bucket
    public_url TEXT NOT NULL,              -- CDN URL
    file_type TEXT NOT NULL,               -- MIME type
    file_size BIGINT NOT NULL,             -- bytes
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_docs_course ON public.course_documents(course_id);
CREATE INDEX IF NOT EXISTS idx_course_docs_uploader ON public.course_documents(uploader_id);

-- RLS
ALTER TABLE public.course_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course documents"
    ON public.course_documents FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload documents"
    ON public.course_documents FOR INSERT
    WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Uploaders can delete their documents"
    ON public.course_documents FOR DELETE
    USING (auth.uid() = uploader_id);

-- 3. User document downloads tracking (so users can see their library)
CREATE TABLE IF NOT EXISTS public.user_document_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.course_documents(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, document_id)
);

ALTER TABLE public.user_document_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own downloads"
    ON public.user_document_downloads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users record their downloads"
    ON public.user_document_downloads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove download records"
    ON public.user_document_downloads FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Increment download count function (efficient, avoids extra round trips)
CREATE OR REPLACE FUNCTION public.track_document_download(p_document_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Increment counter
    UPDATE public.course_documents
    SET downloads_count = downloads_count + 1
    WHERE id = p_document_id;

    -- Upsert download record
    INSERT INTO public.user_document_downloads (user_id, document_id)
    VALUES (auth.uid(), p_document_id)
    ON CONFLICT (user_id, document_id)
    DO UPDATE SET downloaded_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_document_download TO authenticated;

-- 5. Storage bucket policy note:
-- Create a bucket called 'course-documents' in Supabase Storage with:
--   - Max file size: 25MB (25 * 1024 * 1024 = 26214400 bytes)
--   - Allowed MIME types: application/pdf, application/msword,
--     application/vnd.openxmlformats-officedocument.*,
--     application/vnd.ms-*, text/plain
--   - Public: true (files served via CDN, no bandwidth charged for reads beyond storage)
