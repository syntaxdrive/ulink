-- 1. First drop the existing type constraint and recreate it to allow Scholarship
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_type_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_type_check CHECK (type IN ('Internship', 'Entry Level', 'Full Time', 'Scholarship'));

-- 2. Insert specific scholarships from ScholarshipRegion into the jobs table under the unilinkrep@gmail.com user
DO $$ 
DECLARE
    rep_id UUID;
BEGIN
    -- Get the profile ID for unilinkrep@gmail.com
    SELECT id INTO rep_id FROM public.profiles WHERE email = 'unilinkrep@gmail.com' LIMIT 1;
    
    IF rep_id IS NULL THEN
        RAISE EXCEPTION 'unilinkrep@gmail.com user not found in public.profiles';
    END IF;

    -- Before inserting, let's delete any previously mis-cased attempts (scholarship vs Scholarship)
    DELETE FROM public.jobs WHERE creator_id = rep_id AND type IN ('scholarship', 'Scholarship');

    -- Insert opportunities
    INSERT INTO public.jobs (creator_id, title, company, type, description, location, salary_range, application_link, deadline, status)
    VALUES 
        (rep_id, 'Oxford University Undergraduate Scholarships in UK 2026', 'Oxford University', 'Scholarship', 'The Oxford University Undergraduate Scholarships are highly competitive and offer full funding for international students applying for undergraduate studies at the University of Oxford.', 'United Kingdom', 'Full Funding + Living Expenses', 'https://www.scholarshipregion.com/oxford-university-undergraduate-scholarship/', NOW() + interval '65 days', 'active'),
        (rep_id, 'NIPES Comfort Architectural Scholarship For Undergraduates', 'NIPES', 'Scholarship', 'NIPES is offering a ₦1m Award for undergraduate architecture students demonstrating excellence in their studies and projects.', 'Nigeria', '₦1,000,000 Award', 'https://www.scholarshipregion.com/nipes-comfort-architectural-scholarship/', NOW() + interval '25 days', 'active'),
        (rep_id, '2026 Alex Otti Foundation Scholarship', 'Alex Otti Foundation', 'Scholarship', 'The Alex Otti Foundation offers scholarships to indigent but brilliant students to pursue their higher education in any Nigerian tertiary institution.', 'Nigeria', '₦150,000 annually', 'https://www.scholarshipregion.com/alex-otti-foundation-scholarship/', NOW() + interval '40 days', 'active'),
        (rep_id, 'African Future Leader Scholarship at Imperial College London', 'Imperial College London', 'Scholarship', 'Aimed at exceptional African students, this scholarship covers studies at the prestigious Imperial College London to nurture the next generation of leaders.', 'United Kingdom', 'Full Tuition + Stipend', 'https://www.scholarshipregion.com/african-future-leader-scholarship/', NOW() + interval '90 days', 'active'),
        (rep_id, 'France IDEX Masters Scholarship 2026', 'Université Grenoble Alpes', 'Scholarship', 'The IDEX Scholarship is awarded to outstanding international students pursuing a Master''s degree at Université Grenoble Alpes in France.', 'France', '€8,000 per academic year', 'https://www.scholarshipregion.com/france-idex-masters-scholarship/', NOW() + interval '50 days', 'active'),
        (rep_id, 'MTN Foundation Science & Technology Scholarship 2026', 'MTN Foundation', 'Scholarship', 'The MTN Foundation Science and Technology Scholarship (MTNF STS) is open to full-time 3rd-year students studying Science and Technology-related disciplines in Nigerian public tertiary institutions (Universities, Polytechnics, and Colleges of Education).', 'Nigeria', '₦300,000 annually till graduation', 'https://www.mtn.ng/foundation/scholarships/', NOW() + interval '30 days', 'active'),
        (rep_id, 'NNPC/Seplat National Undergraduate Scholarship 2026', 'Seplat Energy', 'Scholarship', 'The SEPLAT JV Scholarship scheme is designed to promote educational development and human capacity building. This program aims to support academically sound but financially disadvantaged Nigerian students.', 'Nigeria', '₦200,000 annually', 'https://seplatenergy.com/', NOW() + interval '45 days', 'active');
        
    RAISE NOTICE 'Successfully inserted 7 scholarships from ScholarshipRegion!';
END $$;
