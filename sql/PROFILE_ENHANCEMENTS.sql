-- =====================================================
-- PROFILE ENHANCEMENTS - Resume, Certificate PDFs, and Social Links
-- =====================================================

-- Add resume_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- Add certificate_pdf_url column to certificates table
ALTER TABLE certificates 
ADD COLUMN IF NOT EXISTS certificate_pdf_url TEXT;

-- Ensure all social link columns exist (some may already exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_url TEXT;

-- Create storage bucket for resumes if it doesn't exist
-- Run this in Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('resumes', 'resumes', true)
-- ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for certificates if it doesn't exist
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('certificates', 'certificates', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes bucket
-- CREATE POLICY "Users can upload their own resume"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update their own resume"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own resume"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Resumes are publicly accessible"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'resumes');

-- Storage policies for certificates bucket
-- CREATE POLICY "Users can upload their own certificates"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update their own certificates"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own certificates"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Certificates are publicly accessible"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'certificates');

-- Note: Storage bucket creation and policies need to be run separately in Supabase Dashboard
-- The ALTER TABLE commands above can be run directly in the SQL editor
