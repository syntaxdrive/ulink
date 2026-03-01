import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const parser = new Parser({
    customFields: {
        item: ['description', 'content:encoded', 'media:content']
    }
});

// Configure bot profile ID
// The user will need to replace this with the actual bot UUID from the DB
const BOT_EMAIL = 'unilinkrep@gmail.com';

const FEEDS = [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Mozilla Hacks', url: 'https://hacks.mozilla.org/feed/' },
    { name: 'CSS Tricks', url: 'https://css-tricks.com/feed/' },
];

async function getOrCreateBotProfile() {
    let { data: bot, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', BOT_EMAIL)
        .single();

    if (fetchError || !bot) {
        console.log(`Bot user not found for email ${BOT_EMAIL}. Ensure a user with this email is created via Supabase Auth first.`);
        // Note: For actual posting, an AUTH session might be needed depending on RLS.
        // Assuming we are bypassing basic RLS or using service key for pure scripts usually,
        // but here we are using anon key, so we need to be careful with RLS.
        // If RLS blocks anon insert to posts, we might need a service role key or dummy auth.
        return null; // For safety, we exit if we can't find it normally.
    }

    return bot.id;
}


async function fetchAndPostNews() {
    console.log('Starting news fetch...');
    const botId = await getOrCreateBotProfile();

    if (!botId) {
        console.error('Failed to resolve Bot ID. Exiting.');
        return;
    }

    // Pick a random feed to avoid spamming all at once
    const feedSource = FEEDS[Math.floor(Math.random() * FEEDS.length)];
    console.log(`Fetching from ${feedSource.name} (${feedSource.url})...`);

    try {
        const feed = await parser.parseURL(feedSource.url);
        if (!feed.items || feed.items.length === 0) {
            console.log('No items found in feed.');
            return;
        }

        // Pick a random recent item
        const recentItems = feed.items.slice(0, 5);
        const item = recentItems[Math.floor(Math.random() * recentItems.length)];

        console.log(`Selected article: ${item.title}`);

        // Check if we already posted this link recently (basic deduping by checking content)
        const { data: existingPosts } = await supabase
            .from('posts')
            .select('id')
            .eq('author_id', botId)
            .ilike('content', `%${item.link}%`)
            .limit(1);

        if (existingPosts && existingPosts.length > 0) {
            console.log('Article already posted recently. Skipping.');
            return;
        }

        // Format the post content
        const content = `📰 **Tech News via ${feedSource.name}**\n\n${item.title}\n\n${item.contentSnippet?.substring(0, 150) || ''}...\n\nRead more: ${item.link}\n\n#${feedSource.name.replace(/\s+/g, '')} #TechNews #StudentLife #Programming`;

        // Extract Image (Basic attempt)
        let imageUrl = null;
        if (item['media:content'] && item['media:content'].$) {
            imageUrl = item['media:content'].$.url;
        } else if (item['content:encoded'] || item.content) {
            const html = item['content:encoded'] || item.content;
            const imgMatch = html?.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
                imageUrl = imgMatch[1];
            }
        }

        console.log('Prepared post:');
        console.log(content);
        if (imageUrl) console.log('Found image:', imageUrl);

        // Insert Post
        const { error: insertError } = await supabase
            .from('posts')
            .insert({
                author_id: botId,
                content: content,
                image_url: imageUrl,
                image_urls: imageUrl ? [imageUrl] : null,
            });

        if (insertError) {
            console.error('Error inserting post:', insertError);
        } else {
            console.log('Successfully posted news article to feed!');
        }

    } catch (err) {
        console.error(`Error processing feed ${feedSource.name}:`, err);
    }
}

fetchAndPostNews().catch(console.error);
