-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to insert messages if they are the sender
CREATE POLICY "Users can insert their own messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Allow users to read messages they sent or received
CREATE POLICY "Users can view messages they are part of"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Allow users to update their own messages (e.g., read status)
CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own posts
CREATE POLICY "Users can insert their own posts"
ON public.posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Posts are public to read
CREATE POLICY "Posts are viewable by everyone"
ON public.posts
FOR SELECT
USING (true);

-- Allow users to update their own posts
CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
USING (auth.uid() = user_id);
