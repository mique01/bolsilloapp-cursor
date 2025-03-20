import { createClient } from '@supabase/supabase-js';

// These environment variables will need to be set in your .env.local file
// and in production environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock client if environment variables are missing
const isBrowser = typeof window !== 'undefined';
let supabase;

if (supabaseUrl && supabaseAnonKey) {
  // Create a real Supabase client when we have credentials
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a mock client that uses localStorage when credentials are missing
  // This prevents build errors while still allowing the app to function in development
  console.warn('Supabase URL or Anonymous Key is missing. Using mock client with localStorage fallback.');
  supabase = {
    auth: {
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signIn: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: null }) }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

export { supabase }; 