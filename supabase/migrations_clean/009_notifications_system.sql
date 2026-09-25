-- Migration 009: Notifications & Certificates System
-- Description: Push notifications, user reports, certificates, and resume reviews
-- Dependencies: 001_foundation_profiles_auth.sql
-- Generated: 2026-02-17

--------------------------------------------------------------------------------
-- 1. NOTIFICATIONS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN (
        'like',
        'comment',
        'follow',
        'connection_request',
        'connection_accepted',
        'message',
        'mention',
        'job_application',
        'community_invite',
        'course_update',
        'admin_announcement'
    )) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    action_url TEXT,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true); -- Allowed by triggers/functions

-- Indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_sender_id_idx ON public.notifications(sender_id);

--------------------------------------------------------------------------------
-- 2. REPORTS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    reported_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    reported_job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    report_type TEXT CHECK (report_type IN (
        'spam',
        'harassment',
        'hate_speech',
        'violence',
        'nudity',
        'false_information',
        'scam',
        'other'
    )) NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN (
        'pending',
        'under_review',
        'resolved',
        'dismissed'
    )) DEFAULT 'pending' NOT NULL,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure at least one reported entity is set
    CONSTRAINT at_least_one_reported_entity CHECK (
        reported_user_id IS NOT NULL OR 
        reported_post_id IS NOT NULL OR 
        reported_comment_id IS NOT NULL OR 
        reported_job_id IS NOT NULL
    )
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports"
    ON public.reports FOR SELECT
    USING (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
    ON public.reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can update reports"
    ON public.reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS reports_reporter_id_idx ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS reports_reported_user_id_idx ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS reports_reported_post_id_idx ON public.reports(reported_post_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports(created_at DESC);

--------------------------------------------------------------------------------
-- 3. CERTIFICATES TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    certificate_url TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Unique certificate per user per course
    UNIQUE (user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Certificates are viewable by everyone"
    ON public.certificates FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own certificates"
    ON public.certificates FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Only admins/instructors can issue certificates"
    ON public.certificates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
                AND profiles.is_admin = TRUE
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_course_id_idx ON public.certificates(course_id);

--------------------------------------------------------------------------------
-- 4. RESUME REVIEWS TABLE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.resume_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    resume_url TEXT NOT NULL,
    ai_feedback JSONB DEFAULT '{}'::jsonb, -- Structured AI feedback
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    status TEXT CHECK (status IN (
        'pending',
        'processing',
        'completed',
        'failed'
    )) DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.resume_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own resume reviews"
    ON public.resume_reviews FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create resume review requests"
    ON public.resume_reviews FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update resume reviews"
    ON public.resume_reviews FOR UPDATE
    USING (true); -- Allow backend to update AI results

-- Indexes
CREATE INDEX IF NOT EXISTS resume_reviews_user_id_idx ON public.resume_reviews(user_id);
CREATE INDEX IF NOT EXISTS resume_reviews_status_idx ON public.resume_reviews(status);
CREATE INDEX IF NOT EXISTS resume_reviews_created_at_idx ON public.resume_reviews(created_at DESC);

--------------------------------------------------------------------------------
-- 5. NOTIFICATION HELPER FUNCTION
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'::jsonb,
    p_action_url TEXT DEFAULT NULL,
    p_sender_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message, data, action_url, sender_id)
    VALUES (p_user_id, p_type, p_title, p_message, p_data, p_action_url, p_sender_id)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

--------------------------------------------------------------------------------
-- 6. NOTIFICATION TRIGGERS (Enable triggers from previous migrations)
--------------------------------------------------------------------------------

-- Trigger: Notify job creator when someone applies
CREATE OR REPLACE FUNCTION public.trigger_notify_job_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    job_creator_id UUID;
    applicant_name TEXT;
    job_title TEXT;
BEGIN
    -- Get job creator and details
    SELECT j.posted_by, j.title INTO job_creator_id, job_title
    FROM public.jobs j
    WHERE j.id = NEW.job_id;
    
    -- Get applicant name
    SELECT name INTO applicant_name
    FROM public.profiles
    WHERE id = NEW.applicant_id;
    
    -- Create notification
    PERFORM public.create_notification(
        job_creator_id,
        'job_application',
        'New Job Application',
        applicant_name || ' applied for your job posting: ' || job_title,
        jsonb_build_object('job_id', NEW.job_id, 'application_id', NEW.id),
        '/jobs/' || NEW.job_id || '/applications',
        NEW.applicant_id
    );
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_job_application ON public.job_applications;
CREATE TRIGGER notify_on_job_application
    AFTER INSERT ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_notify_job_application();

-- Trigger: Notify when someone follows you
CREATE OR REPLACE FUNCTION public.trigger_notify_new_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    follower_name TEXT;
BEGIN
    -- Get follower's name
    SELECT name INTO follower_name
    FROM public.profiles
    WHERE id = NEW.follower_id;
    
    -- Create notification
    PERFORM public.create_notification(
        NEW.following_id,
        'follow',
        'New Follower',
        follower_name || ' started following you',
        jsonb_build_object('follower_id', NEW.follower_id),
        '/profile/' || NEW.follower_id,
        NEW.follower_id
    );
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_new_follow ON public.follows;
CREATE TRIGGER notify_on_new_follow
    AFTER INSERT ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_notify_new_follow();

-- Trigger: Notify when connection request is received
CREATE OR REPLACE FUNCTION public.trigger_notify_connection_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    requester_name TEXT;
BEGIN
    IF NEW.status = 'pending' THEN
        -- Get requester's name
        SELECT name INTO requester_name
        FROM public.profiles
        WHERE id = NEW.requester_id;
        
        -- Create notification
        PERFORM public.create_notification(
            NEW.recipient_id,
            'connection_request',
            'Connection Request',
            requester_name || ' wants to connect with you',
            jsonb_build_object('connection_id', NEW.id, 'requester_id', NEW.requester_id),
            '/network',
            NEW.requester_id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_connection_request ON public.connections;
CREATE TRIGGER notify_on_connection_request
    AFTER INSERT ON public.connections
    FOR EACH ROW
    WHEN (NEW.status = 'pending')
    EXECUTE FUNCTION public.trigger_notify_connection_request();

-- Trigger: Notify when connection request is accepted
CREATE OR REPLACE FUNCTION public.trigger_notify_connection_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    recipient_name TEXT;
BEGIN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        -- Get recipient's name
        SELECT name INTO recipient_name
        FROM public.profiles
        WHERE id = NEW.recipient_id;
        
        -- Notify the original requester
        PERFORM public.create_notification(
            NEW.requester_id,
            'connection_accepted',
            'Connection Accepted',
            recipient_name || ' accepted your connection request',
            jsonb_build_object('connection_id', NEW.id, 'user_id', NEW.recipient_id),
            '/profile/' || NEW.recipient_id,
            NEW.recipient_id
        );
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_connection_accepted ON public.connections;
CREATE TRIGGER notify_on_connection_accepted
    AFTER UPDATE ON public.connections
    FOR EACH ROW
    WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
    EXECUTE FUNCTION public.trigger_notify_connection_accepted();

-- Trigger: Notify post author when someone likes their post
CREATE OR REPLACE FUNCTION public.trigger_notify_post_liked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_author_id UUID;
    liker_name TEXT;
BEGIN
    -- Get post author
    SELECT author_id INTO post_author_id
    FROM public.posts
    WHERE id = NEW.post_id;
    
    -- Don't notify if user liked their own post
    IF post_author_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Get liker's name
    SELECT name INTO liker_name
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Create notification
    PERFORM public.create_notification(
        post_author_id,
        'like',
        'New Like',
        liker_name || ' liked your post',
        jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.user_id),
        '/posts/' || NEW.post_id,
        NEW.user_id
    );
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_post_liked ON public.likes;
CREATE TRIGGER notify_on_post_liked
    AFTER INSERT ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_notify_post_liked();

-- Trigger: Notify post author when someone comments
CREATE OR REPLACE FUNCTION public.trigger_notify_post_commented()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_author_id UUID;
    commenter_name TEXT;
BEGIN
    -- Get post author
    SELECT author_id INTO post_author_id
    FROM public.posts
    WHERE id = NEW.post_id;
    
    -- Don't notify if user commented on their own post
    IF post_author_id = NEW.author_id THEN
        RETURN NEW;
    END IF;
    
    -- Get commenter's name
    SELECT name INTO commenter_name
    FROM public.profiles
    WHERE id = NEW.author_id;
    
    -- Create notification
    PERFORM public.create_notification(
        post_author_id,
        'comment',
        'New Comment',
        commenter_name || ' commented on your post',
        jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id),
        '/posts/' || NEW.post_id,
        NEW.author_id
    );
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_post_commented ON public.comments;
CREATE TRIGGER notify_on_post_commented
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_notify_post_commented();

--------------------------------------------------------------------------------
-- MIGRATION COMPLETE
--------------------------------------------------------------------------------

DO $$
BEGIN
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'notifications'
    ), 'notifications table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'reports'
    ), 'reports table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'certificates'
    ), 'certificates table was not created';
    
    ASSERT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'resume_reviews'
    ), 'resume_reviews table was not created';
    
    RAISE NOTICE 'Migration 009 completed successfully';
END $$;
