
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public');
const BASE_URL = 'https://unilink.ng';

// --- LOAD ENVIRONMENT VARIABLES ---
function loadEnv() {
  const envPaths = ['.env.local', '.env.production', '.env'];
  for (const envFile of envPaths) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      console.log(`📖 Loading environment from ${envFile}`);
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[key] = value;
        }
      });
      break; // Stop after first match (standard Vite behavior)
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
  console.log('💡 Ensure you have a .env.local file with these values.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  console.log('🚀 Starting dynamic sitemap generation...');

  const staticRoutes = [
    '',
    '/app/feed',
    '/app/network',
    '/app/marketplace',
    '/app/communities',
    '/app/podcasts',
    '/app/story',
    '/app/jobs'
  ];

  const urls = [...staticRoutes];

  try {
    // 1. Fetch Public Posts
    console.log('Fetching posts...');
    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .limit(1000); // Index top 1000 posts for SEO
    if (posts) posts.forEach(p => urls.push(`/app/post/${p.id}`));

    // 2. Fetch Public Communities
    console.log('Fetching communities...');
    const { data: communities } = await supabase
      .from('communities')
      .select('slug')
      .eq('privacy', 'public');
    if (communities) communities.forEach(c => urls.push(`/app/communities/${c.slug}`));

    // 3. Fetch Profiles
    console.log('Fetching profiles...');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, id')
      .limit(500);
    if (profiles) profiles.forEach(p => urls.push(`/app/profile/${p.username || p.id}`));

    // 4. Fetch Podcasts
    console.log('Fetching podcasts...');
    const { data: podcasts } = await supabase
      .from('podcasts')
      .select('id')
      .eq('status', 'approved');
    if (podcasts) podcasts.forEach(p => urls.push(`/app/podcasts/${p.id}`));

    // 5. Build the XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>daily</changefreq>
    <priority>${url === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

    const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemapXml);

    console.log(`✅ Sitemap generated successfully with ${urls.length} URLs!`);
    console.log(`📍 Saved to: ${outputPath}`);

  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    process.exit(1);
  }
}

generateSitemap();
