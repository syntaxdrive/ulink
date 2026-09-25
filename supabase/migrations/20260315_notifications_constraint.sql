-- Migration: Fix Notification Type check constraint to allow Podcast/Study Rooms
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
        'like', 
        'comment', 
        'repost', 
        'mention', 
        'message', 
        'follow',
        'connection_request', 
        'connection_accepted', 
        'community_join_request', 
        'community_join_accepted', 
        'job_application', 
        'job_update', 
        'study_invite', 
        'study_document_shared', 
        'study_poll_created', 
        'podcast_episode', 
        'podcast_follow'
    ));
