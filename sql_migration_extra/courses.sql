-- Fully-Provisioned Migration for public.courses
BEGIN;
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    university TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

DO $$ 
BEGIN
    INSERT INTO public.courses (code, name, university, description, created_at) VALUES ('878ec12a-4bd0-44d3-8cae-c4d521308477', 'Eco204 Basic Mathematics for Economics ', 'School', NULL, '2026-03-15 21:09:06.65506+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.courses (code, name, university, description, created_at) VALUES ('be6599b5-f457-4b62-85a3-fb26cdba11fa', 'Indifference curves - income and substitution effects of Price change', 'School', 'This will give you the fundamental understanding of the income and substitution effects of changes in price of a commodity ', '2026-04-01 10:13:44.258398+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
DO $$ 
BEGIN
    INSERT INTO public.courses (code, name, university, description, created_at) VALUES ('eadf2cf6-0043-42a5-a0af-2fb2526922d5', 'Intro to game theory ', 'School', NULL, '2026-03-28 16:57:03.51863+00') ON CONFLICT DO NOTHING;
EXCEPTION WHEN foreign_key_violation THEN
    NULL;
END $$;
COMMIT;