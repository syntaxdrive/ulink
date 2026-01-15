-- Fix Infinite Recursion in RLS Policy
-- The previous policy for 'conversation_participants' was referencing itself recursively.
-- We need to simplify it.

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they are in" ON conversations;

-- 2. Create simplified Non-Recursive Policies

-- Allow users to view conversations if they are a participant (Direct check)
CREATE POLICY "Users can view conversations they are in" ON conversations
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = id 
        AND user_id = auth.uid()
    )
);

-- Allow users to view rows in conversation_participants if they are part of that conversation
-- CRITICAL FIX: Instead of checking conversation_participants again (recursion), 
-- we check if the user is ONE OF the participants in that conversation ID
-- But checking "am I in this conversation" requires querying this same table.
-- The trick is to allow users to see THEMSELVES (user_id = auth.uid()) 
-- AND update the logic for seeing OTHERS.

-- Simple Fix: Users can see all participants for a conversation IF they are also a participant in that conversation.
-- To avoid recursion, we can use a SECURITY DEFINER function or a simpler indexed lookup.
-- But standard pattern is often:
CREATE POLICY "Users can view participants" ON conversation_participants
FOR SELECT USING (
    -- You can see rows where you are the user
    user_id = auth.uid()
    OR
    -- You can see rows for conversations you are part of
    conversation_id IN (
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id = auth.uid()
    )
);

-- Note: The above "IN" clause technically queries the table again, but Postgres is usually smart enough to handle this "semi-join" if structured correctly.
-- If it still errors, we use a different approach. Let's try to break the cycle by relying on the fact that policy evaluation for the subquery shouldn't trigger the policy again if we are careful.
-- actually, the infinite recursion usually happens because "SELECT conversation_id FROM conversation_participants" triggers "Users can view participants" policy again.

-- BEST PRACTICE FIX: BYPASS RLS FOR THE LOOKUP
-- We create a private function that checks membership securely without triggering RLS recursively.

CREATE OR REPLACE FUNCTION is_participant(conv_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM conversation_participants 
    WHERE conversation_id = conv_id 
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER bypasses RLS

-- Now rewrite the policy to use the secure function
DROP POLICY IF EXISTS "Users can view participants" ON conversation_participants;

CREATE POLICY "Users can view participants" ON conversation_participants
FOR SELECT USING (
    is_participant(conversation_id)
);
