-- Migration 007: Learning Platform (Courses)
-- Description: YouTube-based courses with enrollments and engagement
-- Dependencies: 001_foundation_profiles_auth.sql
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. COURSES TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    video_id TEXT NOT NULL, -- Extracted YouTube ID
    category TEXT CHECK (category IN ('School', 'Skill', 'Tech', 'Business', 'Creative', 'Language', 'Health', 'Other')) NOT NULL,
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')) NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    thumbnail_url TEXT,
    duration TEXT,
    tags TEXT[],
    views_count INTEGER DEFAULT 0 NOT NULL,
    enrollments_count INTEGER DEFAULT 0 NOT NULL,
    likes_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone"
    ON public.courses FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can create courses" ON public.courses;
CREATE POLICY "Authenticated users can create courses"
    ON public.courses FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own courses" ON public.courses;
CREATE POLICY "Authors can update their own courses"
    ON public.courses FOR UPDATE
    USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own courses" ON public.courses;
CREATE POLICY "Authors can delete their own courses"
    ON public.courses FOR DELETE
    USING (auth.uid() = author_id);

-- Indexes
CREATE INDEX IF NOT EXISTS courses_author_id_idx ON public.courses(author_id);
CREATE INDEX IF NOT EXISTS courses_category_idx ON public.courses(category);
CREATE INDEX IF NOT EXISTS courses_level_idx ON public.courses(level);
CREATE INDEX IF NOT EXISTS courses_created_at_idx ON public.courses(created_at DESC);
CREATE INDEX IF NOT EXISTS courses_views_count_idx ON public.courses(views_count DESC);

--------------------------------------------------------------------------------
-- 2. COURSE ENROLLMENTS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(course_id, user_id)
);

-- Enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.course_enrollments;
CREATE POLICY "Users can view their own enrollments"
    ON public.course_enrollments FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.course_enrollments;
CREATE POLICY "Users can create their own enrollments"
    ON public.course_enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.course_enrollments;
CREATE POLICY "Users can update their own enrollments"
    ON public.course_enrollments FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own enrollments" ON public.course_enrollments;
CREATE POLICY "Users can delete their own enrollments"
    ON public.course_enrollments FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS course_enrollments_course_id_idx ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS course_enrollments_user_id_idx ON public.course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS course_enrollments_completed_idx ON public.course_enrollments(completed);

--------------------------------------------------------------------------------
-- 3. COURSE LIKES TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(course_id, user_id)
);

-- Enable RLS
ALTER TABLE public.course_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Course likes are viewable by everyone" ON public.course_likes;
CREATE POLICY "Course likes are viewable by everyone"
    ON public.course_likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can like courses" ON public.course_likes;
CREATE POLICY "Users can like courses"
    ON public.course_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike courses" ON public.course_likes;
CREATE POLICY "Users can unlike courses"
    ON public.course_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS course_likes_course_id_idx ON public.course_likes(course_id);
CREATE INDEX IF NOT EXISTS course_likes_user_id_idx ON public.course_likes(user_id);

--------------------------------------------------------------------------------
-- 4. COURSE COMMENTS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.course_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.course_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to allow re-running)
DROP POLICY IF EXISTS "Course comments are viewable by everyone" ON public.course_comments;
CREATE POLICY "Course comments are viewable by everyone"
    ON public.course_comments FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment on courses" ON public.course_comments;
CREATE POLICY "Authenticated users can comment on courses"
    ON public.course_comments FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own comments" ON public.course_comments;
CREATE POLICY "Authors can update their own comments"
    ON public.course_comments FOR UPDATE
    USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their own comments" ON public.course_comments;
CREATE POLICY "Authors can delete their own comments"
    ON public.course_comments FOR DELETE
    USING (auth.uid() = author_id);

-- Indexes
CREATE INDEX IF NOT EXISTS course_comments_course_id_idx ON public.course_comments(course_id);
CREATE INDEX IF NOT EXISTS course_comments_author_id_idx ON public.course_comments(author_id);
CREATE INDEX IF NOT EXISTS course_comments_created_at_idx ON public.course_comments(created_at DESC);

--------------------------------------------------------------------------------
-- 5. COURSE FUNCTIONS
--------------------------------------------------------------------------------

-- Increment course views
CREATE OR REPLACE FUNCTION public.increment_course_views(
    course_id_param UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.courses
    SET views_count = views_count + 1,
        updated_at = NOW()
    WHERE id = course_id_param;
END;
$$;

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'courses'
    ), 'courses table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'course_enrollments'
    ), 'course_enrollments table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'course_likes'
    ), 'course_likes table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'course_comments'
    ), 'course_comments table was not created';
    
    RAISE NOTICE 'Migration 007 completed successfully';
END $$;
