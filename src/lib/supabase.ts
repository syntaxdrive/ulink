import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Use PKCE flow instead of implicit flow for better security
        // This prevents access tokens from appearing in the URL
        flowType: 'pkce',
        // Automatically detect the redirect URL
        detectSessionInUrl: true,
        // Store session in local storage
        storage: window.localStorage,
        // Auto refresh tokens
        autoRefreshToken: true,
        // Persist session across page refreshes
        persistSession: true,
    }
});
