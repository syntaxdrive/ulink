-- Fully-Provisioned Migration for public.course_documents
BEGIN;
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    university TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.course_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    file_url TEXT,
    file_type TEXT,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DO $$ 
BEGIN
    INSERT INTO public.course_documents (id, course_id, uploader_id, title, file_url, file_type, downloads_count, created_at) VALUES ('ded96abe-f428-436d-a273-417b41fe2f80', '878ec12a-4bd0-44d3-8cae-c4d521308477', '8798340d-7df4-4160-942a-5d222ea427b6', 'Basic Mathematics For Economists- Rosser-1.pdf', 'https://rwtdjpwsxtwfeecseugg.supabase.co/storage/v1/object/public/uploads/course-documents/878ec12a-4bd0-44d3-8cae-c4d521308477/1773608946785-o233r9dd2k8.pdf', 'application/pdf', '4', '2026-03-15 21:09:20.541509+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;