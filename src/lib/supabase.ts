import { createClient } from '@supabase/supabase-js';
import { SupabaseClientType, MockSupabaseClient } from './types/supabase';

// Función para obtener las credenciales de Supabase de manera segura
const getSupabaseCredentials = () => {
  const supabaseUrl = process?.env?.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return { supabaseUrl, supabaseAnonKey };
};

// Variable para almacenar la instancia de Supabase (patrón singleton)
let supabaseInstance: SupabaseClientType | null = null;

/**
 * Creates a Supabase client instance or returns a mock if env vars are missing
 * Safe for SSR and build-time usage
 */
const createSupabaseClient = (): SupabaseClientType => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();

  if (supabaseUrl && supabaseAnonKey) {
    // Only create a real client if both URL and key are provided
    return createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase URL or Anonymous Key is missing. Using mock client for development.');
    
    // Create a mock client that's compatible with the Supabase interface
    const mockClient: MockSupabaseClient = {
      auth: {
        signUp: async ({ email, password }: { email: string; password: string }) => {
          console.warn('Using mock Supabase client - signUp');
          return { data: null, error: new Error('Mock client - signUp not implemented') };
        },
        signIn: async ({ email, password }: { email: string; password: string }) => {
          console.warn('Using mock Supabase client - signIn');
          return { data: null, error: new Error('Mock client - signIn not implemented') };
        },
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
          console.warn('Using mock Supabase client - signInWithPassword');
          return { data: null, error: new Error('Mock client - signInWithPassword not implemented') };
        },
        signOut: async () => {
          console.warn('Using mock Supabase client - signOut');
          return { error: null };
        },
        onAuthStateChange: (callback: (event: string, session: any) => void) => {
          console.warn('Using mock Supabase client - onAuthStateChange');
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getSession: async () => {
          console.warn('Using mock Supabase client - getSession');
          return { data: { session: null }, error: null };
        },
        getUser: async () => {
          console.warn('Using mock Supabase client - getUser');
          return { data: { user: null }, error: null };
        },
        resetPasswordForEmail: async (email: string) => {
          console.warn('Using mock Supabase client - resetPasswordForEmail');
          return { data: null, error: new Error('Mock client - resetPasswordForEmail not implemented') };
        },
        updateUser: async ({ password }: { password: string }) => {
          console.warn('Using mock Supabase client - updateUser');
          return { data: null, error: new Error('Mock client - updateUser not implemented') };
        }
      },
      from: (table: string) => {
        const filterBuilder = (data: any = [], error: any = null) => {
          return {
            eq: () => filterBuilder(),
            neq: () => filterBuilder(),
            gt: () => filterBuilder(),
            lt: () => filterBuilder(),
            gte: () => filterBuilder(),
            lte: () => filterBuilder(),
            like: () => filterBuilder(),
            ilike: () => filterBuilder(),
            is: () => filterBuilder(),
            in: () => filterBuilder(),
            contains: () => filterBuilder(),
            containedBy: () => filterBuilder(),
            rangeGt: () => filterBuilder(),
            rangeLt: () => filterBuilder(),
            rangeGte: () => filterBuilder(),
            rangeLte: () => filterBuilder(),
            textSearch: () => filterBuilder(),
            filter: () => filterBuilder(),
            not: () => filterBuilder(),
            or: () => filterBuilder(),
            and: () => filterBuilder(),
            order: () => filterBuilder(),
            limit: () => filterBuilder(),
            range: () => filterBuilder(),
            single: () => ({ data: null, error: null }),
            maybeSingle: () => ({ data: null, error: null }),
            select: () => filterBuilder(),
            then: () => Promise.resolve({ data, error })
          };
        };

        return {
          select: (columns?: string) => filterBuilder([]),
          insert: (data: any) => filterBuilder([]),
          update: (data: any) => filterBuilder([]),
          delete: () => filterBuilder([]),
          upsert: (data: any) => filterBuilder([])
        };
      },
      storage: {
        from: (bucket: string) => ({
          upload: async (path: string, file: any) => {
            console.warn('Using mock Supabase client - storage.upload');
            return { data: null, error: null };
          },
          getPublicUrl: (path: string) => {
            console.warn('Using mock Supabase client - storage.getPublicUrl');
            return { data: { publicUrl: '' } };
          },
          download: async (path: string) => {
            console.warn('Using mock Supabase client - storage.download');
            return { data: null, error: null };
          },
          list: async (path?: string, options?: any) => {
            console.warn('Using mock Supabase client - storage.list');
            return { data: [], error: null };
          },
          remove: async (paths: string | string[]) => {
            console.warn('Using mock Supabase client - storage.remove');
            return { data: { path: Array.isArray(paths) ? paths : [paths] }, error: null };
          }
        })
      }
    };
    
    return mockClient;
  }
};

/**
 * Get Supabase client instance (creates one if it doesn't exist)
 */
export function getSupabase(): SupabaseClientType {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

// Export the Supabase client instance
export const supabase = getSupabase(); 