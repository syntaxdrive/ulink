-- Inserts additional researched scholarships into the jobs table under the unilinkrep@gmail.com user

DO $$ 
DECLARE
    rep_id UUID;
BEGIN
    -- Get the profile ID for unilinkrep@gmail.com
    SELECT id INTO rep_id FROM public.profiles WHERE email = 'unilinkrep@gmail.com' LIMIT 1;
    
    IF rep_id IS NULL THEN
        RAISE EXCEPTION 'unilinkrep@gmail.com user not found in public.profiles';
    END IF;

    -- Before inserting, let's delete exactly these titles if they accidentally exist already to avoid duplicates
    DELETE FROM public.jobs WHERE creator_id = rep_id AND title IN (
        'PTDF Overseas Scholarship Scheme 2026',
        'GREAT Scholarships (UK) 2026-2027',
        'Chevening Scholarships (UK) Fully Funded',
        'Lester B. Pearson International Scholarship (Canada)',
        'NHEF Scholars Program 2026',
        'Bet9ja Foundation Scholarship for Undergraduates',
        'NLNG Undergraduate Scholarship Scheme (UGSS) 2026'
    );

    -- Insert opportunities
    INSERT INTO public.jobs (creator_id, title, company, type, description, location, salary_range, application_link, deadline, status)
    VALUES 
        (rep_id, 'PTDF Overseas Scholarship Scheme 2026', 'Petroleum Technology Development Fund', 'Scholarship', 'The Petroleum Technology Development Fund (PTDF) offers fully funded MSc and PhD scholarships for studies in oil and gas-related subjects in the UK, Germany, France, and Malaysia for Nigerian citizens.', 'Global (UK, Germany, France, Malaysia)', 'Full Tuition + Flights + Living Allowance', 'https://ptdf.gov.ng/', NOW() + interval '30 days', 'active'),
        
        (rep_id, 'GREAT Scholarships (UK) 2026-2027', 'British Council / UK Universities', 'Scholarship', 'GREAT Scholarships provide £10,000 towards tuition fees for one-year postgraduate courses at various UK universities. Applicants must be Nigerian citizens with an undergraduate degree.', 'United Kingdom', '£10,000 Award', 'https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships', NOW() + interval '80 days', 'active'),
        
        (rep_id, 'Chevening Scholarships (UK) Fully Funded', 'UK Government', 'Scholarship', 'Chevening is the UK government''s international awards programme aimed at developing global leaders. It fully funds a one-year master''s degree in the UK.', 'United Kingdom', 'Full Tuition + Flights + Monthly Stipend', 'https://www.chevening.org/', NOW() + interval '6 months', 'active'),
        
        (rep_id, 'Lester B. Pearson International Scholarship (Canada)', 'University of Toronto', 'Scholarship', 'The Lester B. Pearson International Scholarship at the University of Toronto provides an unparalleled opportunity for outstanding international students to study at one of the world''s best universities.', 'Canada', 'Full Tuition + Books + Incidental Fees + Full Residence', 'https://future.utoronto.ca/pearson/about/', NOW() + interval '90 days', 'active'),
        
        (rep_id, 'NHEF Scholars Program 2026', 'Nigeria Higher Education Foundation', 'Scholarship', 'The NHEF Scholars Program is for penultimate-year students at NHEF Partner Universities. It provides internships, leadership training, mentorship, and extensive networking opportunities.', 'Nigeria', 'Mentorship + Internship Stipends', 'https://www.thenhef.org/', NOW() + interval '45 days', 'active'),
        
        (rep_id, 'Bet9ja Foundation Scholarship for Undergraduates', 'Bet9ja Foundation', 'Scholarship', 'A fully funded opportunity for Nigerian undergraduate students enrolled in public universities for the upcoming academic year to assist with their educational pursuits.', 'Nigeria', 'Fully Funded (Tuition + Grants)', 'https://bet9jafoundation.org/', NOW() + interval '60 days', 'active'),
        
        (rep_id, 'NLNG Undergraduate Scholarship Scheme (UGSS) 2026', 'Nigeria LNG Limited', 'Scholarship', 'The Nigeria LNG Undergraduate Scholarship Scheme aims to promote academic excellence by supporting top-grade students through their tertiary education in Nigeria.', 'Nigeria', 'Annual Cash Award till Graduation', 'https://www.nigerialng.com/', NOW() + interval '50 days', 'active');
        
    RAISE NOTICE 'Successfully inserted 7 additional global and local scholarships!';
END $$;
