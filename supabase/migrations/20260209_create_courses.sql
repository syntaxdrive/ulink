-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    video_id TEXT NOT NULL, -- Extracted YouTube video ID
    category TEXT NOT NULL, -- 'School', 'Skill', 'Tech', 'Business', 'Creative', 'Language', 'Other'
    level TEXT DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    thumbnail_url TEXT, -- YouTube thumbnail
    duration TEXT, -- e.g., '15:30'
    tags TEXT[], -- Array of tags
    views_count INTEGER DEFAULT 0,
    enrollments_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course Enrollments (users who saved/enrolled in a course)
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0, -- Percentage completed (0-100)
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

-- Course Likes
CREATE TABLE IF NOT EXISTS course_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

-- Course Comments
CREATE TABLE IF NOT EXISTS course_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_author ON courses(author_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_likes_user ON course_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_course_likes_course ON course_likes(course_id);

-- RLS Policies

-- Courses: Everyone can read, only authenticated users can create
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
    ON courses FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create courses"
    ON courses FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own courses"
    ON courses FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own courses"
    ON courses FOR DELETE
    USING (auth.uid() = author_id);

-- Course Enrollments
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their enrollments"
    ON course_enrollments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses"
    ON course_enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their enrollments"
    ON course_enrollments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their enrollments"
    ON course_enrollments FOR DELETE
    USING (auth.uid() = user_id);

-- Course Likes
ALTER TABLE course_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
    ON course_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can like courses"
    ON course_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike courses"
    ON course_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Course Comments
ALTER TABLE course_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
    ON course_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can comment"
    ON course_comments FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their comments"
    ON course_comments FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their comments"
    ON course_comments FOR DELETE
    USING (auth.uid() = author_id);
