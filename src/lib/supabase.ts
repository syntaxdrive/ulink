import { createClient } from '@supabase/supabase-js';

/**
 * Typed Supabase client with an immediate non-blocking mock fetch.
 * 
 * All types across the application (PostgrestResponse, User, etc.) are 100% preserved.
 * All network calls resolve immediately with safe empty responses without hitting dead DNS.
 * Data and auth now flow through the NestJS backend via src/lib/api.ts.
 */
export const supabase = createClient(
  'https://placeholder-offline.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIn0.dummy_sig',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: async () =>
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    },
  }
);
