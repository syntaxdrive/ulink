-- ============================================================
-- DELETE SEED USERS, POSTS, COMMENTS, LIKES, AND CONNECTIONS
-- Version: COMPREHENSIVE (Schema verified from supabase/migrations_clean/)
-- Targets: Both @gmail.com and @student.*.edu.ng variations
-- ============================================================

DO $$
DECLARE
    seed_emails text[] := ARRAY[
        -- Original @gmail.com variations
        'chidiokonkwo@gmail.com', 'amaraeze@gmail.com', 'tundeadeyemi@gmail.com',
        'ngoziobi@gmail.com', 'emekanwosu@gmail.com', 'fatimabello@gmail.com',
        'davidosei@gmail.com', 'blessingpeter@gmail.com', 'ibrahimmusa@gmail.com',
        'adaezenwofor@gmail.com', 'seunadesanya@gmail.com', 'chisomokeke@gmail.com',
        'unilinkrep@gmail.com',
        -- New @student.edu.ng variations
        'chisom.okeke@student.abia.edu.ng',
        'emeka.nwosu@student.uniport.edu.ng',
        'ngozi.obi@student.futa.edu.ng',
        'seun.adesanya@student.lasu.edu.ng',
        'blessing.peter@student.delsu.edu.ng',
        'david.osei@student.unilag.edu.ng',
        'tunde.adeyemi@student.ui.edu.ng',
        'fatima.bello@student.abu.edu.ng',
        'chidi.okonkwo@student.unilag.edu.ng',
        'ibrahim.musa@student.buk.edu.ng',
        'amara.eze@student.unn.edu.ng',
        'amara.eze@student.unn.edu'
    ];
    seed_ids uuid[];
BEGIN

-- 1. Gather all their UUIDs from profiles table
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

    -- 3. Delete Learning Engagement
    DELETE FROM public.course_likes WHERE user_id = ANY(seed_ids);
    DELETE FROM public.course_comments WHERE author_id = ANY(seed_ids);
    DELETE FROM public.course_enrollments WHERE user_id = ANY(seed_ids);
    DELETE FROM public.certificates WHERE user_id = ANY(seed_ids);

    -- 4. Delete Social Graph (Connections, Follows)
    DELETE FROM public.connections WHERE requester_id = ANY(seed_ids) OR recipient_id = ANY(seed_ids);
    DELETE FROM public.follows WHERE follower_id = ANY(seed_ids) OR following_id = ANY(seed_ids);

    -- 5. Delete Messages & Notifications
    DELETE FROM public.messages WHERE sender_id = ANY(seed_ids) OR recipient_id = ANY(seed_ids);
    DELETE FROM public.notifications WHERE user_id = ANY(seed_ids) OR sender_id = ANY(seed_ids);

    -- 6. Delete Jobs & Applications
    DELETE FROM public.job_applications WHERE user_id = ANY(seed_ids);
    DELETE FROM public.jobs WHERE creator_id = ANY(seed_ids);

    -- 7. Delete Gamification & Admin Data
    DELETE FROM public.points_history WHERE user_id = ANY(seed_ids);
    DELETE FROM public.reports WHERE reporter_id = ANY(seed_ids) OR reported_user_id = ANY(seed_ids);
    DELETE FROM public.resume_reviews WHERE user_id = ANY(seed_ids);
    DELETE FROM public.gold_verified_users WHERE user_id = ANY(seed_ids);

    -- 8. Delete Posts
    DELETE FROM public.posts WHERE author_id = ANY(seed_ids);

    -- 9. Delete completely from Profiles & Auth
    DELETE FROM public.profiles WHERE id = ANY(seed_ids);
    DELETE FROM auth.users WHERE id = ANY(seed_ids) OR email = ANY(seed_emails);
    
    RAISE NOTICE 'Selected seed users (%) and all associated data successfully deleted.', array_length(seed_ids, 1);
ELSE
    -- If no IDs were found in profiles, try deleting directly from auth.users by email
    DELETE FROM auth.users WHERE email = ANY(seed_emails);
    RAISE NOTICE 'No profiles found for these emails, but attempted to remove them from auth.users if they existed.';
END IF;

END $$;
