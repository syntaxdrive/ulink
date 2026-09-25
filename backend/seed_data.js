const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found to create podcasts with.');
    return;
  }

  // Create Podcast 1
  const podcast1 = await prisma.podcast.create({
    data: {
      title: 'Tech Talk Daily',
      description: 'Daily tech news and discussions',
      category: 'Technology',
      cover_url: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=500&h=500&fit=crop',
      creator_id: user.id,
      status: 'approved',
    }
  });

  await prisma.podcastEpisode.create({
    data: {
      podcast_id: podcast1.id,
      title: 'Episode 1: The Future of AI',
      description: 'Discussing AI advancements.',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration_seconds: 2700,
      is_published: true,
    }
  });

  // Create Podcast 2
  const podcast2 = await prisma.podcast.create({
    data: {
      title: 'Campus Life',
      description: 'Everything happening on campus.',
      category: 'Education',
      cover_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=500&fit=crop',
      creator_id: user.id,
      status: 'approved',
    }
  });

  await prisma.podcastEpisode.create({
    data: {
      podcast_id: podcast2.id,
      title: 'Episode 1: Welcome to the semester',
      description: 'Get ready for fall.',
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration_seconds: 1800,
      is_published: true,
    }
  });
  
  // Create a Study Room
  await prisma.studyRoom.create({
    data: {
      name: 'Late Night Coding',
      subject: 'Computer Science',
      description: 'Working on final projects.',
      creator_id: user.id,
      is_active: true,
      participants: {
        create: [
          {
            user_id: user.id,
            status: 'Here'
          }
        ]
      }
    }
  });

  console.log('Successfully seeded 2 podcasts, episodes, and 1 study room.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
