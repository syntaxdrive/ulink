import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- check study_room_messages ---');
    const m = await supabase.from('study_room_messages')
        .select('*, profiles:user_id(name, avatar_url)')
        .limit(1);
    console.log('messages:', m.error ? m.error : m.data);

    console.log('--- check study_room_documents ---');
    const d = await supabase.from('study_room_documents')
        .select('*, profiles:shared_by(name)')
        .limit(1);
    console.log('documents:', d.error ? d.error : d.data);

    console.log('--- check study_room_participants ---');
    const p = await supabase.from('study_room_participants')
        .select('*, profiles:user_id(name, username, avatar_url, university)')
        .limit(1);
    console.log('participants:', p.error ? p.error : p.data);
}

check();
