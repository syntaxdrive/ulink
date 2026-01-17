-- Allow owners to delete their communities
CREATE POLICY "Owners can delete their communities" 
ON public.communities FOR DELETE 
USING (
    auth.uid() = created_by OR 
    EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = communities.id 
        AND user_id = auth.uid() 
        AND role = 'owner'
    )
);
