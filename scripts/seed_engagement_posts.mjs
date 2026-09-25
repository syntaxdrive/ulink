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
  { persona: 'final_year_student', content: 'abeg who else is tired of lecturers that give 6 courses in one semester 😭 my brain don full' },
  { persona: 'fresher_voice', content: 'first week of school and i already forgot why i wanted to come here lmao. this hostel wahala is too much', image: 'lecture_hall' },
  { persona: 'tech_bro', content: 'drop one free course that actually helped you. not the ones people just recommend, the ones that actually changed something' },
  { persona: 'anonymous_gist', content: 'be honest, who has cried this semester already 😭 no judgment zone' },
  { persona: 'motivational_guy', content: 'bro you are not behind. you are just building different. keep going' },
  { persona: 'career_hustler', content: 'internship that pays 0 naira in 2026 is it smart or are they just using you? asking for a friend' },
  { persona: 'relationship_corner', content: 'campus relationship or focus on books. which one has actually helped your gpa lol' },
  { persona: 'scholarship_hunter', content: 'if you got a scholarship abroad please share what your personal statement said. we need to learn 🙏', image: 'laptop_study' },
  { persona: 'anonymous_gist', content: 'hot take: attendance should not count as 10%. if u know the work u know it period' },
  { persona: 'tech_bro', content: 'honest question: 8gb ram in 2026 for a cs student. is that surviving or suffering' },
  { persona: 'fresher_voice', content: 'hostel life vs off campus. i need genuine gist not the ones people post for clout' },
  { persona: 'final_year_student', content: 'project defense question that almost finished me: "what would you change about your methodology?" 😭 nobody prepared me', image: 'teamwork' },
  { persona: 'career_hustler', content: '50k in hand, no debt, student. what business would you start RIGHT NOW. no theoretical answers' },
  { persona: 'motivational_guy', content: 'your cgpa is not a life sentence. breathe. some of the most successful people you know had a 2.something' },
  { persona: 'scholarship_hunter', content: 'scholarship hunters assemble 🙋 i need to know what documents always gets people rejected. help each other out' },
  { persona: 'relationship_corner', content: 'same department relationship. i said what i said, it always ends weird. fight me' },
  { persona: 'anonymous_gist', content: 'drop the most useless course you have ever done in this school. mine was a 2 unit course about physical fitness 💀' },
  { persona: 'tech_bro', content: 'python or javascript for someone that wants to freelance this semester. not debate, just real experience', image: 'coding' },
  { persona: 'fresher_voice', content: 'first years listen: eat, sleep, and read. the social life will still be there. trust me i learnt the hard way' },
  { persona: 'final_year_student', content: 'nysc wahala plus job hunting at the same time is a spiritual warfare. seniors please advise' },
  { persona: 'career_hustler', content: 'should i put "social media manager for my cousin" on my CV or is that a crime 😂' },
  { persona: 'motivational_guy', content: 'two focused hours beats six hours of reading with your phone in your hand. that is the whole secret' },
  { persona: 'scholarship_hunter', content: 'okay im going to start posting scholarship deadlines every sunday here. lmk who wants the gist 🔔' },
  { persona: 'relationship_corner', content: 'two broke students trying to build together is that love or is that suffering with extra steps 😭' },
  { persona: 'anonymous_gist', content: 'what rule does literally everyone on campus break but nobody talks about. i will start: the no food in library one' },
  { persona: 'tech_bro', content: 'serious question: how do you build a portfolio when every tutorial project looks the same. asking genuinely', image: 'laptop_study' },
  { persona: 'fresher_voice', content: 'i want to network but i am terrible with people. like physically bad at talking. any introverts that figured it out?' },
  { persona: 'final_year_student', content: 'did your industrial training actually teach you anything or was it just 6 months of fetching files and making tea' },
  { persona: 'career_hustler', content: '8am class is a personal attack and whoever put it there hates students' },
  { persona: 'motivational_guy', content: '14 day reading challenge. 2 hours a day minimum. who is joining. drop ✋ below', image: 'library' },
  { persona: 'scholarship_hunter', content: 'local scholarship or international one. which do you actually have better odds with. be honest' },
  { persona: 'relationship_corner', content: 'exam period relationship test: silent support or active help. what do you need from a partner' },
  { persona: 'anonymous_gist', content: 'lecturer behaviour that should be reported but nobody reports because they control your marks. lets discuss' },
  { persona: 'tech_bro', content: 'ai is making students lazy or ai is a tool students are not using right. which is it really', image: 'studying_group' },
  { persona: 'fresher_voice', content: 'people that went from struggling to topping their class, what was the ONE thing that flipped it for you' },
  { persona: 'final_year_student', content: 'final year is lonely and nobody talks about that part. its not just stress its isolation. anyone else feeling this', image: 'exam_stress' },
  { persona: 'career_hustler', content: 'interview question every fresh grad should have a solid answer for. drop yours, i need to hear them' },
  { persona: 'motivational_guy', content: 'rest is not laziness. your brain needs to breathe. close the tab sometimes' },
  { persona: 'scholarship_hunter', content: 'recommendation letters. do they actually matter if your grades and essay are strong enough' },
  { persona: 'anonymous_gist', content: 'campus life in one sentence. i will not be going first 😂', image: 'campus_walk' },
  { persona: 'relationship_corner', content: 'study partner vs romantic partner. which one has genuinely added more to your life this semester' },
  { persona: 'career_hustler', content: 'remote internship vs in person. i did both. remote was easier, in person taught me more. discuss' },
  { persona: 'tech_bro', content: 'post your actual learning stack. not the aesthetic notion page. the real one you use daily' },
  { persona: 'fresher_voice', content: 'why is personal finance not a compulsory course. i am 200 level and still learning to budget from youtube' },
  { persona: 'final_year_student', content: 'low cgpa but thriving career. i know you exist. how did you flip the narrative' },
  { persona: 'motivational_guy', content: 'stop waiting for motivation. discipline is what shows up when motivation does not. build the habit' },
  { persona: 'anonymous_gist', content: 'most overrated thing on this campus right now. i have thoughts but i want to hear yours first 👀' },
  { persona: 'relationship_corner', content: 'exam season love language check: do you need space or constant reassurance. asking because mine is confusing me' },
  { persona: 'scholarship_hunter', content: 'anyone doing scholarship applications this month? lets do accountability together. lmk below 🙋', image: 'teamwork' },
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
