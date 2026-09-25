const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding rich campus marketplace items, courses, and podcasts...');

  const users = await prisma.user.findMany({ take: 10 });
  if (users.length === 0) return;

  const u1 = users[0].id;
  const u2 = users[1]?.id || u1;
  const u3 = users[2]?.id || u1;
  const u4 = users[3]?.id || u1;

  // 1. Marketplace Listings
  const items = [
    {
      seller_id: u1,
      title: 'MacBook Air M1 (8GB / 256GB Space Gray) - Clean Condition',
      description: 'Used for 1 year in computer science department. Battery health 91%. Comes with original 30W charger and type-C hub.',
      price: 450000,
      category: 'Electronics',
      condition: 'Like New',
      images: [
        'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/812264/pexels-photo-812264.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      contact_info: '+2348012345678',
      university: 'University of Lagos (UNILAG)',
      is_sold: false,
    },
    {
      seller_id: u2,
      title: 'Essential Calculus: Early Transcendentals (8th Ed) + Solution Manual',
      description: 'Standard textbook for MTH 101/102 and engineering maths. Minimal highlighting, perfect pages.',
      price: 8500,
      category: 'Textbooks',
      condition: 'Good',
      images: [
        'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      contact_info: '+2348023456789',
      university: 'University of Ibadan',
      is_sold: false,
    },
    {
      seller_id: u3,
      title: 'Sony WH-1000XM4 Wireless Noise-Cancelling Headphones',
      description: 'Lifesaver for reading in noisy hostel rooms or library. Comes with carry pouch and aux cord.',
      price: 180000,
      category: 'Electronics',
      condition: 'Like New',
      images: [
        'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      contact_info: '+2348034567890',
      university: 'Covenant University',
      is_sold: false,
    },
    {
      seller_id: u4,
      title: 'Compact Bedside Hostel Refrigerator (Haier Thermocool 60L)',
      description: 'Super low power consumption, works smoothly on low voltage / generator. Moving off-campus so letting it go.',
      price: 75000,
      category: 'Housing',
      condition: 'Good',
      images: [
        'https://images.pexels.com/photos/5824883/pexels-photo-5824883.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      contact_info: '+2348045678901',
      university: 'University of Nigeria, Nsukka (UNN)',
      is_sold: false,
    },
    {
      seller_id: u1,
      title: 'Casio fx-991EX ClassWiz Scientific Calculator (Original)',
      description: 'Allowed for all faculty and departmental exams. Clear matrix display, solar powered backup.',
      price: 15000,
      category: 'Electronics',
      condition: 'Like New',
      images: [
        'https://images.pexels.com/photos/220301/pexels-photo-220301.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      contact_info: '+2348056789012',
      university: 'Obafemi Awolowo University (OAU)',
      is_sold: false,
    },
    {
      seller_id: u2,
      title: 'Professional CV / Resume Redesign & Tech Interview Prep Service',
      description: 'Final year student with incoming SWE offer at Moniepoint. I will restructure your CV and run 1-on-1 mock interviews.',
      price: 12000,
      category: 'Services',
      condition: 'New',
      images: [
        'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800',
      ],
      contact_info: '+2348067890123',
      university: 'University of Lagos (UNILAG)',
      is_sold: false,
    },
  ];

  for (const item of items) {
    await prisma.marketplaceListing.create({ data: item });
  }
  console.log(`✅ Seeded ${items.length} marketplace listings.`);

  // 2. Extra Courses
  const courses = [
    {
      author_id: u1,
      title: 'Fullstack Web Development with Next.js 14 & Prisma',
      description: 'Comprehensive project-based crash course for university students looking to break into remote tech jobs.',
      category: 'Tech & Engineering',
      level: 'Beginner',
      youtube_url: 'https://youtu.be/k9WwZ5v2p5U',
      video_id: 'k9WwZ5v2p5U',
      thumbnail_url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '4h 30m',
      tags: ['Nextjs', 'Typescript', 'Prisma', 'React'],
      views_count: 342,
      enrollments_count: 58,
      likes_count: 42,
    },
    {
      author_id: u2,
      title: 'Financial Accounting & Cost Analysis for Non-Majors',
      description: 'Master balance sheets, profit & loss, and budget forecasting for university tests and startup founders.',
      category: 'Business & Finance',
      level: 'All Levels',
      youtube_url: 'https://youtu.be/yYX4bvQVqBo',
      video_id: 'yYX4bvQVqBo',
      thumbnail_url: 'https://images.pexels.com/photos/53621/calculator-calculation-insurance-finance-53621.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '2h 15m',
      tags: ['Accounting', 'Finance', 'Business', 'Excel'],
      views_count: 215,
      enrollments_count: 39,
      likes_count: 28,
    },
    {
      author_id: u3,
      title: 'UI/UX Design Masterclass: From Wireframes to High-Fidelity in Figma',
      description: 'Learn modern design systems, typography, color psychology, and prototyping user interfaces.',
      category: 'Design & Creative',
      level: 'Intermediate',
      youtube_url: 'https://youtu.be/FTFaQWZBqQ8',
      video_id: 'FTFaQWZBqQ8',
      thumbnail_url: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration: '3h 45m',
      tags: ['Figma', 'UI/UX', 'Product Design'],
      views_count: 489,
      enrollments_count: 94,
      likes_count: 67,
    },
  ];

  for (const c of courses) {
    await prisma.course.create({ data: c });
  }
  console.log(`✅ Seeded ${courses.length} courses.`);

  // 3. Extra Podcasts & Episodes
  const pod = await prisma.podcast.create({
    data: {
      creator_id: u1,
      title: 'Campus Hustle & Code',
      description: 'Weekly conversations with student founders, tech interns, and campus creators navigating school and ambitious careers in Nigeria.',
      category: 'Technology & Startups',
      cover_url: 'https://images.pexels.com/photos/6954162/pexels-photo-6954162.jpeg?auto=compress&cs=tinysrgb&w=800',
      status: 'approved',
      followers_count: 85,
      episodes_count: 2,
    },
  });

  await prisma.podcastEpisode.create({
    data: {
      podcast_id: pod.id,
      title: 'Ep 1: How I Landed an International SWE Internship as a 300L Student',
      description: 'Lessons on open source, GitHub portfolios, cold emails, and staying consistent.',
      audio_url: 'https://res.cloudinary.com/dh5odmxyi/raw/upload/v1773169317/ulink/podcasts/audio/solas__1691511908_ug41cq.m4a',
      cover_url: 'https://images.pexels.com/photos/6954162/pexels-photo-6954162.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration_seconds: 1420,
      episode_number: 1,
      plays_count: 140,
      is_published: true,
    },
  });

  await prisma.podcastEpisode.create({
    data: {
      podcast_id: pod.id,
      title: 'Ep 2: Balancing First Class CGPA with Running a Campus Agency',
      description: 'Time audit strategies, dealing with exam stress, and delegating effectively.',
      audio_url: 'https://res.cloudinary.com/dh5odmxyi/raw/upload/v1773169317/ulink/podcasts/audio/solas__1691511908_ug41cq.m4a',
      cover_url: 'https://images.pexels.com/photos/6954162/pexels-photo-6954162.jpeg?auto=compress&cs=tinysrgb&w=800',
      duration_seconds: 1850,
      episode_number: 2,
      plays_count: 98,
      is_published: true,
    },
  });

  console.log('✅ Seeded extra podcast and episodes.');
  console.log('🎉 Enrichment complete!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
