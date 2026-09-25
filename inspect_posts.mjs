import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);

async function inspectPosts() {
    const { data: posts, error } = await supabase.from('posts').select('*').limit(1);
    if (posts && posts.length > 0) {
        console.log('Posts columns:', Object.keys(posts[0]));
    }
}
inspectPosts();
