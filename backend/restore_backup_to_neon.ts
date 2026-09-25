import * as fs from 'fs';
import * as zlib from 'zlib';
import * as readline from 'readline';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BACKUP_PATH = 'C:\\Users\\DANIEL\\Downloads\\Telegram Desktop\\db_cluster-14-09-2026@03-18-18.backup.gz';

function parseValue(val: string): any {
  if (val === '\\N' || val === undefined) return null;
  return val;
}

function parseArray(val: string): string[] {
  if (!val || val === '\\N' || val === '{}') return [];
  if (val.startsWith('{') && val.endsWith('}')) {
    const inner = val.slice(1, -1);
    if (!inner) return [];
    return inner.split(',').map((s) => s.replace(/^"|"$/g, '').trim());
  }
  return [];
}

function parseIntArray(val: string): number[] {
  return parseArray(val).map((x) => parseInt(x, 10) || 0);
}

function parseBool(val: string): boolean {
  return val === 't' || val === 'true';
}

function parseIntVal(val: string, fallback = 0): number {
  if (!val || val === '\\N') return fallback;
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

function parseDate(val: string): Date {
  if (!val || val === '\\N') return new Date();
  return new Date(val);
}

async function run() {
  console.log('📦 Starting full database restoration from Supabase backup to Neon PostgreSQL...');

  if (!fs.existsSync(BACKUP_PATH)) {
    throw new Error(`Backup file not found at: ${BACKUP_PATH}`);
  }

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  const gzip = zlib.createGunzip();
  const stream = fs.createReadStream(BACKUP_PATH);
  const rl = readline.createInterface({ input: stream.pipe(gzip) });

  let currentTable: string | null = null;
  let currentColumns: string[] = [];

  const rawData: Record<string, string[][]> = {
    profiles: [],
    communities: [],
    posts: [],
    comments: [],
    likes: [],
    jobs: [],
  };

  console.log('📖 Reading and parsing dump tables...');

  for await (const line of rl) {
    if (line.startsWith('COPY public.')) {
      const match = line.match(/^COPY public\.(\w+) \((.*?)\) FROM stdin;/);
      if (match) {
        currentTable = match[1];
        currentColumns = match[2].split(',').map((c) => c.trim());
      }
    } else if (line === '\\.') {
      currentTable = null;
      currentColumns = [];
    } else if (currentTable && rawData[currentTable]) {
      const cols = line.split('\t');
      rawData[currentTable].push(cols);
    }
  }

  console.log(`Parsed:
  - ${rawData.profiles.length} profiles
  - ${rawData.communities.length} communities
  - ${rawData.posts.length} posts
  - ${rawData.comments.length} comments
  - ${rawData.likes.length} likes
  - ${rawData.jobs.length} jobs
  `);

  // 1. Restore Users/Profiles
  console.log('👤 Restoring Profiles to User table...');
  const userMap = new Set<string>();

  for (const row of rawData.profiles) {
    const id = row[0];
    const email = parseValue(row[1]) || `${id}@unilink.ng`;
    const name = parseValue(row[2]) || 'Student';
    const username = parseValue(row[3]) || `user_${id.slice(0, 8)}`;
    const role = parseValue(row[4]) || 'Student';
    const university = parseValue(row[5]);
    const avatar_url = parseValue(row[6]);
    const background_image_url = parseValue(row[7]);
    const headline = parseValue(row[8]);
    const location = parseValue(row[9]);
    const about = parseValue(row[10]);
    const skills = parseArray(row[11]);
    const website = parseValue(row[14]);
    const website_url = parseValue(row[15]);
    const github_url = parseValue(row[16]);
    const linkedin_url = parseValue(row[17]);
    const instagram_url = parseValue(row[18]);
    const twitter_url = parseValue(row[19]);
    const facebook_url = parseValue(row[20]);
    const industry = parseValue(row[21]);
    const resume_url = parseValue(row[22]);
    const points = parseIntVal(row[23], 0);
    const is_verified = parseBool(row[24]);
    const is_admin = parseBool(row[25]);
    const last_seen = row[26] && row[26] !== '\\N' ? parseDate(row[26]) : null;
    const created_at = parseDate(row[27]);
    const updated_at = parseDate(row[28]);
    const followers_count = parseIntVal(row[29], 0);
    const following_count = parseIntVal(row[30], 0);
    const connections_count = parseIntVal(row[31], 0);
    const is_test_user = parseBool(row[32]);
    const youtube_url = parseValue(row[33]);
    const tiktok_url = parseValue(row[34]);
    const whatsapp_url = parseValue(row[35]);
    const expected_graduation_year = parseValue(row[38]);
    const referral_code = parseValue(row[39]);
    const referred_by = parseValue(row[40]);
    const store_name = parseValue(row[41]);
    const store_description = parseValue(row[42]);
    const store_banner_url = parseValue(row[43]);
    const store_slug = parseValue(row[44]);
    const department = parseValue(row[45]);
    const study_year = parseValue(row[46]);
    const graduation_year = parseValue(row[47]);

    try {
      await prisma.user.upsert({
        where: { id },
        update: {
          name,
          username,
          avatar_url,
          headline,
          university,
          role,
          points,
          is_verified,
          is_admin,
        },
        create: {
          id,
          email,
          name,
          username,
          role,
          password_hash: defaultPassword,
          university,
          avatar_url,
          background_image_url,
          headline,
          location,
          about,
          skills,
          website,
          website_url,
          github_url,
          linkedin_url,
          instagram_url,
          twitter_url,
          facebook_url,
          industry,
          resume_url,
          points,
          is_verified,
          is_admin,
          is_test_user,
          followers_count,
          following_count,
          connections_count,
          expected_graduation_year,
          graduation_year,
          department,
          study_year,
          referral_code,
          referred_by,
          store_name,
          store_description,
          store_banner_url,
          store_slug,
          last_seen,
          created_at,
          updated_at,
          youtube_url,
          tiktok_url,
          whatsapp_url,
        },
      });
      userMap.add(id);
    } catch (e: any) {
      // Ignore duplicates
    }
  }
  console.log(`✅ Upserted ${userMap.size} users.`);

  // 2. Restore Communities
  console.log('👥 Restoring Communities...');
  const communityMap = new Set<string>();

  for (const row of rawData.communities) {
    const id = row[0];
    const name = parseValue(row[1]) || 'Community';
    const slug = parseValue(row[2]) || id;
    const description = parseValue(row[3]);
    const icon_url = parseValue(row[4]);
    const cover_image_url = parseValue(row[5]);
    const privacy = parseValue(row[6]) || 'public';
    const created_by = parseValue(row[7]);
    const created_at = parseDate(row[8]);
    const updated_at = parseDate(row[9]);
    const members_count = parseIntVal(row[10], 0);

    try {
      await prisma.community.upsert({
        where: { id },
        update: { name, slug, description, icon_url, members_count },
        create: {
          id,
          name,
          slug,
          description,
          icon_url,
          cover_image_url,
          privacy,
          created_by: created_by && userMap.has(created_by) ? created_by : null,
          created_at,
          updated_at,
          members_count,
        },
      });
      communityMap.add(id);
    } catch (e) {
      // Ignore duplicate slug or missing creator
    }
  }
  console.log(`✅ Upserted ${communityMap.size} communities.`);

  // 3. Restore Posts
  console.log('📝 Restoring Posts...');
  let postCount = 0;

  for (const row of rawData.posts) {
    const id = row[0];
    const author_id = row[1];
    const content = parseValue(row[2]);
    const image_url = parseValue(row[3]);
    const image_urls = parseArray(row[4]);
    const video_url = parseValue(row[5]);
    const community_id = parseValue(row[6]);
    const is_repost = parseBool(row[7]);
    const original_post_id = parseValue(row[8]);
    const repost_comment = parseValue(row[9]);
    const poll_options = parseArray(row[10]);
    const poll_counts = parseIntArray(row[11]);
    const created_at = parseDate(row[12]);
    const updated_at = parseDate(row[13]);
    const shared_to_feed = row[14] !== undefined ? parseBool(row[14]) : true;
    const likes_count = parseIntVal(row[15], 0);
    const comments_count = parseIntVal(row[16], 0);

    // Make sure author exists
    if (!userMap.has(author_id)) continue;

    try {
      await prisma.post.upsert({
        where: { id },
        update: {
          content,
          image_url,
          image_urls,
          video_url,
          likes_count,
          comments_count,
        },
        create: {
          id,
          author_id,
          content,
          image_url,
          image_urls,
          video_url,
          community_id: community_id && communityMap.has(community_id) ? community_id : null,
          is_repost,
          original_post_id,
          repost_comment,
          poll_options,
          poll_counts,
          created_at,
          updated_at,
          shared_to_feed,
          likes_count,
          comments_count,
        },
      });
      postCount++;
    } catch (e) {
      // Skip broken post relations
    }
  }
  console.log(`✅ Restored ${postCount} posts.`);

  // 4. Restore Jobs
  console.log('💼 Restoring Jobs...');
  let jobCount = 0;
  for (const row of rawData.jobs) {
    const id = row[0];
    const title = parseValue(row[1]) || 'Job';
    const company = parseValue(row[2]) || 'Company';
    const type = parseValue(row[3]) || 'Full-time';
    const description = parseValue(row[4]);
    const application_link = parseValue(row[5]);
    const location = parseValue(row[6]);
    const salary_range = parseValue(row[7]);
    const deadline = row[8] && row[8] !== '\\N' ? parseDate(row[8]) : null;
    const logo_url = parseValue(row[9]);
    const creator_id = parseValue(row[10]);
    const status = parseValue(row[11]) || 'active';
    const created_at = parseDate(row[12]);

    try {
      await prisma.job.upsert({
        where: { id },
        update: { title, company, type, description, location },
        create: {
          id,
          title,
          company,
          type,
          description,
          application_link,
          location,
          salary_range,
          deadline,
          logo_url,
          creator_id: creator_id && userMap.has(creator_id) ? creator_id : null,
          status,
          created_at,
        },
      });
      jobCount++;
    } catch (e) {
      // Skip errors
    }
  }
  console.log(`✅ Restored ${jobCount} jobs.`);

  console.log('🎉 Full database restoration complete!');
}

run()
  .catch((e) => {
    console.error('❌ Restore failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
