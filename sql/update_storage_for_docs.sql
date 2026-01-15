-- Allow Document types in the uploads bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', -- Images
  'application/pdf', -- PDF
  'application/msword', -- DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- DOCX
  'application/vnd.ms-excel', -- XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', -- XLSX
  'application/vnd.ms-powerpoint', -- PPT
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', -- PPTX
  'text/plain' -- TXT
]
WHERE id = 'uploads';
