import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function check() {
    const { error } = await supabase.from('profiles').select('onboarding_complete').limit(1);
    console.log('onboarding_complete Error:', error?.message || 'none');
    
    const { data: d2 } = await supabase.from('profiles').select('*').limit(1);
    console.log('All columns:', d2 ? Object.keys(d2[0]).join(', ') : 'none');
}
check();
