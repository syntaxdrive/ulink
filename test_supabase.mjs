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
    console.log('--- Inspecting connections columns ---');
    const { data: conns, error: connErr } = await supabase.from('connections').select('*').limit(1);
    console.log('connErr:', connErr);

    console.log('\n--- Inspecting messages columns ---');
    const { data: msgs, error: msgErr } = await supabase.from('messages').select('*').limit(1);
    console.log('msgErr:', msgErr);

    // Check if there are messages or connections in csv files
    console.log('\n--- Checking profiles sample ---');
    const { data: profs } = await supabase.from('profiles').select('id, name, username').limit(3);
    console.log('Sample profiles:', profs);
}
test();
