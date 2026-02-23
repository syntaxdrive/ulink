-- Seed posts for unilinkrep@gmail.com
-- Run in Supabase SQL Editor

-- Step 1: Fix award_points function — column is activity_type not action_type
CREATE OR REPLACE FUNCTION public.award_points(
    p_user_id UUID,
    p_action_type TEXT,
    p_points INTEGER,
    p_reference_id UUID DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.profiles SET points = COALESCE(points, 0) + p_points WHERE id = p_user_id;
    INSERT INTO public.points_history (user_id, activity_type, points_earned, reference_id)
    VALUES (p_user_id, p_action_type, p_points, p_reference_id);
END;
$$;

-- Step 2: Insert posts
DO $$
DECLARE
    v_author_id UUID;
BEGIN
    SELECT id INTO v_author_id FROM public.profiles WHERE email = 'unilinkrep@gmail.com' LIMIT 1;
    
    IF v_author_id IS NULL THEN
        RAISE EXCEPTION 'Account unilinkrep@gmail.com not found in profiles';
    END IF;

    -- Post 1: Welcome / mission
    INSERT INTO public.posts (author_id, content, created_at)
    VALUES (
        v_author_id,
        '🚀 Welcome to UniLink — built for Nigerian students and organizations who are serious about their future.

Whether you''re looking for your first internship, recruiting top talent, or just trying to connect with like-minded people — this is your space.

Drop a comment: what''s the #1 thing you wish existed for students in Nigeria? 👇',
        NOW() - INTERVAL '6 days'
    );

    -- Post 2: Poll-style engagement
    INSERT INTO public.posts (author_id, content, created_at)
    VALUES (
        v_author_id,
        '📊 Quick question for Nigerian students:

What''s your biggest career challenge right now?

A) Finding internships / entry-level roles
B) Building a strong portfolio / CV
C) Networking with the right people
D) Not knowing what career path to take

Comment your letter below 👇 We''re building features based on what YOU need.',
        NOW() - INTERVAL '5 days'
    );

    -- Post 3: Tips / value post
    INSERT INTO public.posts (author_id, content, created_at)
    VALUES (
        v_author_id,
        '5 things that will make your UniLink profile stand out to recruiters:

1️⃣ A proper headshot (not a selfie)
2️⃣ A headline that says what you DO, not just your school
3️⃣ At least 3 projects with links
4️⃣ Skills that match your target role
5️⃣ An "About" section that sounds like a human, not a CV

Which one are you missing? Go update your profile now 👆',
        NOW() - INTERVAL '4 days'
    );

    -- Post 4: Community building
    INSERT INTO public.posts (author_id, content, created_at)
    VALUES (
        v_author_id,
        '🤝 Tag a Nigerian student who deserves more opportunities.

This platform only works if we lift each other. Your tag could be the connection that changes someone''s career.

Go. 👇',
        NOW() - INTERVAL '3 days'
    );

    -- Post 5: Orgs / recruiters
    INSERT INTO public.posts (author_id, content, created_at)
    VALUES (
        v_author_id,
        '📢 Attention organizations and recruiters:

UniLink now lets you post jobs and find verified student profiles across Nigerian universities.

If you''re hiring interns or entry-level talent — this is where they are.

DM us or post your first job listing today. It''s free. ✅',
        NOW() - INTERVAL '2 days'
    );

    -- Post 6: Relatable / conversation starter
    INSERT INTO public.posts (author_id, content, created_at)
    VALUES (
        v_author_id,
        'Unpopular opinion: Nigerian graduates are not unemployable. The system just hasn''t connected them to the right people.

That''s what we''re fixing.

What do you think is the real problem? Let''s have an honest conversation 👇',
        NOW() - INTERVAL '1 day'
    );

    -- Post 7: Fresh / today
    INSERT INTO public.posts (author_id, content, created_at)
    VALUES (
        v_author_id,
        '📣 New week. New connections.

If you joined UniLink this week — introduce yourself below!

Tell us:
🎓 Your school & course
💡 What you''re building / working on
🤝 Who you want to connect with

Let''s make this community actually feel like one. 👇',
        NOW() - INTERVAL '2 hours'
    );

    RAISE NOTICE 'SUCCESS: 7 posts created for unilinkrep@gmail.com (author_id: %)', v_author_id;
END $$;
