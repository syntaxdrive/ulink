import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_POST_COUNT = 40;

const CAMPUS_IMAGES = {
  lecture_hall: 'https://images.pexels.com/photos/1184572/pexels-photo-1184572.jpeg?auto=compress&cs=tinysrgb&w=1600',
  studying_group: 'https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=1600',
  library: 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=1600',
  exam_stress: 'https://images.pexels.com/photos/5427869/pexels-photo-5427869.jpeg?auto=compress&cs=tinysrgb&w=1600',
  laptop_study: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1600',
  campus_walk: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1600',
  teamwork: 'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=1600',
  coding: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1600',
};

const PERSONAS = [
  'final_year_student',
  'fresher_voice',
  'tech_bro',
  'anonymous_gist',
  'motivational_guy',
  'career_hustler',
  'relationship_corner',
  'scholarship_hunter',
];

const POSTS = [
  { persona: 'final_year_student', content: 'Is 2.1 still valuable in Nigeria or just vibes? Be honest.' },
  { persona: 'fresher_voice', content: 'First semester and I already feel behind. How did you guys survive your first year?', image: 'lecture_hall' },
  { persona: 'tech_bro', content: 'Drop one FREE course that actually helped you get better at coding.' },
  { persona: 'anonymous_gist', content: 'Be honest, who has cried because of one lecturer before? No names.' },
  { persona: 'motivational_guy', content: 'You are not behind. You are building capacity. Keep showing up.' },
  { persona: 'career_hustler', content: 'Internship with no pay in 2026: smart move or exploitation?' },
  { persona: 'relationship_corner', content: 'Dating on campus: support system or academic distraction?' },
  { persona: 'scholarship_hunter', content: 'Scholarship application checklist: transcript, statement, references. What else do people miss?', image: 'laptop_study' },
  { persona: 'anonymous_gist', content: 'Unpopular opinion: attendance should be scrapped completely. Convince me otherwise.' },
  { persona: 'tech_bro', content: 'Laptop spec check: what is the minimum RAM that still works for serious coding right now?' },
  { persona: 'fresher_voice', content: 'Hostel vs off-campus: which one gives better grades realistically?' },
  { persona: 'final_year_student', content: 'Project defense prep: what question shocked you the most?', image: 'teamwork' },
  { persona: 'career_hustler', content: 'If you had 50k today, what student side hustle would you start immediately?' },
  { persona: 'motivational_guy', content: 'Your CGPA is not your identity. It is feedback, not destiny.' },
  { persona: 'scholarship_hunter', content: 'People who got scholarships abroad, what made your personal statement stand out?' },
  { persona: 'relationship_corner', content: 'Would you date someone in the same department as you? Why or why not?' },
  { persona: 'anonymous_gist', content: 'Drop the most useless course you have taken so far and why.' },
  { persona: 'tech_bro', content: 'Python, JS, or Go for student freelancing in Nigeria right now?', image: 'coding' },
  { persona: 'fresher_voice', content: 'Timetable madness: how do you balance classes + reading + rest without burning out?' },
  { persona: 'final_year_student', content: 'NYSC + job hunting combo looks scary. Seniors, what should we prepare now?' },
  { persona: 'career_hustler', content: 'CV question: should student leadership roles be listed if they are not job-related?' },
  { persona: 'motivational_guy', content: 'Small daily wins beat random all-night panic reading.' },
  { persona: 'scholarship_hunter', content: 'Who wants a weekly scholarship drop thread? I can post deadlines every Sunday.' },
  { persona: 'relationship_corner', content: 'Can two broke students build together, or is that pure stress?' },
  { persona: 'anonymous_gist', content: 'What is one campus rule everyone pretends to follow but no one actually does?' },
  { persona: 'tech_bro', content: 'Best way to build a tech portfolio while still in school?', image: 'laptop_study' },
  { persona: 'fresher_voice', content: 'I am shy in class but want to network. What is a low-pressure way to start?' },
  { persona: 'final_year_student', content: 'For final-year students: did your SIWES/IT experience actually help your career path?' },
  { persona: 'career_hustler', content: 'If your class starts by 8am, what is your realistic wake-up time?' },
  { persona: 'motivational_guy', content: 'Consistency challenge: 2 hours focused reading daily for 14 days. Who is in?', image: 'library' },
  { persona: 'scholarship_hunter', content: 'Do you prefer local scholarships or international ones? Explain your strategy.' },
  { persona: 'relationship_corner', content: 'Is emotional maturity now more important than money for student relationships?' },
  { persona: 'anonymous_gist', content: 'Lecturer red flags: what behavior should schools stop normalizing?' },
  { persona: 'tech_bro', content: 'Can AI tools improve learning, or are we outsourcing real understanding?', image: 'studying_group' },
  { persona: 'fresher_voice', content: 'People that moved from average to top student, what changed first?' },
  { persona: 'final_year_student', content: 'Final-year stress is real. What coping method worked for you?', image: 'exam_stress' },
  { persona: 'career_hustler', content: 'Interview prep for fresh grads: what question should everyone rehearse?' },
  { persona: 'motivational_guy', content: 'Rest is part of productivity, not the opposite of it.' },
  { persona: 'scholarship_hunter', content: 'Do recommendation letters really matter if your grades are strong?' },
  { persona: 'anonymous_gist', content: 'Campus life in one sentence. Keep it brutally honest.', image: 'campus_walk' },
  { persona: 'relationship_corner', content: 'Study partner or romantic partner, which one improves your semester more?' },
  { persona: 'career_hustler', content: 'Remote internships vs in-person internships: which gives better growth for students?' },
  { persona: 'tech_bro', content: 'Show your current learning stack: tools, channels, and routines that actually work.' },
  { persona: 'fresher_voice', content: 'Should schools teach personal finance as a compulsory course?' },
  { persona: 'final_year_student', content: 'People with low CGPA but strong careers, what was your turning point?' },
  { persona: 'motivational_guy', content: 'You do not need perfect conditions. Start from where you are.' },
  { persona: 'anonymous_gist', content: 'Most overrated campus trend right now? Let us hear it.' },
  { persona: 'relationship_corner', content: 'Love language in exam season: silence or support?' },
  { persona: 'scholarship_hunter', content: 'Who wants an accountability circle for scholarship applications this month?', image: 'teamwork' },
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
    env[key] = value;
  }
  return env;
}

function readConfig() {
  const fromFile = parseEnvFile('.env.local');
  const env = { ...fromFile, ...process.env };

  const supabaseUrl = env.VITE_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  const postCount = Number(env.SEED_POST_COUNT || DEFAULT_POST_COUNT);
  const dryRun = String(env.SEED_DRY_RUN || '').toLowerCase() === 'true';
  const explicitAuthorIds = (env.SEED_AUTHOR_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!supabaseUrl) {
    throw new Error('Missing VITE_SUPABASE_URL in .env.local');
  }

  if (!serviceRoleKey && !anonKey) {
    throw new Error('Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY (recommended) or VITE_SUPABASE_ANON_KEY for dry-run checks.');
  }

  if (!serviceRoleKey && !dryRun) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for inserting seeded posts. Set SEED_DRY_RUN=true to preview without insert.');
  }

  return {
    supabaseUrl,
    serviceRoleKey: serviceRoleKey || anonKey,
    postCount,
    dryRun,
    explicitAuthorIds,
    hasServiceRole: Boolean(serviceRoleKey),
  };
}

async function resolveAuthors(supabase, explicitAuthorIds) {
  if (explicitAuthorIds.length > 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, name, role')
      .in('id', explicitAuthorIds);

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('SEED_AUTHOR_IDS provided but no matching profiles found');
    return data;
  }

  // Prefer controlled persona usernames if they exist.
  const { data: preferred, error: preferredError } = await supabase
    .from('profiles')
    .select('id, username, name, role')
    .in('username', PERSONAS)
    .limit(20);

  if (preferredError) throw preferredError;
  if (preferred && preferred.length >= 5) return preferred;

  throw new Error(
    'No dedicated seed profiles found. Set SEED_AUTHOR_IDS or create persona usernames: ' +
    PERSONAS.join(', ')
  );
}

function buildSeedRows(authors, postCount) {
  const now = Date.now();
  const selected = POSTS.slice(0, Math.max(30, Math.min(50, postCount)));

  return selected.map((post, idx) => {
    const author = authors[idx % authors.length];
    const imageUrl = post.image ? CAMPUS_IMAGES[post.image] : null;
    const createdAt = new Date(now - (selected.length - idx) * 27 * 60 * 1000).toISOString();

    return {
      author_id: author.id,
      content: post.content,
      image_url: imageUrl,
      image_urls: imageUrl ? [imageUrl] : [],
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}

async function insertInChunks(supabase, rows, size = 25) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await supabase.from('posts').insert(chunk);
    if (error) throw error;
    inserted += chunk.length;
  }
  return inserted;
}

async function main() {
  const { supabaseUrl, serviceRoleKey, postCount, dryRun, explicitAuthorIds, hasServiceRole } = readConfig();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authors = await resolveAuthors(supabase, explicitAuthorIds);
  const rows = buildSeedRows(authors, postCount);

  console.log(`Using ${authors.length} author profiles for seeding.`);
  console.log(`Prepared ${rows.length} engagement posts.`);
  if (!hasServiceRole) {
    console.log('Running without service-role key. Insert is blocked by RLS unless SEED_DRY_RUN=true.');
  }

  if (dryRun) {
    console.log('SEED_DRY_RUN=true, no rows inserted.');
    console.log(rows.slice(0, 5));
    return;
  }

  const inserted = await insertInChunks(supabase, rows);
  console.log(`Done. Inserted ${inserted} seeded posts.`);
}

main().catch((err) => {
  console.error('Seed script failed:', err.message || err);
  process.exit(1);
});
