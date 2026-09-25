import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

const STUDENTS = [
  {
    name: 'Tobi Adeyemi',
    username: 'tobi_adeyemi',
    email: 'tobi@unilink.ng',
    university: 'University of Lagos (UNILAG)',
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    headline: 'Computer Science, 400L | Full-Stack Dev',
    is_verified: true,
  },
  {
    name: 'Amaka Okonkwo',
    username: 'amaka_codes',
    email: 'amaka@unilink.ng',
    university: 'University of Nigeria, Nsukka (UNN)',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    headline: 'Pharmacy, 300L | Tech & Health Enthusiast',
    is_verified: true,
  },
  {
    name: 'Fatima Bello',
    username: 'fatima_bello',
    email: 'fatima@unilink.ng',
    university: 'Ahmadu Bello University (ABU Zaria)',
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    headline: 'Economics, 400L | Future Investment Banker',
    is_verified: true,
  },
  {
    name: 'Chidi Nwosu',
    username: 'chidi_nwosu',
    email: 'chidi@unilink.ng',
    university: 'Covenant University',
    avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    headline: 'Electrical Engineering | Robotics Club Lead',
    is_verified: true,
  },
  {
    name: 'Khadijat Sanni',
    username: 'khadijat_s',
    email: 'khadijat@unilink.ng',
    university: 'University of Ibadan (UI)',
    avatar_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    headline: 'Law, 500L | Debate Society President',
    is_verified: true,
  },
];

const SEED_POSTS = [
  {
    authorIdx: 0,
    content: 'Abeg who else is tired of lecturers that give 6 courses in one semester? 😭 My brain don full honestly! How are you guys coping with test season?',
    likes: 42,
    comments: 18,
    image: null,
  },
  {
    authorIdx: 1,
    content: 'First week of school and I already forgot why I wanted to come here lmao. But we push! Here is our current study setup in the pharmacy block 📚✨',
    likes: 89,
    comments: 24,
    image: CAMPUS_IMAGES.studying_group,
  },
  {
    authorIdx: 3,
    content: 'Drop one free course or YouTube channel that ACTUALLY helped your career or grades. Not the ones people just recommend for clout, the real ones that changed everything for you 👇',
    likes: 124,
    comments: 67,
    image: null,
  },
  {
    authorIdx: 2,
    content: 'Internships that pay 0 Naira in 2026: is it a smart sacrifice for experience, or are companies just exploiting students? Asking for a friend who got an offer today.',
    likes: 156,
    comments: 89,
    image: null,
  },
  {
    authorIdx: 4,
    content: 'Two focused hours beats six hours of reading with your phone in your hand. That is the whole secret to 4.5+ CGPA. Put your phone in another room and see the magic.',
    likes: 210,
    comments: 35,
    image: CAMPUS_IMAGES.library,
  },
  {
    authorIdx: 0,
    content: 'Honest question for the CS and engineering folks: 8GB RAM in 2026, is that surviving or suffering? Because Android Studio is currently cooking my laptop 🔥💻',
    likes: 98,
    comments: 44,
    image: CAMPUS_IMAGES.laptop_study,
  },
  {
    authorIdx: 1,
    content: 'If you won a scholarship abroad, what is the #1 thing you would advise students to focus on in their personal statement? Let us build each other up 🙏🇳🇬',
    likes: 178,
    comments: 52,
    image: null,
  },
  {
    authorIdx: 3,
    content: 'Hostel life vs living off-campus: I need the genuine unfiltered pros and cons. Cooking, power supply, and sanity balance. Drop your experience!',
    likes: 74,
    comments: 31,
    image: CAMPUS_IMAGES.campus_walk,
  },
  {
    authorIdx: 2,
    content: 'Project defense question that almost finished my guy today: "What would you change about your entire methodology?" 😭 Nobody prepares you for that kind of emotional damage.',
    likes: 188,
    comments: 63,
    image: CAMPUS_IMAGES.teamwork,
  },
  {
    authorIdx: 4,
    content: 'Your CGPA is not a life sentence. Breathe. Some of the most brilliant and successful alumni from our department had a 2.something. Keep building your actual skills.',
    likes: 312,
    comments: 48,
    image: null,
  },
  {
    authorIdx: 0,
    content: 'Python or TypeScript for a Nigerian student who wants to start freelancing this semester? Looking for practical advice from seniors earning currently.',
    likes: 145,
    comments: 72,
    image: CAMPUS_IMAGES.coding,
  },
  {
    authorIdx: 1,
    content: '14-day library challenge: 2 hours of quiet reading every day starting tomorrow. Who is joining? Drop a ✋ in the comments and let us hold each other accountable!',
    likes: 230,
    comments: 86,
    image: CAMPUS_IMAGES.lecture_hall,
  },
];

async function main() {
  console.log('🌱 Seeding vibrant student accounts and posts into Neon PostgreSQL...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create or update Students
  const createdUsers: any[] = [];
  for (const s of STUDENTS) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        username: s.username,
        university: s.university,
        avatar_url: s.avatar_url,
        headline: s.headline,
        is_verified: s.is_verified,
      },
      create: {
        name: s.name,
        username: s.username,
        email: s.email,
        password_hash: passwordHash,
        university: s.university,
        avatar_url: s.avatar_url,
        headline: s.headline,
        is_verified: s.is_verified,
        role: 'Student',
        points: 250,
      },
    });
    createdUsers.push(user);
    console.log(`  👤 Student: ${user.name} (@${user.username})`);
  }

  // Also ensure test student exists
  await prisma.user.upsert({
    where: { email: 'teststudent@unilink.ng' },
    update: {},
    create: {
      name: 'Daniel Test',
      username: 'daniel_test',
      email: 'teststudent@unilink.ng',
      password_hash: passwordHash,
      university: 'University of Lagos (UNILAG)',
      is_verified: true,
      role: 'Student',
      points: 500,
    },
  });

  // 2. Insert Posts
  console.log('📝 Seeding posts...');
  let i = 0;
  for (const p of SEED_POSTS) {
    const author = createdUsers[p.authorIdx % createdUsers.length];

    // Stagger dates so they look natural over past few days
    const createdDate = new Date(Date.now() - (i * 4 * 60 * 60 * 1000));
    i++;

    await prisma.post.create({
      data: {
        author_id: author.id,
        content: p.content,
        image_url: p.image,
        image_urls: p.image ? [p.image] : [],
        likes_count: p.likes,
        comments_count: p.comments,
        shared_to_feed: true,
        created_at: createdDate,
      },
    });
  }

  const count = await prisma.post.count();
  console.log(`✅ Finished! Total posts in database: ${count}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
