-- Check triggers on messages table
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'messages';

-- Check the function definition for the trigger
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_message'; -- Guessing the name, I'll search for it if not found

-- Check RLS policies on notifications table
SELECT * FROM pg_policies WHERE tablename = 'notifications';
