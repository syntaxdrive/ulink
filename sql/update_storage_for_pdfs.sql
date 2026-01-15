-- Allow PDFs in the uploads bucket
UPDATE storage.buckets
SET allowed_mime_types = array_cat(allowed_mime_types, ARRAY['application/pdf'])
WHERE id = 'uploads' AND NOT ('application/pdf' = ANY(allowed_mime_types));

-- If for some reason the array was null or overwritten, ensure we have the full list
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
WHERE id = 'uploads';
