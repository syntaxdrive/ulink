-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" 
ON comments 
FOR DELETE 
USING (auth.uid() = author_id);
