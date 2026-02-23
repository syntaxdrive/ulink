-- ============================================================
-- SEED: Fake Users & Engaging Posts for UniLink
-- Run this in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
    -- User IDs — reuse existing auth user IDs if already inserted, else generate new
    u1  UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'chidiokonkwo@gmail.com'),  gen_random_uuid());
    u2  UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'amaraeze@gmail.com'),       gen_random_uuid());
    u3  UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'tundeadeyemi@gmail.com'),   gen_random_uuid());
    u4  UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'ngoziobi@gmail.com'),       gen_random_uuid());
    u5  UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'emekanwosu@gmail.com'),     gen_random_uuid());
    u6  UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'fatimabello@gmail.com'),    gen_random_uuid());
    u7  UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'davidosei@gmail.com'),      gen_random_uuid());
    u8  UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'blessingpeter@gmail.com'),  gen_random_uuid());
    u9  UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'ibrahimmusa@gmail.com'),    gen_random_uuid());
    u10 UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'adaezenwofor@gmail.com'),   gen_random_uuid());
    u11 UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'seunadesanya@gmail.com'),   gen_random_uuid());
    u12 UUID := COALESCE((SELECT id FROM auth.users WHERE email = 'chisomokeke@gmail.com'),    gen_random_uuid());

    -- Post IDs
    p1 UUID := gen_random_uuid();
    p2 UUID := gen_random_uuid();
    p3 UUID := gen_random_uuid();
    p4 UUID := gen_random_uuid();
    p5 UUID := gen_random_uuid();
    p6 UUID := gen_random_uuid();
    p7 UUID := gen_random_uuid();
    p8 UUID := gen_random_uuid();
    p9 UUID := gen_random_uuid();
    p10 UUID := gen_random_uuid();
    p11 UUID := gen_random_uuid();
    p12 UUID := gen_random_uuid();
    p13 UUID := gen_random_uuid();
    p14 UUID := gen_random_uuid();
    p15 UUID := gen_random_uuid();
    p16 UUID := gen_random_uuid();
    p17 UUID := gen_random_uuid();
    p18 UUID := gen_random_uuid();
    p19 UUID := gen_random_uuid();
    p20 UUID := gen_random_uuid();
    p21 UUID := gen_random_uuid();
    p22 UUID := gen_random_uuid();
    p23 UUID := gen_random_uuid();
    p24 UUID := gen_random_uuid();
    p25 UUID := gen_random_uuid();
    p26 UUID := gen_random_uuid();
    p27 UUID := gen_random_uuid();
    p28 UUID := gen_random_uuid();
    p29 UUID := gen_random_uuid();
    p30 UUID := gen_random_uuid();

BEGIN

-- ============================================================
-- 1. INSERT FAKE AUTH USERS (skip if email already exists)
-- ============================================================
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u1, 'chidiokonkwo@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '45 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'chidiokonkwo@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u2, 'amaraeze@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '40 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'amaraeze@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u3, 'tundeadeyemi@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '38 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tundeadeyemi@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u4, 'ngoziobi@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '35 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ngoziobi@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u5, 'emekanwosu@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '30 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'emekanwosu@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u6, 'fatimabello@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '28 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fatimabello@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u7, 'davidosei@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '25 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'davidosei@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u8, 'blessingpeter@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '22 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'blessingpeter@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u9, 'ibrahimmusa@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '20 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ibrahimmusa@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u10, 'adaezenwofor@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '18 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'adaezenwofor@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u11, 'seunadesanya@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '15 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'seunadesanya@gmail.com');

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, recovery_token)
SELECT u12, 'chisomokeke@gmail.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now() - interval '12 days', now(), 'authenticated', 'authenticated', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'chisomokeke@gmail.com');

-- ============================================================
-- 2. INSERT PROFILES
-- ============================================================
INSERT INTO public.profiles (id, email, name, username, role, university, avatar_url, headline, about, skills, location, is_verified)
VALUES
(u1,  'chidiokonkwo@gmail.com',  'Chidi Okonkwo',  'chidi_okonkwo',  'student', 'University of Lagos',           'https://api.dicebear.com/7.x/avataaars/svg?seed=chidi&backgroundColor=b6e3f4',    'Computer Science 300L | Aspiring Software Engineer', 'Passionate about building tech solutions for African problems. Open-source contributor and hackathon enthusiast.', ARRAY['Python','React','Node.js','Firebase'], 'Lagos, Nigeria', false),
(u2,  'amaraeze@gmail.com',           'Amara Eze',       'amara_writes',   'student', 'University of Nigeria, Nsukka',  'https://api.dicebear.com/7.x/avataaars/svg?seed=amara&backgroundColor=ffdfbf',     'Mass Communication 400L | Content Creator & Journalist', 'Student journalist with a love for telling Nigerian stories. Editor at The Lion Press campus newspaper.', ARRAY['Writing','Content Creation','Social Media','Adobe Premiere'], 'Nsukka, Enugu', false),
(u3,  'tundeadeyemi@gmail.com',        'Tunde Adeyemi',   'tunde_codes',    'student', 'University of Ibadan',           'https://api.dicebear.com/7.x/avataaars/svg?seed=tunde&backgroundColor=c0aede',     'Computer Science 200L | Frontend Developer', 'Self-taught dev turned CS student. I build things for the love of it. Currently obsessed with animations and UI.', ARRAY['JavaScript','CSS','Figma','React'], 'Ibadan, Oyo', false),
(u4,  'ngoziobi@gmail.com',          'Ngozi Obi',       'ngozi_builders', 'student', 'Federal University of Technology Akure', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ngozi&backgroundColor=d1d4f9', 'Civil Engineering 300L | Future Infrastructure Boss', 'Female engineer breaking barriers in tech. Proud FUTAite. Lover of bridges, both literal and metaphorical.', ARRAY['AutoCAD','MATLAB','Project Management','Structural Analysis'], 'Akure, Ondo', false),
(u5,  'emekanwosu@gmail.com',     'Emeka Nwosu',     'emekatech',      'student', 'University of Port Harcourt',    'https://api.dicebear.com/7.x/avataaars/svg?seed=emeka&backgroundColor=ffd5dc',     'Electrical Engineering 400L | Robotics Enthusiast', 'Building the future of Nigerian tech one circuit at a time. IEEE student member. Part-time chess player.', ARRAY['Arduino','Python','Circuit Design','IoT','Robotics'], 'Port Harcourt, Rivers', false),
(u6,  'fatimabello@gmail.com',        'Fatima Bello',    'fatima_finance', 'student', 'Ahmadu Bello University',        'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima&backgroundColor=b6e3f4',    'Accounting 300L | Finance & Investment Enthusiast', 'Numbers girl with big dreams. Interning at a fintech startup. Helping students understand personal finance.', ARRAY['Excel','Financial Modelling','QuickBooks','Data Analysis'], 'Zaria, Kaduna', false),
(u7,  'davidosei@gmail.com',       'David Osei',      'davidosei_art',  'student', 'University of Lagos',           'https://api.dicebear.com/7.x/avataaars/svg?seed=david&backgroundColor=c0aede',     'Fine Arts 300L | Digital Artist & Illustrator', 'Creating visual stories that celebrate African culture. Commission work open. Let art speak.', ARRAY['Procreate','Illustrator','Photoshop','Brand Design','3D Modelling'], 'Lagos, Nigeria', false),
(u8,  'blessingpeter@gmail.com',    'Blessing Peter',  'blessings_med',  'student', 'Delta State University',         'https://api.dicebear.com/7.x/avataaars/svg?seed=blessing&backgroundColor=ffdfbf',  'Medicine & Surgery 500L | Future Paediatrician', 'Med student surviving on coffee and determination. Health advocate for rural communities. I post health tips!', ARRAY['Clinical Research','Public Health','Anatomy','First Aid'], 'Abraka, Delta', false),
(u9,  'ibrahimmusa@gmail.com',        'Ibrahim Musa',    'ibrahim_econ',   'student', 'Bayero University Kano',         'https://api.dicebear.com/7.x/avataaars/svg?seed=ibrahim&backgroundColor=d1d4f9',  'Economics 400L | Policy Research & Development', 'Researching economic policies that work for everyday Nigerians. TEDx speaker. Debate champion.', ARRAY['Econometrics','SPSS','Policy Analysis','Research','Public Speaking'], 'Kano, Kano', false),
(u10, 'adaezenwofor@gmail.com',      'Adaeze Nwofor',   'adaeze_fashion', 'student', 'Imo State University',           'https://api.dicebear.com/7.x/avataaars/svg?seed=adaeze&backgroundColor=ffd5dc',   'Fashion Design 300L | Style Influencer', 'Fashionista meets academic. African-inspired fashion is my thing. Campus style icon. DMs open for collabs!', ARRAY['Sewing','Fashion Illustration','Fabric Sourcing','Brand Building','Photography'], 'Owerri, Imo', false),
(u11, 'seunadesanya@gmail.com',      'Seun Adesanya',   'seun_sports',    'student', 'Lagos State University',         'https://api.dicebear.com/7.x/avataaars/svg?seed=seun&backgroundColor=c0aede',     'Physical Education 200L | Athletics & Football Fanatic', 'LASU Athletics team captain. Football analyst. "Hard work beats talent when talent doesn''t work hard."', ARRAY['Sports Analysis','Coaching','Physical Training','First Aid','Team Leadership'], 'Lagos, Nigeria', false),
(u12, 'chisomokeke@gmail.com',       'Chisom Okeke',    'chisom_biz',     'student', 'Abia State University',          'https://api.dicebear.com/7.x/avataaars/svg?seed=chisom&backgroundColor=b6e3f4',   'Business Administration 400L | Young Entrepreneur', 'Running a small business while getting my degree. Dropshipping + affiliate marketing. DM to learn how!', ARRAY['Business Development','Marketing','E-commerce','Negotiation','Branding'], 'Uturu, Abia', false)
ON CONFLICT (id) DO UPDATE SET
    name        = EXCLUDED.name,
    username    = EXCLUDED.username,
    role        = EXCLUDED.role,
    university  = EXCLUDED.university,
    avatar_url  = EXCLUDED.avatar_url,
    headline    = EXCLUDED.headline,
    about       = EXCLUDED.about,
    skills      = EXCLUDED.skills,
    location    = EXCLUDED.location,
    is_verified = EXCLUDED.is_verified;

-- ============================================================
-- 3. DELETE OLD FAKE POSTS (so re-running never duplicates)
-- ============================================================
DELETE FROM public.posts WHERE author_id IN (u1,u2,u3,u4,u5,u6,u7,u8,u9,u10,u11,u12);
DELETE FROM public.comments WHERE author_id IN (u1,u2,u3,u4,u5,u6,u7,u8,u9,u10,u11,u12);

-- ============================================================
-- 3. INSERT ENGAGING POSTS (varied times, some with images)
-- ============================================================
INSERT INTO public.posts (id, author_id, content, image_url, image_urls, created_at, updated_at)
VALUES

-- Post 1: Relatable academic struggle
(p1, u1, E'Be honest... who else has been using the semester to "find yourself" instead of reading? 😭\n\nMidterm exams are in 3 weeks and I just remembered I have a 30-page assignment due Monday. This semester is not it.\n\n#UnifahLife #NigerianStudents #ExamSzn', NULL, ARRAY[]::text[], now() - interval '2 days' - interval '3 hours', now() - interval '2 days'),

-- Post 2: Tech tip with image
(p2, u3, E'PSA for all CS students: Stop using textbooks from 2010 to learn web dev 😤\n\nHere''s my free 2025 roadmap:\n→ HTML/CSS basics (2 weeks)\n→ JavaScript fundamentals (1 month)\n→ React (1 month)\n→ Build 3 projects\n→ Apply for internships\n\nYou don''t need a fancy bootcamp. Free resources > paid courses.\n\n#WebDev #NigerianTech', 
'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&q=80'], now() - interval '3 days' + interval '2 hours', now() - interval '3 days'),

-- Post 3: Personal finance tip
(p3, u6, E'A thread on why Nigerian students stay broke 👇\n\n1. No budget — You spend money you don''t have on things you don''t need\n2. Peer pressure — "E go better" mentality at the wrong time\n3. No savings culture — Even ₦500/week adds up to ₦26,000/year\n4. Zero investment knowledge — Your money should be working while you sleep\n\nI started saving 20% of every money I receive. After 6 months, I have enough for my own laptop. No borrowing.\n\nStart small. Stay consistent. Your future self will thank you. 💸\n\n#PersonalFinance', NULL, ARRAY[]::text[], now() - interval '4 days' + interval '5 hours', now() - interval '4 days'),

-- Post 4: Health tip from med student with image
(p4, u8, E'As a 500-level med student, let me tell you what your lecturers won''t:\n\n⚠️ STOP pulling all-nighters\n\nYour brain consolidates memory DURING SLEEP. Staying up all night to cram = your brain is actually retaining LESS.\n\nWhat actually works:\n✅ Study in 45-min sessions with 15-min breaks (Pomodoro)\n✅ Sleep 7-8 hours before exams\n✅ Teach what you''ve learned TO SOMEONE\n✅ Past questions > Reading everything\n\nYou''re welcome 🩺\n\n',
'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80'], now() - interval '5 days' + interval '1 hour', now() - interval '5 days'),

-- Post 5: Funny campus experience
(p5, u2, E'The way I walked into the wrong lecture hall and sat down for 20 minutes before realising I was in a LAW class and I study Mass Comm 😭😭😭\n\nThe lecturer kept saying "as we deliberate on matters of constitutional law..." and I was just nodding like I understood ANYTHING.\n\nCampus life just get as e be 😂\n\n#CampusLife #NigerianUniversity #UniversityFails #UNNlife', NULL, ARRAY[]::text[], now() - interval '1 day' - interval '4 hours', now() - interval '1 day'),

-- Post 6: Entrepreneurship post with image
(p6, u12, E'I made ₦87,000 last month while studying full-time for my Business Admin degree. Here''s HOW 👇\n\n📦 Dropshipping Nigerian fashion items to the diaspora\n📱 Running social media for 2 small businesses (₦15k/month each)\n✍️ Writing product descriptions for an e-commerce store\n\nI reinvested everything back into the business.\n\nAnyone saying "you can''t hustle and study" hasn''t tried hard enough. Time management is a skill.\n\nDM me if you want details\n\n#NigerianHustle',
'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80'], now() - interval '6 days' + interval '3 hours', now() - interval '6 days'),

-- Post 7: Art/culture post with image
(p7, u7, E'Just finished this piece — "Roots" 🎨\n\nInspired by the resilience of Nigerian women who carry entire communities on their backs while being told to be silent.\n\nThis one hits different. Posted it in my portfolio.\n\nIf you''re a brand or individual looking for African-inspired digital art — my commissions are open. Link in bio.\n\n#AfricanArt #DigitalArt',
'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80'], now() - interval '2 days' + interval '6 hours', now() - interval '2 days'),

-- Post 8: Engineering post with image
(p8, u4, E'People always ask why there aren''t enough female engineers in Nigeria.\n\nLet me tell you what I face daily:\n→ "Are you sure you can handle the calculations?"\n→ Being talked over in group projects\n→ Professors who call me "sweetheart" instead of my name\n→ Industry events where I''m the only woman in the room\n\nBut then I remember:\nI passed Structural Analysis with a B+. I lead a team of 6. I built a scale model bridge that held 40kg.\n\nAnd I''m only in 300L.\n\nTo every girl thinking engineering isn''t for her — it is. 💪\n\n#WomenInSTEM',
'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80'], now() - interval '7 days' + interval '2 hours', now() - interval '7 days'),

-- Post 9: Sports hot take
(p9, u11, E'Unpopular opinion incoming 🏈\n\nNigerians spend more time arguing about the Super Eagles than actually developing grassroots football.\n\nWe have the talent. Walk into any secondary school compound and you''ll see the next Musa or Osimhen.\n\nBut where are the scouts? Where are the academies? Where is the infrastructure?\n\nWe celebrate talent but don''t invest in systems.\n\nFix the foundation. The national team takes care of itself.\n\n', NULL, ARRAY[]::text[], now() - interval '3 days' - interval '2 hours', now() - interval '3 days'),

-- Post 10: Robotics/tech with image
(p10, u5, E'Built my first Arduino-powered obstacle-avoidance robot this weekend! 🤖\n\nSpec:\n• HC-SR04 ultrasonic sensor\n• L298N motor driver\n• 2 DC motors\n• Powered by a 9V battery pack\n\nTotal cost: ₦8,500 from components at Computer Village, Lagos.\n\nProof that you don''t need a rich university or expensive labs to build cool stuff. Just curiosity and YouTube 😂\n\nElectrical Engineering students, let''s connect!\n\n#Arduino',
'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?w=800&q=80'], now() - interval '4 days' - interval '1 hour', now() - interval '4 days'),

-- Post 11: Economics/policy discussion
(p11, u9, E'Nigeria''s unemployment rate for youth aged 15-34 is above 42%.\n\nBut our universities are still teaching the same curriculum from 1995.\n\n→ No digital skills\n→ No entrepreneurship training  \n→ No industry partnerships\n→ Graduates who can''t code, sell, or solve real problems\n\nThe system isn''t broken. It was never designed for our generation.\n\nThis is why platforms like UniLink matter. Community fills the gap that institutions leave.\n\n#NigerianYouth #Education #YouthEmpowerment #CareerDevelopment', NULL, ARRAY[]::text[], now() - interval '5 days' - interval '3 hours', now() - interval '5 days'),

-- Post 12: Fashion post with image
(p12, u10, E'Campus OOTD ✨\n\nAnkara print top I sewed myself + thrifted wide-leg trousers + platform sandals.\n\nTotal outfit cost: ₦4,200\n\nYou don''t need designer to look good. African fabric + creativity = everything.\n\nI''m building a lookbook of affordable African-inspired campus fits. Follow for more!\n\nTag a friend who needs to upgrade their campus wardrobe 👗🌺\n\n#AfricanFashion #AnkaraFashion #CampusStyle #StudentFashion #AfricanPrint',
'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'], now() - interval '1 day' + interval '2 hours', now() - interval '1 day'),

-- Post 13: Mental health awareness
(p13, u2, E'Can we normalize talking about mental health in Nigerian universities?\n\nIn my 400L, I''ve seen:\n- Students collapse from exhaustion and malnutrition\n- Friends spiral into depression during exams\n- People quit school because they had ZERO support\n\nOur parents say "just pray about it." Our lecturers say "this is nothing, we had it harder."\n\nBut we are struggling. It is real. You are not weak for struggling.\n\nIf you''re going through it, my DMs are open. No judgment. Just someone who has been there.\n\nYou matter more than any grade. 💙\n\n#MentalHealthNigeria #StudentMentalHealth #YouAreNotAlone #NigerianStudents', NULL, ARRAY[]::text[], now() - interval '8 days' + interval '4 hours', now() - interval '8 days'),

-- Post 14: Coding challenge
(p14, u1, E'Challenge for CS students on this app:\n\nWrite a function that takes a list of Nigerian states and returns them sorted by population.\n\nBonus points if you:\n→ Use Python\n→ Handle edge cases (empty list, duplicates)\n→ Write it without using .sort()\n\nDrop your solution in the comments. Best solution gets a shoutout + FREE code review from me.\n\nDeadline: 48 hours ⏰\n\n#Python', NULL, ARRAY[]::text[], now() - interval '18 hours', now() - interval '18 hours'),

-- Post 15: Campus food take
(p15, u5, E'The audacity of campus cafeterias to charge ₦1,500 for rice that tastes like the pot was washed with regret 😭\n\nBut the mama put outside the gate serving ₦600 jollof that hits your soul differently? Absolutely disrespectful how good it is.\n\nNigerian university food culture is a whole genre. What''s the best meal you''ve had from a campus vendor? I need recommendations before I lose my mind 🍛\n\n#CampusFood', NULL, ARRAY[]::text[], now() - interval '10 hours', now() - interval '10 hours'),

-- Post 16: Internship tips
(p16, u3, E'Just got my second internship offer this year. Here''s what actually got me noticed 👇\n\nWhat DOESN''T work:\n❌ Generic CV sent to 100 companies\n❌ "I am a fast learner and team player"\n❌ Waiting for job boards to post openings\n\nWhat DOES work:\n✅ A portfolio with REAL projects (even personal ones count)\n✅ Cold DM on LinkedIn with a specific, personal message\n✅ Contributing to open-source (companies check your GitHub)\n✅ Connecting with alumni who work where you want to go\n\nStop applying like everyone else. Stand out.\n\n#Internship #CareerTips', NULL, ARRAY[]::text[], now() - interval '6 hours', now() - interval '6 hours'),

-- Post 17: Motivational post with image
(p17, u4, E'1 year ago: Failed my Mechanics exam and cried for an entire day.\nToday: Highest score in my Structural Design class.\n\nThe difference? I stopped being ashamed to ask for help. I formed a study group. I went to office hours. I put in the work.\n\nFailure is just data. It tells you what to fix, not who you are.\n\nTo whoever needs to hear this: Retake the exam. Repeat the year if you have to. Your timeline is not behind — it''s yours.\n\n#GlowUp #StudentLife #NeverGiveUp #EngineeringLife #NigerianStudents',
'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'], now() - interval '2 days' - interval '5 hours', now() - interval '2 days'),

-- Post 18: JAMB/university application tips
(p18, u9, E'Fresh UTME candidates — a thread from someone who scored 312 👇\n\n📚 Don''t buy JAMB "expo" — it doesn''t exist and you''ll waste money\n📚 Past questions from 2010-2024 ARE the syllabus (seriously)\n📚 CBT practice matters more than reading notes\n📚 Know the format: 40 English, 40 per subject\n📚 Manage time — 1.5 mins per question max\n\nTop free resources:\n→ Myschool.ng\n→ Prepclass.ng\n→ CBTforce app\n\nYou can do this. It''s not as impossible as they made you believe.\n\n#JAMB #UTME', NULL, ARRAY[]::text[], now() - interval '9 days' + interval '1 hour', now() - interval '9 days'),

-- Post 19: Lifestyle/entertainment
(p19, u10, E'Things Nigerian students are collectively experiencing right now:\n\n☑️ Pretending to understand the lecturer when you don''t\n☑️ Sending "I''m on my way" when you haven''t left bed\n☑️ Group assignments where one person does 90% of the work\n☑️ Eating garri at 11pm because no money\n☑️ Praying for school to be cancelled\n☑️ Ironically, not wanting the semester to end because no job yet\n\nTag your campus bestie who will agree with all 6 😂\n\n#NigerianStudents #CampusLife #Relatable #StudentProblems #UniversityLife', NULL, ARRAY[]::text[], now() - interval '12 hours', now() - interval '12 hours'),

-- Post 20: Community building post
(p20, u8, E'I want to connect Nigerian medical students across all universities.\n\nDrop below:\n🏥 Your university\n📚 Your level\n🩺 Your specialty of interest\n\nLet''s build a community where we share resources, clinical tips, past questions, and support each other through the hardest course in the country.\n\nMedical education in Nigeria is brutal. But it''s easier together.\n\n@chidi tag your med friends! Let''s grow this network 💙\n\n#MedStudentNigeria #NigerianMedics #MedicalCommunity #FutureDoctors', NULL, ARRAY[]::text[], now() - interval '16 hours', now() - interval '16 hours')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. INSERT LIKES (cross-engagement between fake users)
-- ============================================================
INSERT INTO public.likes (post_id, user_id, created_at)
VALUES
-- Likes on p1 (Chidi's struggling post)
(p1, u2, now() - interval '2 days'), (p1, u3, now() - interval '2 days'), (p1, u5, now() - interval '1 day' - interval '20 hours'),
(p1, u6, now() - interval '1 day' - interval '18 hours'), (p1, u7, now() - interval '1 day' - interval '16 hours'), (p1, u10, now() - interval '1 day' - interval '14 hours'),
(p1, u11, now() - interval '1 day' - interval '12 hours'), (p1, u12, now() - interval '1 day' - interval '10 hours'),

-- Likes on p2 (Tunde's dev roadmap)
(p2, u1, now() - interval '3 days'), (p2, u4, now() - interval '2 days' - interval '22 hours'), (p2, u5, now() - interval '2 days' - interval '20 hours'),
(p2, u9, now() - interval '2 days' - interval '18 hours'), (p2, u11, now() - interval '2 days' - interval '16 hours'), (p2, u12, now() - interval '2 days' - interval '14 hours'),

-- Likes on p3 (Fatima's finance thread)
(p3, u1, now() - interval '4 days'), (p3, u2, now() - interval '3 days' - interval '22 hours'), (p3, u8, now() - interval '3 days' - interval '20 hours'),
(p3, u10, now() - interval '3 days' - interval '18 hours'), (p3, u12, now() - interval '3 days' - interval '16 hours'),

-- Likes on p4 (Blessing's med advice)
(p4, u1, now() - interval '5 days'), (p4, u2, now() - interval '4 days' - interval '22 hours'), (p4, u3, now() - interval '4 days' - interval '20 hours'),
(p4, u6, now() - interval '4 days' - interval '18 hours'), (p4, u9, now() - interval '4 days' - interval '16 hours'), (p4, u11, now() - interval '4 days' - interval '14 hours'),

-- Likes on p5 (Amara's funny post)
(p5, u1, now() - interval '1 day'), (p5, u3, now() - interval '1 day'), (p5, u4, now() - interval '1 day'),
(p5, u5, now() - interval '1 day'), (p5, u7, now() - interval '1 day'), (p5, u8, now() - interval '1 day'),
(p5, u9, now() - interval '1 day'), (p5, u10, now() - interval '1 day'), (p5, u11, now() - interval '1 day'),

-- Likes on p6 (Chisom's hustle post)
(p6, u1, now() - interval '6 days'), (p6, u3, now() - interval '6 days'), (p6, u5, now() - interval '5 days' - interval '22 hours'),
(p6, u8, now() - interval '5 days' - interval '20 hours'), (p6, u9, now() - interval '5 days' - interval '18 hours'),

-- Likes on p7 (David's art)
(p7, u2, now() - interval '2 days'), (p7, u4, now() - interval '2 days'), (p7, u6, now() - interval '2 days'),
(p7, u8, now() - interval '2 days'), (p7, u10, now() - interval '2 days'), (p7, u11, now() - interval '2 days'),

-- Likes on p12 (Adaeze's fashion)
(p12, u2, now() - interval '1 day'), (p12, u6, now() - interval '1 day'), (p12, u7, now() - interval '1 day'),
(p12, u8, now() - interval '1 day'), (p12, u10, now() - interval '20 hours'),

-- Likes on p14 (Chidi's coding challenge)
(p14, u3, now() - interval '17 hours'), (p14, u5, now() - interval '17 hours'), (p14, u9, now() - interval '16 hours'),
(p14, u11, now() - interval '15 hours'),

-- Likes on p15 (Emeka's food post)
(p15, u1, now() - interval '9 hours'), (p15, u2, now() - interval '9 hours'), (p15, u4, now() - interval '9 hours'),
(p15, u7, now() - interval '8 hours'), (p15, u10, now() - interval '8 hours'), (p15, u12, now() - interval '8 hours'),

-- Likes on p16 (Tunde's internship tips)
(p16, u1, now() - interval '5 hours'), (p16, u4, now() - interval '5 hours'), (p16, u6, now() - interval '5 hours'),
(p16, u8, now() - interval '5 hours'), (p16, u9, now() - interval '5 hours'), (p16, u12, now() - interval '5 hours'),

-- Likes on p19 (Adaeze's relatable post)
(p19, u1, now() - interval '11 hours'), (p19, u2, now() - interval '11 hours'), (p19, u3, now() - interval '11 hours'),
(p19, u5, now() - interval '11 hours'), (p19, u6, now() - interval '11 hours'), (p19, u7, now() - interval '11 hours'),
(p19, u8, now() - interval '11 hours'), (p19, u9, now() - interval '11 hours'), (p19, u11, now() - interval '11 hours')

ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. INSERT COMMENTS (realistic interactions)
-- ============================================================
INSERT INTO public.comments (post_id, author_id, content, created_at)
VALUES
-- Comments on p1 (Chidi's struggle)
(p1, u3, 'Bro this is literally me right now 😭 I have 3 assignments, a practicals report and an exam all next week. I''m cooked.', now() - interval '1 day' - interval '22 hours'),
(p1, u6, 'The "finding yourself" phase is a whole university experience honestly 😂 But you can still pull through! Start with the assignment first.', now() - interval '1 day' - interval '21 hours'),
(p1, u11, 'Every. Single. Semester. And somehow we always survive 🙏', now() - interval '1 day' - interval '20 hours'),
(p1, u2, 'The confidence to post this instead of reading is sending me 💀', now() - interval '1 day' - interval '19 hours'),

-- Comments on p2 (Tunde's dev roadmap)
(p2, u1, 'This is genuinely helpful! Saving this. Question — do you recommend Vue or React first for someone with zero JS experience?', now() - interval '2 days' - interval '22 hours'),
(p2, u5, 'The part about free resources > paid courses is SO true. I learned Arduino entirely from YouTube and Reddit communities.', now() - interval '2 days' - interval '21 hours'),
(p2, u12, 'Also add: learn Git from day 1. So many people skip this and regret it during internships.', now() - interval '2 days' - interval '18 hours'),
(p2, u9, 'Genuine question — is there a Nigerian equivalent to this? Something specific to our job market?', now() - interval '2 days' - interval '14 hours'),

-- Comments on p5 (Amara's funny post)
(p5, u1, 'I can''t stop laughing 😂 The way you were NODDING like constitutional law made sense is the funniest thing I''ve read today', now() - interval '23 hours'),
(p5, u4, 'This happened to my friend in 100L. She sat in an Architecture class for 45 minutes taking notes. She studies Nursing 💀', now() - interval '22 hours'),
(p5, u7, 'The experience built character 😂 You can now confidently fake understanding in any lecture hall.', now() - interval '21 hours'),
(p5, u11, 'The walk of shame out of the wrong hall though... 💀', now() - interval '20 hours'),

-- Comments on p14 (Chidi's coding challenge)
(p14, u3, 'Challenge accepted! def sort_states(states): from collections import Counter ... actually let me think about this properly 😂', now() - interval '17 hours'),
(p14, u5, 'Can we do it in C? Or is this Python only? My C is stronger than Python honestly 🤣', now() - interval '16 hours'),
(p14, u1, '@tunde_codes Python preferred but C is valid if you can explain the logic!', now() - interval '15 hours'),

-- Comments on p15 (Emeka's food post)
(p15, u2, 'UNILAG mama put outside gate 4 — jollof and stew with TWO pieces of meat for ₦700. That woman is an ANGEL.', now() - interval '9 hours'),
(p15, u4, 'The cafeteria prices are genuinely criminal considering the quality. ₦1,500 for sadness on a plate 😭', now() - interval '8 hours' - interval '30 minutes'),
(p15, u12, 'There''s a woman near Abia State library that does fried yam + pepper sauce for ₦400. Life changing. I go every single day.', now() - interval '8 hours'),
(p15, u8, 'As someone who has watched classmates eat twice a day to save money — campus food pricing affects mental health fr.', now() - interval '7 hours'),

-- Comments on p16 (Tunde's internship tips)
(p16, u1, 'The cold DM tip is underrated. Got my first interview from a LinkedIn message. People actually respond!', now() - interval '5 hours'),
(p16, u6, 'What''s the best way to cold DM without seeming desperate? This is genuinely my fear.', now() - interval '5 hours'),
(p16, u3, '@fatima_finance Keep it short — 3 sentences max. What you''ve built, what you''re looking for, why THEIR company specifically.', now() - interval '4 hours'),
(p16, u9, 'The alumni network point is HUGE. People hire from communities they trust.', now() - interval '4 hours'),

-- Comments on p19 (Adaeze's relatable post)
(p19, u1, '"I''m on my way" when I haven''t even showered 😭 This list is way too accurate.', now() - interval '11 hours'),
(p19, u3, 'Every single one except the garri one because garri at 11pm is actually a lifestyle choice at this point, not a last resort.', now() - interval '11 hours'),
(p19, u5, 'The group assignment one should come with criminal charges for certain people. You know who you are. 😤', now() - interval '10 hours' - interval '30 minutes'),
(p19, u11, 'Praying for school to be cancelled but panicking when semester ends. We are not well 😂', now() - interval '10 hours'),

-- Comments on p20 (Blessing's med community post)
(p20, u8, 'I''ll start: Delta State University, 500L, interested in Paediatrics and Community Health! 🩺', now() - interval '15 hours'),
(p20, u2, 'Not a med student but I cover health on my campus paper — can I join just to report on what you all are doing?', now() - interval '14 hours'),
(p20, u1, 'My sister is in 200L Medicine at UNILAG. Tagging her. This is a great initiative!', now() - interval '13 hours')

ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. MORE POSTS (p21-p30)
-- ============================================================
INSERT INTO public.posts (id, author_id, content, image_url, image_urls, created_at, updated_at)
VALUES

(p21, u5, E'NEPA took light right when I was uploading my final year project \U0001f62d\U0001f62d\U0001f62d\n\nI had been awake since 4am. The submission portal closes in 10 minutes. 95% uploaded.\nThen darkness.\n\nI screamed. The whole hostel heard me.\n\n(Hotspot + phone battery saved the day after 30 mins of panic)\n\nShare your worst NEPA timing stories \U0001f62d\n\n#NEPA #PowerCut #NigerianStudents #CampusLife', NULL, ARRAY[]::text[], now() - interval '13 hours', now() - interval '13 hours'),

(p22, u3, E'University course registration system in Nigeria:\n\n\u2192 Opens at 9am\n\u2192 Crashes at 9:00:03am\n\u2192 "Try again later"\n\u2192 Portal maintenance till further notice\n\u2192 3 days later it''s back\n\u2192 Your course is full\n\u2192 Lecturer says "you can''t sit my class without being registered"\n\u2192 You sit in the class anyway and pray\n\nThis is not fiction. This is just Tuesday \U0001f602\n\n#CourseRegistration #NigerianUniversity #StudentLife', NULL, ARRAY[]::text[], now() - interval '11 hours', now() - interval '11 hours'),

(p23, u6, E'Calling all Accounting + Finance students!\n\nStarting a weekly free study group (virtual).\n\nWhat we cover:\n\U0001f4ca Financial statements\n\U0001f4c8 Cost accounting\n\U0001f3e6 Corporate finance\n\U0001f4da ICAN/ACCA exam prep\n\nSundays 7pm WAT on Google Meet. DM me to join\U0001f4ac\n\n#AccountingStudents #FinanceNigeria #StudyGroup #ICAN #ACCA',
'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'], now() - interval '2 days' - interval '8 hours', now() - interval '2 days'),

(p24, u9, E'Hot take: Nigerian universities prepare you for employment but NOT for life.\n\nTaught:\n\u2705 How to pass exams\n\u2705 How to follow instructions\n\u2705 How to wait for opportunity\n\nNot taught:\n\u274c How to manage money\n\u274c How to negotiate\n\u274c How to fail and recover\n\u274c How to build from scratch\n\nThen we graduate and wonder why youth unemployment is 42%.\n\nWhat skill are you teaching yourself outside the classroom? \U0001f447\n\n#NigerianEducation', NULL, ARRAY[]::text[], now() - interval '3 days', now() - interval '3 days'),

(p25, u1, E'I GOT THE INTERNSHIP!!! \U0001f389\U0001f389\U0001f389\n\nJust received my offer letter from a Lagos fintech startup for a Backend Engineering internship this summer.\n\nFor the CS students watching: I applied to 23 places. Got rejected by 21. Interviewed at 3. Got 1 offer.\n\nThe ratio is brutal but the W is real. Don''t stop applying.\n\nNext chapter: building something real \U0001f680\n\n#InternshipOffer #NigerianTech #SoftwareEngineering #NeverGiveUp',
'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80'], now() - interval '5 hours', now() - interval '5 hours'),

(p26, u11, E'Ranking Nigerian hostel experiences:\n\n1. \U0001f3c6 Running water for 3 consecutive days (peak luxury)\n2. \U0001f64f NEPA for the whole night during exam period\n3. \U0001f60c Bunk mate who is quiet during study hours\n4. \U0001f605 Finding an iron outlet that works\n5. \U0001f480 Sharing a bathroom with 80 students\n6. \u2620\ufe0f The SMELL on a Monday afternoon\n\nHostel life is a whole personality. Tag your hostel bestie \U0001f602\n\n#HostelLife #NigerianUniversity #StudentLife', NULL, ARRAY[]::text[], now() - interval '1 day' - interval '7 hours', now() - interval '1 day'),

(p27, u8, E'5 study tips that actually work (from a 500L med student):\n\n1. START with past questions, not notes\n2. Explain concepts OUT LOUD to yourself\n3. Study in 3-day sprints, not all-nighters\n4. Form a group with people smarter than you\n5. Protect your sleep like your GPA depends on it. (It does.)\n\n#StudyTips', NULL, ARRAY[]::text[], now() - interval '20 hours', now() - interval '20 hours'),

(p28, u2, E'Nigerian parents when their friend''s child gets a scholarship: "Why can''t you be like Emeka? Emeka is going to Canada!"\n\nMe internally: Emeka hasn''t slept properly in 2 years. Emeka''s social life is ZERO. Emeka cried every Sunday. Emeka hasn''t watched a movie since 2022.\n\nBut sure. Let''s be like Emeka.\n\n(Congrats to Emeka tho fr \U0001f64f That grind is real)\n\n#NigerianParents #CampusHumour #Relatable', NULL, ARRAY[]::text[], now() - interval '8 hours', now() - interval '8 hours'),

(p29, u7, E'Story time: I''ve been making eye contact with someone in the library for 3 weeks.\n\nWeek 1: We both looked away fast.\nWeek 2: I smiled. They smiled back. Heart: \U0001f4a5\nWeek 3: They sat at the TABLE NEXT TO MINE.\n\nI put in my AirPods and pretended to be in a meeting I was not in.\n\nI draw people for a living. I could not draw the courage to say hello.\n\n', NULL, ARRAY[]::text[], now() - interval '4 hours', now() - interval '4 hours'),

(p30, u4, E'To all the first-generation university students here:\n\nNo one in your family has done this before.\nYou don''t have a blueprint.\nYou figure things out one semester at a time.\nYou carry the weight of your family''s dreams.\n\nAnd you show up anyway.\n\nYou are not behind. You are PIONEERING. \U0001fa95\n\n#FirstGeneration',
'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80', ARRAY['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80'], now() - interval '7 hours', now() - interval '7 hours')

ON CONFLICT (id) DO NOTHING;

-- Likes on new posts
INSERT INTO public.likes (post_id, user_id, created_at) VALUES
(p21, u1, now() - interval '12 hours'), (p21, u2, now() - interval '12 hours'), (p21, u4, now() - interval '11 hours'),
(p21, u7, now() - interval '11 hours'), (p21, u10, now() - interval '11 hours'), (p21, u12, now() - interval '11 hours'),
(p22, u1, now() - interval '11 hours'), (p22, u4, now() - interval '11 hours'), (p22, u5, now() - interval '10 hours'),
(p22, u8, now() - interval '10 hours'), (p22, u9, now() - interval '10 hours'),
(p24, u1, now() - interval '3 days'), (p24, u3, now() - interval '3 days'), (p24, u5, now() - interval '3 days'),
(p24, u6, now() - interval '3 days'), (p24, u11, now() - interval '3 days'), (p24, u12, now() - interval '3 days'),
(p25, u2, now() - interval '4 hours'), (p25, u3, now() - interval '4 hours'), (p25, u4, now() - interval '4 hours'),
(p25, u6, now() - interval '4 hours'), (p25, u7, now() - interval '4 hours'), (p25, u8, now() - interval '4 hours'),
(p25, u9, now() - interval '4 hours'), (p25, u10, now() - interval '4 hours'), (p25, u11, now() - interval '4 hours'),
(p26, u2, now() - interval '1 day'), (p26, u3, now() - interval '1 day'), (p26, u5, now() - interval '1 day'),
(p26, u6, now() - interval '1 day'), (p26, u8, now() - interval '1 day'), (p26, u9, now() - interval '1 day'),
(p27, u1, now() - interval '19 hours'), (p27, u3, now() - interval '19 hours'), (p27, u6, now() - interval '18 hours'),
(p27, u9, now() - interval '18 hours'), (p27, u11, now() - interval '18 hours'), (p27, u12, now() - interval '18 hours'),
(p28, u1, now() - interval '7 hours'), (p28, u3, now() - interval '7 hours'), (p28, u4, now() - interval '7 hours'),
(p28, u5, now() - interval '7 hours'), (p28, u9, now() - interval '7 hours'), (p28, u10, now() - interval '7 hours'),
(p28, u11, now() - interval '7 hours'), (p28, u12, now() - interval '7 hours'),
(p29, u1, now() - interval '3 hours'), (p29, u2, now() - interval '3 hours'), (p29, u6, now() - interval '3 hours'),
(p29, u8, now() - interval '3 hours'), (p29, u10, now() - interval '3 hours'), (p29, u12, now() - interval '3 hours'),
(p30, u1, now() - interval '6 hours'), (p30, u2, now() - interval '6 hours'), (p30, u5, now() - interval '6 hours'),
(p30, u9, now() - interval '6 hours'), (p30, u11, now() - interval '6 hours'), (p30, u12, now() - interval '6 hours')
ON CONFLICT DO NOTHING;

-- Comments on new posts
INSERT INTO public.comments (post_id, author_id, content, created_at) VALUES
(p21, u2, 'NEPA took light during my WAEC Biology practical. The generator was "under repair". I cried actual tears.', now() - interval '12 hours'),
(p21, u7, 'My worst: power went during my viva. The projector died mid-slide. I continued from memory for 10 minutes. Got an A.', now() - interval '11 hours'),
(p21, u12, 'I back up to Google Drive every 5 minutes now. NEPA traumatized me permanently.', now() - interval '11 hours'),
(p22, u1, 'UI portal crashing is a scheduled event at this point. Just add it to the academic calendar.', now() - interval '11 hours'),
(p22, u4, 'FUTA''s portal once registered me for a course I never heard of and dropped me from one I needed. I failed that semester.', now() - interval '10 hours'),
(p25, u2, 'CONGRATULATIONS CHIDI!!! You deserve this! The grinding paid off!', now() - interval '4 hours'),
(p25, u3, 'This is genuinely inspiring. I gave up after 8 rejections. Need to reset my mindset.', now() - interval '4 hours'),
(p25, u6, 'People only see the W. They don''t see the 21 L''s. Thank you for sharing this honestly.', now() - interval '3 hours'),
(p28, u3, 'Emeka is exhausted. Emeka needs a nap. We don''t talk about how Emeka is doing.', now() - interval '7 hours'),
(p28, u5, 'When Emeka needs support they say "you got scholarship, what more do you want?" The pressure is real.', now() - interval '6 hours'),
(p29, u2, 'Three WEEKS of eye contact and you chose imaginary meeting. You are not built for love, you are built for avoidance.', now() - interval '3 hours'),
(p29, u8, 'Please post an update. We are invested now. Did you say hello??', now() - interval '3 hours'),
(p29, u7, 'They walked away before I could say anything. There is only regret now.', now() - interval '2 hours'),
(p30, u2, 'This made me tear up. First gen here. Every week feels like improvising. Thank you.', now() - interval '6 hours'),
(p30, u9, 'First generation checking in. Nobody warned us about all of it but we are still here.', now() - interval '6 hours'),
(p30, u12, 'My parents never went past secondary school. Posts like this keep me going.', now() - interval '5 hours')
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Seed complete: 12 users, 30 posts, likes and comments inserted.';

END $$;
