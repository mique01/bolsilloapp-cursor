import { createClient } from '@supabase/supabase-js';
import { SupabaseClientType, MockSupabaseClient } from '@/lib/types/supabase';

// For client-side usage
const supabaseUrl = process?.env?.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock client if environment variables are missing
const isBrowser = typeof window !== 'undefined';
let supabase: SupabaseClientType;

if (supabaseUrl && supabaseAnonKey) {
  // Create a real Supabase client when we have credentials
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a mock client that uses localStorage when credentials are missing
  // This prevents build errors while still allowing the app to function in development
  console.warn('Supabase URL or Anonymous Key is missing. Using mock client with localStorage fallback.');
  
  // Cast to any first to avoid type errors during object creation
  const mockClient: MockSupabaseClient = {
    auth: {
      signUp: async (options: { email: string; password: string }) => 
        ({ data: null, error: new Error('Supabase not configured') }),
      signIn: async (options: { email: string; password: string }) => 
        ({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: async (options: { email: string; password: string }) => 
        ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      resetPasswordForEmail: async (email: string) => 
        ({ data: null, error: new Error('Supabase not configured') }),
      updateUser: async (options: { password: string }) => 
        ({ data: null, error: new Error('Supabase not configured') })
    },
    from: (table: string) => ({
      select: () => ({ eq: () => ({ data: [], error: null }) }),
      insert: () => ({ data: null, error: null }), 
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: any) => ({ data: null, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
        download: async (path: string) => ({ data: null, error: null }),
        list: async (path?: string, options?: any) => ({ data: null, error: null }),
        remove: async (paths: string | string[]) => ({ data: null, error: null })
      }),
    }
  };
  
  supabase = mockClient;
}

// Function to get URL for Supabase Storage
export function getStorageUrl(bucket: string, path: string): string {
  return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` : '';
}

export { supabase }; 