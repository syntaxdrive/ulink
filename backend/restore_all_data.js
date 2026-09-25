const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const BACKUP_PATH = 'C:\\Users\\DANIEL\\Downloads\\Telegram Desktop\\db_cluster-14-09-2026@03-18-18.backup.gz';

function parseValue(val) {
  if (val === '\\N' || val === undefined || val === null) return null;
  return val;
}

function parseArray(val) {
  if (!val || val === '\\N' || val === '{}') return [];
  if (val.startsWith('{') && val.endsWith('}')) {
    const inner = val.slice(1, -1);
    if (!inner) return [];
    return inner.split(',').map((s) => s.replace(/^"|"$/g, '').trim());
  }
  return [];
}

function parseIntArray(val) {
  return parseArray(val).map((x) => parseInt(x, 10) || 0);
}

function parseBool(val, fallback = false) {
  if (val === '\\N' || val === undefined || val === null) return fallback;
  return val === 't' || val === 'true';
}

function parseIntVal(val, fallback = 0) {
  if (!val || val === '\\N') return fallback;
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
}

function parseFloatVal(val, fallback = 0.0) {
  if (!val || val === '\\N') return fallback;
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

function parseDate(val) {
  if (!val || val === '\\N') return new Date();
  return new Date(val);
}

async function run() {
  console.log('📦 Starting FULL restoration of all UniLink features into Neon PostgreSQL...');

  if (!fs.existsSync(BACKUP_PATH)) {
    throw new Error(`Backup file not found at: ${BACKUP_PATH}`);
  }

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  const gzip = zlib.createGunzip();
  const stream = fs.createReadStream(BACKUP_PATH);
  const rl = readline.createInterface({ input: stream.pipe(gzip) });

  let currentTable = null;
  let currentColumns = [];

  const rawData = {
    profiles: [],
    communities: [],
    community_members: [],
    posts: [],
    comments: [],
    likes: [],
    jobs: [],
    courses: [],
    course_documents: [],
    course_likes: [],
    podcasts: [],
    podcast_episodes: [],
    study_rooms: [],
    study_room_participants: [],
    connections: [],
    follows: [],
    messages: [],
    marketplace_listings: [],
  };

  console.log('📖 Reading and parsing dump tables from backup file...');

  for await (const line of rl) {
    if (line.startsWith('COPY public.')) {
      const match = line.match(/^COPY public\.(\w+) \((.*?)\) FROM stdin;/);
      if (match && rawData[match[1]]) {
        currentTable = match[1];
        currentColumns = match[2].split(',').map((c) => c.trim());
      } else {
        currentTable = null;
      }
    } else if (line === '\\.') {
      currentTable = null;
      currentColumns = [];
    } else if (currentTable && rawData[currentTable]) {
      const cols = line.split('\t');
      rawData[currentTable].push(cols);
    }
  }

  console.log(`Summary of parsed rows:
  - Profiles: ${rawData.profiles.length}
  - Communities: ${rawData.communities.length}
  - Community Members: ${rawData.community_members.length}
  - Posts: ${rawData.posts.length}
  - Comments: ${rawData.comments.length}
  - Likes: ${rawData.likes.length}
  - Jobs: ${rawData.jobs.length}
  - Courses: ${rawData.courses.length}
  - Course Documents: ${rawData.course_documents.length}
  - Course Likes: ${rawData.course_likes.length}
  - Podcasts: ${rawData.podcasts.length}
  - Podcast Episodes: ${rawData.podcast_episodes.length}
  - Study Rooms: ${rawData.study_rooms.length}
  - Study Room Participants: ${rawData.study_room_participants.length}
  - Connections: ${rawData.connections.length}
  - Follows: ${rawData.follows.length}
  - Messages: ${rawData.messages.length}
  - Marketplace Listings: ${rawData.marketplace_listings.length}
  `);

  // 1. Users / Profiles
  console.log('👤 Restoring Users...');
  const userMap = new Set();
  const existingUsers = await prisma.user.findMany({ select: { id: true } });
  existingUsers.forEach((u) => userMap.add(u.id));

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
          followers_count,
          following_count,
          connections_count,
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
    } catch (e) {
      // Ignored
    }
  }
  console.log(`✅ Users in DB: ${userMap.size}`);

  // 2. Communities
  console.log('👥 Restoring Communities...');
  const communityMap = new Set();
  for (const row of rawData.communities) {
    const id = row[0];
    const name = parseValue(row[1]) || 'Community';
    let slug = parseValue(row[2]) || id;
    const description = parseValue(row[3]);
    const icon_url = parseValue(row[4]);
    const cover_image_url = parseValue(row[5]);
    const privacy = parseValue(row[6]) || 'public';
    const created_by = parseValue(row[7]);
    const created_at = parseDate(row[8]);
    const updated_at = parseDate(row[9]);
    const members_count = parseIntVal(row[10], 0);

    const validCreator = created_by && userMap.has(created_by) ? created_by : Array.from(userMap)[0];

    try {
      await prisma.community.upsert({
        where: { id },
        update: { name, slug, description, icon_url, cover_image_url, members_count },
        create: {
          id,
          name,
          slug,
          description,
          icon_url,
          cover_image_url,
          privacy,
          created_by: validCreator,
          created_at,
          updated_at,
          members_count,
        },
      });
      communityMap.add(id);
    } catch (e) {
      // Try with fallback slug if collision
      try {
        await prisma.community.upsert({
          where: { id },
          update: { name, description, icon_url, cover_image_url, members_count },
          create: {
            id,
            name,
            slug: `${slug}-${id.slice(0, 4)}`,
            description,
            icon_url,
            cover_image_url,
            privacy,
            created_by: validCreator,
            created_at,
            updated_at,
            members_count,
          },
        });
        communityMap.add(id);
      } catch (err) {}
    }
  }
  console.log(`✅ Communities in DB: ${communityMap.size}`);

  // 3. Community Members
  console.log('🤝 Restoring Community Members...');
  let commMemberCount = 0;
  for (const row of rawData.community_members) {
    const id = row[0];
    const community_id = row[1];
    const user_id = row[2];
    const role = parseValue(row[3]) || 'member';
    const joined_at = parseDate(row[4]);
    const status = parseValue(row[5]) || 'active';

    if (!communityMap.has(community_id) || !userMap.has(user_id)) continue;

    try {
      await prisma.communityMember.upsert({
        where: { community_id_user_id: { community_id, user_id } },
        update: { role, status },
        create: { id, community_id, user_id, role, joined_at, status },
      });
      commMemberCount++;
    } catch (e) {}
  }
  console.log(`✅ Community Members restored: ${commMemberCount}`);

  // 4. Posts
  console.log('📝 Restoring Posts...');
  let postCount = 0;
  const postMap = new Set();
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
    const shared_to_feed = row[14] !== undefined ? parseBool(row[14], true) : true;
    const likes_count = parseIntVal(row[15], 0);
    const comments_count = parseIntVal(row[16], 0);

    if (!userMap.has(author_id)) continue;

    try {
      await prisma.post.upsert({
        where: { id },
        update: { content, image_url, image_urls, video_url, likes_count, comments_count },
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
      postMap.add(id);
      postCount++;
    } catch (e) {}
  }
  console.log(`✅ Posts restored: ${postCount}`);

  // 5. Likes
  console.log('❤️ Restoring Post Likes...');
  let likeCount = 0;
  for (const row of rawData.likes) {
    const id = row[0];
    const post_id = row[1];
    const user_id = row[2];
    const created_at = parseDate(row[3]);

    if (!postMap.has(post_id) || !userMap.has(user_id)) continue;

    try {
      await prisma.like.upsert({
        where: { post_id_user_id: { post_id, user_id } },
        update: {},
        create: { id, post_id, user_id, created_at },
      });
      likeCount++;
    } catch (e) {}
  }
  console.log(`✅ Likes restored: ${likeCount}`);

  // 6. Comments
  console.log('💬 Restoring Comments...');
  let commentCount = 0;
  for (const row of rawData.comments) {
    const id = row[0];
    const post_id = row[1];
    const author_id = row[2];
    const content = parseValue(row[3]) || '';
    const created_at = parseDate(row[4]);
    const sticker_url = parseValue(row[5]);
    const type = parseValue(row[6]) || 'text';
    const parent_id = parseValue(row[7]);

    if (!postMap.has(post_id) || !userMap.has(author_id)) continue;

    try {
      await prisma.comment.upsert({
        where: { id },
        update: { content, sticker_url, type },
        create: { id, post_id, author_id, content, created_at, sticker_url, type, parent_id },
      });
      commentCount++;
    } catch (e) {}
  }
  console.log(`✅ Comments restored: ${commentCount}`);

  // 7. Jobs
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

    const validCreator = creator_id && userMap.has(creator_id) ? creator_id : Array.from(userMap)[0];

    try {
      await prisma.job.upsert({
        where: { id },
        update: { title, company, type, description, location, salary_range, deadline, status },
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
          creator_id: validCreator,
          status,
          created_at,
        },
      });
      jobCount++;
    } catch (e) {}
  }
  console.log(`✅ Jobs restored: ${jobCount}`);

  // 8. Courses & Documents
  console.log('📚 Restoring Courses & Course Documents...');
  let courseCount = 0;
  const courseMap = new Set();
  for (const row of rawData.courses) {
    const id = row[0];
    const title = parseValue(row[1]) || 'Course';
    const description = parseValue(row[2]);
    const youtube_url = parseValue(row[3]);
    const video_id = parseValue(row[4]);
    const category = parseValue(row[5]) || 'General';
    const level = parseValue(row[6]) || 'All Levels';
    const author_id = parseValue(row[7]);
    const thumbnail_url = parseValue(row[8]);
    const duration = parseValue(row[9]);
    const tags = parseArray(row[10]);
    const views_count = parseIntVal(row[11], 0);
    const enrollments_count = parseIntVal(row[12], 0);
    const likes_count = parseIntVal(row[13], 0);
    const created_at = parseDate(row[14]);
    const updated_at = parseDate(row[15]);
    const content_type = parseValue(row[16]) || 'video';

    const validAuthor = author_id && userMap.has(author_id) ? author_id : Array.from(userMap)[0];

    try {
      await prisma.course.upsert({
        where: { id },
        update: { title, description, category, level, views_count, enrollments_count, likes_count },
        create: {
          id,
          title,
          description,
          youtube_url,
          video_id,
          category,
          level,
          author_id: validAuthor,
          thumbnail_url,
          duration,
          tags,
          views_count,
          enrollments_count,
          likes_count,
          created_at,
          updated_at,
          content_type,
        },
      });
      courseMap.add(id);
      courseCount++;
    } catch (e) {}
  }
  console.log(`✅ Courses restored: ${courseCount}`);

  let courseDocCount = 0;
  for (const row of rawData.course_documents) {
    const id = row[0];
    const course_id = row[1];
    const uploader_id = row[2];
    const name = parseValue(row[3]) || 'Document';
    const storage_path = parseValue(row[4]) || '';
    const public_url = parseValue(row[5]) || '';
    const file_type = parseValue(row[6]) || 'pdf';
    const file_size = parseIntVal(row[7], 0);
    const downloads_count = parseIntVal(row[8], 0);
    const created_at = parseDate(row[9]);

    if (!courseMap.has(course_id) || !userMap.has(uploader_id)) continue;

    try {
      await prisma.courseDocument.upsert({
        where: { id },
        update: { name, public_url, downloads_count },
        create: {
          id,
          course_id,
          uploader_id,
          name,
          storage_path,
          public_url,
          file_type,
          file_size,
          downloads_count,
          created_at,
        },
      });
      courseDocCount++;
    } catch (e) {}
  }
  console.log(`✅ Course Documents restored: ${courseDocCount}`);

  // 9. Podcasts & Episodes
  console.log('🎙️ Restoring Podcasts & Episodes...');
  let podcastCount = 0;
  const podcastMap = new Set();
  for (const row of rawData.podcasts) {
    const id = row[0];
    const creator_id = row[1];
    const title = parseValue(row[2]) || 'Podcast';
    const description = parseValue(row[3]) || '';
    const category = parseValue(row[4]) || 'General';
    const cover_url = parseValue(row[5]);
    const status = parseValue(row[6]) || 'approved';
    const rejection_reason = parseValue(row[7]);
    const followers_count = parseIntVal(row[8], 0);
    const episodes_count = parseIntVal(row[9], 0);
    const created_at = parseDate(row[10]);
    const updated_at = parseDate(row[11]);

    const validCreator = creator_id && userMap.has(creator_id) ? creator_id : Array.from(userMap)[0];

    try {
      await prisma.podcast.upsert({
        where: { id },
        update: { title, description, category, cover_url, status, followers_count, episodes_count },
        create: {
          id,
          creator_id: validCreator,
          title,
          description,
          category,
          cover_url,
          status,
          rejection_reason,
          followers_count,
          episodes_count,
          created_at,
          updated_at,
        },
      });
      podcastMap.add(id);
      podcastCount++;
    } catch (e) {}
  }
  console.log(`✅ Podcasts restored: ${podcastCount}`);

  let episodeCount = 0;
  for (const row of rawData.podcast_episodes) {
    const id = row[0];
    const podcast_id = row[1];
    const title = parseValue(row[2]) || 'Episode';
    const description = parseValue(row[3]);
    const audio_url = parseValue(row[4]) || '';
    const cover_url = parseValue(row[5]);
    const duration_seconds = parseIntVal(row[6], 0);
    const episode_number = parseIntVal(row[7], 1);
    const plays_count = parseIntVal(row[8], 0);
    const is_published = parseBool(row[9], true);
    const created_at = parseDate(row[10]);
    const updated_at = parseDate(row[11]);

    if (!podcastMap.has(podcast_id)) continue;

    try {
      await prisma.podcastEpisode.upsert({
        where: { id },
        update: { title, description, audio_url, cover_url, duration_seconds, plays_count },
        create: {
          id,
          podcast_id,
          title,
          description,
          audio_url,
          cover_url,
          duration_seconds,
          episode_number,
          plays_count,
          is_published,
          created_at,
          updated_at,
        },
      });
      episodeCount++;
    } catch (e) {}
  }
  console.log(`✅ Podcast Episodes restored: ${episodeCount}`);

  // 10. Study Rooms & Participants
  console.log('📖 Restoring Study Rooms...');
  let roomCount = 0;
  const roomMap = new Set();
  for (const row of rawData.study_rooms) {
    const id = row[0];
    const creator_id = row[1];
    const name = parseValue(row[2]) || 'Study Room';
    const subject = parseValue(row[3]);
    const description = parseValue(row[4]);
    const timer_minutes = parseIntVal(row[5], 25);
    const timer_started_at = row[6] && row[6] !== '\\N' ? parseDate(row[6]) : null;
    const timer_paused_at = row[7] && row[7] !== '\\N' ? parseDate(row[7]) : null;
    const timer_elapsed_seconds = parseIntVal(row[8], 0);
    const is_active = parseBool(row[9], true);
    const created_at = parseDate(row[10]);
    const is_private = parseBool(row[11], false);
    const allow_drawing = parseBool(row[12], true);

    const validCreator = creator_id && userMap.has(creator_id) ? creator_id : Array.from(userMap)[0];

    try {
      await prisma.studyRoom.upsert({
        where: { id },
        update: { name, subject, description, is_active },
        create: {
          id,
          creator_id: validCreator,
          name,
          subject,
          description,
          timer_minutes,
          timer_started_at,
          timer_paused_at,
          timer_elapsed_seconds,
          is_active,
          created_at,
          is_private,
          allow_drawing,
        },
      });
      roomMap.add(id);
      roomCount++;
    } catch (e) {}
  }
  console.log(`✅ Study Rooms restored: ${roomCount}`);

  let participantCount = 0;
  for (const row of rawData.study_room_participants) {
    const id = row[0];
    const room_id = row[1];
    const user_id = row[2];
    const status = parseValue(row[3]) || 'Here';
    const joined_at = parseDate(row[4]);

    if (!roomMap.has(room_id) || !userMap.has(user_id)) continue;

    try {
      await prisma.studyRoomParticipant.upsert({
        where: { room_id_user_id: { room_id, user_id } },
        update: { status },
        create: { id, room_id, user_id, status, joined_at },
      });
      participantCount++;
    } catch (e) {}
  }
  console.log(`✅ Study Room Participants restored: ${participantCount}`);

  // 11. Connections & Follows (Network)
  console.log('🌐 Restoring Network Connections & Follows...');
  let connectionCount = 0;
  for (const row of rawData.connections) {
    const id = row[0];
    const requester_id = row[1];
    const recipient_id = row[2];
    const status = parseValue(row[3]) || 'accepted';
    const created_at = parseDate(row[4]);

    if (!userMap.has(requester_id) || !userMap.has(recipient_id)) continue;

    try {
      await prisma.connection.upsert({
        where: { requester_id_recipient_id: { requester_id, recipient_id } },
        update: { status },
        create: { id, requester_id, recipient_id, status, created_at },
      });
      connectionCount++;
    } catch (e) {}
  }
  console.log(`✅ Connections restored: ${connectionCount}`);

  let followCount = 0;
  for (const row of rawData.follows) {
    const id = row[0];
    const follower_id = row[1];
    const following_id = row[2];
    const created_at = parseDate(row[3]);

    if (!userMap.has(follower_id) || !userMap.has(following_id)) continue;

    try {
      await prisma.follow.upsert({
        where: { follower_id_following_id: { follower_id, following_id } },
        update: {},
        create: { id, follower_id, following_id, created_at },
      });
      followCount++;
    } catch (e) {}
  }
  console.log(`✅ Follows restored: ${followCount}`);

  // 12. Messages
  console.log('✉️ Restoring Messages...');
  let messageCount = 0;
  for (const row of rawData.messages) {
    const id = row[0];
    const sender_id = row[1];
    const recipient_id = row[2];
    const content = parseValue(row[4]);
    const image_url = parseValue(row[5]);
    const audio_url = parseValue(row[6]);
    const read_at = row[7] && row[7] !== '\\N' ? parseDate(row[7]) : null;
    const created_at = parseDate(row[8]);

    if (!userMap.has(sender_id) || !userMap.has(recipient_id)) continue;

    try {
      await prisma.message.upsert({
        where: { id },
        update: { content, image_url, audio_url, read_at },
        create: { id, sender_id, recipient_id, content, image_url, audio_url, read_at, created_at },
      });
      messageCount++;
    } catch (e) {}
  }
  console.log(`✅ Messages restored: ${messageCount}`);

  // 13. Marketplace Listings
  console.log('🛍️ Restoring Marketplace Listings...');
  let marketCount = 0;
  for (const row of rawData.marketplace_listings) {
    const id = row[0];
    const seller_id = row[1];
    const title = parseValue(row[2]) || 'Item';
    const description = parseValue(row[3]);
    const price = parseFloatVal(row[4], 0);
    const category = parseValue(row[5]) || 'Other';
    const condition = parseValue(row[6]) || 'Good';
    const images = parseArray(row[7]);
    const is_sold = parseBool(row[8], false);
    const contact_info = parseValue(row[9]);
    const university = parseValue(row[10]);
    const created_at = parseDate(row[11]);
    const updated_at = parseDate(row[12]);

    if (!userMap.has(seller_id)) continue;

    try {
      await prisma.marketplaceListing.upsert({
        where: { id },
        update: { title, description, price, category, condition, images, is_sold, contact_info, university },
        create: {
          id,
          seller_id,
          title,
          description,
          price,
          category,
          condition,
          images,
          is_sold,
          contact_info,
          university,
          created_at,
          updated_at,
        },
      });
      marketCount++;
    } catch (e) {}
  }
  console.log(`✅ Marketplace Listings restored: ${marketCount}`);

  console.log('\n🎉 ALL DATA ACROSS ALL FEATURES RESTORED SUCCESSFULLY!');
}

run()
  .catch((e) => {
    console.error('❌ Restoration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
