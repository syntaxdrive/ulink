-- Pack 3: Jobs
BEGIN;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('24037e89-3a6d-4734-8fa2-997ebad99b23', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'MTN Foundation Science & Technology Scholarship 2026', 'MTN Foundation', 'Scholarship', 'The MTN Foundation Science and Technology Scholarship (MTNF STS) is open to full-time 3rd-year students studying Science and Technology-related disciplines in Nigerian public tertiary institutions (Universities, Polytechnics, and Colleges of Education).', 'Nigeria', '₦300,000 annually till graduation', 'https://www.mtn.ng/foundation/scholarships/', '2026-03-30', NULL, '2026-02-28 12:25:35.566885+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('3809130a-3a50-4689-8b9d-342adf21b8a4', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'NHEF Scholars Program 2026', 'Nigeria Higher Education Foundation', 'Scholarship', 'The NHEF Scholars Program is for penultimate-year students at NHEF Partner Universities. It provides internships, leadership training, mentorship, and extensive networking opportunities.', 'Nigeria', 'Mentorship + Internship Stipends', 'https://www.thenhef.org/', '2026-04-14', NULL, '2026-02-28 12:47:02.688441+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('7ca3a78a-9031-4bf7-a7ac-704ea8c90ea8', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'GREAT Scholarships (UK) 2026-2027', 'British Council / UK Universities', 'Scholarship', 'GREAT Scholarships provide £10,000 towards tuition fees for one-year postgraduate courses at various UK universities. Applicants must be Nigerian citizens with an undergraduate degree.', 'United Kingdom', '£10,000 Award', 'https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships', '2026-05-19', NULL, '2026-02-28 12:47:02.688441+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('826d2441-a6ec-445c-8924-dd272cb89bf9', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'African Future Leader Scholarship at Imperial College London', 'Imperial College London', 'Scholarship', 'Aimed at exceptional African students, this scholarship covers studies at the prestigious Imperial College London to nurture the next generation of leaders.', 'United Kingdom', 'Full Tuition + Stipend', 'https://www.scholarshipregion.com/african-future-leader-scholarship/', '2026-05-29', NULL, '2026-02-28 12:25:35.566885+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('a35f7375-cfe3-4aef-a4b2-6ed5aee41e6f', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'NLNG Undergraduate Scholarship Scheme (UGSS) 2026', 'Nigeria LNG Limited', 'Scholarship', 'The Nigeria LNG Undergraduate Scholarship Scheme aims to promote academic excellence by supporting top-grade students through their tertiary education in Nigeria.', 'Nigeria', 'Annual Cash Award till Graduation', 'https://www.nigerialng.com/', '2026-04-19', NULL, '2026-02-28 12:47:02.688441+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('a78af7de-d61d-47f7-b8be-307b902cc2b4', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'Oxford University Undergraduate Scholarships in UK 2026', 'Oxford University', 'Scholarship', 'The Oxford University Undergraduate Scholarships are highly competitive and offer full funding for international students applying for undergraduate studies at the University of Oxford.', 'United Kingdom', 'Full Funding + Living Expenses', 'https://www.scholarshipregion.com/oxford-university-undergraduate-scholarship/', '2026-05-04', NULL, '2026-02-28 12:25:35.566885+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('a9af724d-199d-445a-a16c-65461468121f', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'Lester B. Pearson International Scholarship (Canada)', 'University of Toronto', 'Scholarship', 'The Lester B. Pearson International Scholarship at the University of Toronto provides an unparalleled opportunity for outstanding international students to study at one of the world''s best universities.', 'Canada', 'Full Tuition + Books + Incidental Fees + Full Residence', 'https://future.utoronto.ca/pearson/about/', '2026-05-29', NULL, '2026-02-28 12:47:02.688441+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('b25384e4-f1f0-467d-931f-f0285488df97', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'PTDF Overseas Scholarship Scheme 2026', 'Petroleum Technology Development Fund', 'Scholarship', 'The Petroleum Technology Development Fund (PTDF) offers fully funded MSc and PhD scholarships for studies in oil and gas-related subjects in the UK, Germany, France, and Malaysia for Nigerian citizens.', 'Global (UK, Germany, France, Malaysia)', 'Full Tuition + Flights + Living Allowance', 'https://ptdf.gov.ng/', '2026-03-30', NULL, '2026-02-28 12:47:02.688441+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('b28fd0ad-8a26-4402-a246-64ec0199bda3', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'NIPES Comfort Architectural Scholarship For Undergraduates', 'NIPES', 'Scholarship', 'NIPES is offering a ₦1m Award for undergraduate architecture students demonstrating excellence in their studies and projects.', 'Nigeria', '₦1,000,000 Award', 'https://www.scholarshipregion.com/nipes-comfort-architectural-scholarship/', '2026-03-25', NULL, '2026-02-28 12:25:35.566885+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('b596d241-1f46-43f6-843a-0a4467f09358', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'Chevening Scholarships (UK) Fully Funded', 'UK Government', 'Scholarship', 'Chevening is the UK government''s international awards programme aimed at developing global leaders. It fully funds a one-year master''s degree in the UK.', 'United Kingdom', 'Full Tuition + Flights + Monthly Stipend', 'https://www.chevening.org/', '2026-08-28', NULL, '2026-02-28 12:47:02.688441+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('d64e1235-ed73-488d-a718-4b13ff5efbb2', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', '2026 Alex Otti Foundation Scholarship', 'Alex Otti Foundation', 'Scholarship', 'The Alex Otti Foundation offers scholarships to indigent but brilliant students to pursue their higher education in any Nigerian tertiary institution.', 'Nigeria', '₦150,000 annually', 'https://www.scholarshipregion.com/alex-otti-foundation-scholarship/', '2026-04-09', NULL, '2026-02-28 12:25:35.566885+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('e115f3cf-12c1-4fce-9b84-7df869b28440', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'NNPC/Seplat National Undergraduate Scholarship 2026', 'Seplat Energy', 'Scholarship', 'The SEPLAT JV Scholarship scheme is designed to promote educational development and human capacity building. This program aims to support academically sound but financially disadvantaged Nigerian students.', 'Nigeria', '₦200,000 annually', 'https://seplatenergy.com/', '2026-04-14', NULL, '2026-02-28 12:25:35.566885+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('f9256668-d2bf-4ef8-9681-e47c08adfe61', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'Bet9ja Foundation Scholarship for Undergraduates', 'Bet9ja Foundation', 'Scholarship', 'A fully funded opportunity for Nigerian undergraduate students enrolled in public universities for the upcoming academic year to assist with their educational pursuits.', 'Nigeria', 'Fully Funded (Tuition + Grants)', 'https://bet9jafoundation.org/', '2026-04-29', NULL, '2026-02-28 12:47:02.688441+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.jobs (id, creator_id, title, company, type, description, location, salary_range, application_link, deadline, logo_url, created_at)
VALUES ('fcf04574-5685-42af-a1b3-ef0d0a058ae3', '8138f3c9-3fbc-4c13-94c8-cbc2b77b1350', 'France IDEX Masters Scholarship 2026', 'Université Grenoble Alpes', 'Scholarship', 'The IDEX Scholarship is awarded to outstanding international students pursuing a Master''s degree at Université Grenoble Alpes in France.', 'France', '€8,000 per academic year', 'https://www.scholarshipregion.com/france-idex-masters-scholarship/', '2026-04-19', NULL, '2026-02-28 12:25:35.566885+00')
ON CONFLICT (id) DO NOTHING;
COMMIT;