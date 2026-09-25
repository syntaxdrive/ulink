-- ============================================================
-- DELETE SEED USERS, POSTS, COMMENTS, LIKES, AND CONNECTIONS
-- Version: COMPREHENSIVE (Schema verified from supabase/migrations_clean/)
-- ============================================================

DO $$
DECLARE
    seed_emails text[] := ARRAY[
        'chidiokonkwo@gmail.com', 'amaraeze@gmail.com', 'tundeadeyemi@gmail.com',
        'ngoziobi@gmail.com', 'emekanwosu@gmail.com', 'fatimabello@gmail.com',
        'davidosei@gmail.com', 'blessingpeter@gmail.com', 'ibrahimmusa@gmail.com',
        'adaezenwofor@gmail.com', 'seunadesanya@gmail.com', 'chisomokeke@gmail.com',
        'unilinkrep@gmail.com'
    ];
    seed_ids uuid[];
BEGIN

-- 1. Gather all their UUIDs
SELECT array_agg(id) INTO seed_ids 
FROM public.profiles 
WHERE email = ANY(seed_emails);

IF seed_ids IS NOT NULL THEN
    
    -- 2. Delete Content Engagement (Likes, Comments, Poll Votes)
    DELETE FROM public.likes WHERE user_id = ANY(seed_ids);
    DELETE FROM public.likes WHERE post_id IN (SELECT id FROM public.posts WHERE author_id = ANY(seed_ids));
    
    DELETE FROM public.comments WHERE author_id = ANY(seed_ids);
    DELETE FROM public.comments WHERE post_id IN (SELECT id FROM public.posts WHERE author_id = ANY(seed_ids));
    
    DELETE FROM public.poll_votes WHERE user_id = ANY(seed_ids);

    -- 3. Delete Learning Engagement (Migration 007)
    DELETE FROM public.course_likes WHERE user_id = ANY(seed_ids);
    DELETE FROM public.course_comments WHERE author_id = ANY(seed_ids);
    DELETE FROM public.course_enrollments WHERE user_id = ANY(seed_ids);
    DELETE FROM public.certificates WHERE user_id = ANY(seed_ids); -- (Migration 009)

    -- 4. Delete Social Graph (Connections, Follows)
    DELETE FROM public.connections WHERE requester_id = ANY(seed_ids) OR recipient_id = ANY(seed_ids);
    DELETE FROM public.follows WHERE follower_id = ANY(seed_ids) OR following_id = ANY(seed_ids);

    -- 5. Delete Messages & Notifications
    DELETE FROM public.messages WHERE sender_id = ANY(seed_ids) OR recipient_id = ANY(seed_ids);
    DELETE FROM public.notifications WHERE user_id = ANY(seed_ids) OR sender_id = ANY(seed_ids);

    -- 6. Delete Jobs & Applications (Migration 006)
    DELETE FROM public.job_applications WHERE user_id = ANY(seed_ids);
    DELETE FROM public.jobs WHERE creator_id = ANY(seed_ids);

    -- 7. Delete Gamification & Admin Data (Migration 008, 009, 012)
    DELETE FROM public.points_history WHERE user_id = ANY(seed_ids);
    DELETE FROM public.reports WHERE reporter_id = ANY(seed_ids) OR reported_user_id = ANY(seed_ids);
    DELETE FROM public.resume_reviews WHERE user_id = ANY(seed_ids);
    DELETE FROM public.gold_verified_users WHERE user_id = ANY(seed_ids);

    -- 8. Delete Posts (Migration 004)
    -- must happen after likes/comments/votes are deleted
    DELETE FROM public.posts WHERE author_id = ANY(seed_ids);

    -- 9. Delete completely from Profiles & Auth
    DELETE FROM public.profiles WHERE id = ANY(seed_ids);
    DELETE FROM auth.users WHERE id = ANY(seed_ids);
    
    RAISE NOTICE 'Seed users and all associated data successfully deleted.';
ELSE
    RAISE NOTICE 'No seed users found. They may have already been deleted.';
END IF;

END $$;
