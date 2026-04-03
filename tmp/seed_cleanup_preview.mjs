import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter(l => l && l.includes('=') && !l.trim().startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)])
);

const txt = fs.readFileSync('scripts/seed_engagement_posts.mjs', 'utf8');
const rx = /content:\s*'((?:\\'|[^'])*)'/g;
const contents = [];
let m;
while ((m = rx.exec(txt)) !== null) {
  contents.push(m[1].replace(/\\'/g, "'"));
}
const unique = [...new Set(contents)];

const sb = createClient(env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const { data, error } = await sb
  .from('posts')
  .select('id,author_id,created_at,content')
  .in('content', unique)
  .gte('created_at', since);

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log('seeded_match_count', data.length);
console.log('sample', data.slice(0, 5).map(p => ({
  id: p.id,
  author_id: p.author_id,
  created_at: p.created_at,
  content: (p.content || '').slice(0, 60)
})));
