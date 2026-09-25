-- Function to increment course views atomically
CREATE OR REPLACE FUNCTION increment_course_views(course_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE courses
    SET views_count = views_count + 1
    WHERE id = course_id;
END;
$$;
