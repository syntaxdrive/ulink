import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});
const supabase = createClient(url, key);
async function test() {
    console.log('Testing communities query');
    const { data, error } = await supabase.from('communities').select('*, community_members(count)');
    console.log('Error:', JSON.stringify(error, null, 2));
    console.log('Data count:', data?.length);
    if (data) {
        console.log('Sample item:', data[0]);
    }
}
test();
