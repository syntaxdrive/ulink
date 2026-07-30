import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Migration from Supabase to Prisma...');

    // 1. Migrate Profiles -> Users
    console.log('Fetching Profiles...');
    const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*');
    if (profileErr) throw profileErr;

    console.log(`Found ${profiles.length} profiles. Migrating to Users...`);
    
    // We generate a random password for migrated users since we can't extract it from Supabase auth.users
    const defaultPassword = await bcrypt.hash('UlinkMigration2026!', 10);

    for (const p of profiles) {
        await prisma.user.upsert({
            where: { id: p.id },
            update: {},
            create: {
                id: p.id,
                email: p.email,
                name: p.name,
                username: p.username,
                role: p.role,
                password: defaultPassword,
                university: p.university,
                avatar_url: p.avatar_url,
                background_url: p.background_image_url,
                headline: p.headline,
                location: p.location,
                about: p.about,
                points: p.points || 0,
                is_verified: p.is_verified || false,
                is_admin: p.is_admin || false,
            }
        });
    }
    console.log('✅ Profiles migrated.');

    // 2. Migrate Posts
    console.log('Fetching Posts...');
    const { data: posts, error: postErr } = await supabase.from('posts').select('*');
    if (!postErr && posts) {
        for (const post of posts) {
            await prisma.post.upsert({
                where: { id: post.id },
                update: {},
                create: {
                    id: post.id,
                    user_id: post.author_id,
                    content: post.content,
                    image_url: post.image_url,
                    created_at: new Date(post.created_at)
                }
            });
        }
        console.log('✅ Posts migrated.');
    }

    // 3. Migrate Messages
    console.log('Fetching Messages...');
    const { data: messages, error: msgErr } = await supabase.from('messages').select('*');
    if (!msgErr && messages) {
        for (const msg of messages) {
            await prisma.message.upsert({
                where: { id: msg.id },
                update: {},
                create: {
                    id: msg.id,
                    sender_id: msg.sender_id,
                    recipient_id: msg.recipient_id,
                    content: msg.content,
                    image_url: msg.image_url,
                    created_at: new Date(msg.created_at),
                    read_at: msg.read_at ? new Date(msg.read_at) : null
                }
            });
        }
        console.log('✅ Messages migrated.');
    }

    console.log('🎉 Migration Completed Successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
