import { createClient } from '@supabase/supabase-js';

// Define the type for our Supabase client (use any to avoid type issues)
type SupabaseClientType = any;

// Define a mock client type for development
type MockSupabaseClient = {
  auth: {
    signUp: (params: { email: string; password: string }) => Promise<any>;
    signIn: (params: { email: string; password: string }) => Promise<any>;
    signInWithPassword: (params: { email: string; password: string }) => Promise<any>;
    signOut: () => Promise<any>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => any;
    getSession: () => Promise<any>;
    getUser: () => Promise<any>;
    resetPasswordForEmail: (email: string) => Promise<any>;
    updateUser: (params: { password: string }) => Promise<any>;
  };
  from: (table: string) => any;
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: any) => Promise<any>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
      download: (path: string) => Promise<any>;
      list: (path?: string, options?: any) => Promise<any>;
      remove: (paths: string | string[]) => Promise<any>;
    };
  };
};

// Create a lazy-loaded variable that only gets initialized when needed
let supabaseInstance: SupabaseClientType | null = null;

const createSupabaseClient = (): SupabaseClientType => {
  const supabaseUrl = typeof window !== 'undefined' 
    ? window.localStorage.getItem('SUPABASE_URL') || process.env.NEXT_PUBLIC_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL;
    
  const supabaseAnonKey = typeof window !== 'undefined'
    ? window.localStorage.getItem('SUPABASE_ANON_KEY') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    // Create a real Supabase client when we have credentials
    try {
      const client = createClient(supabaseUrl, supabaseAnonKey);
      console.log('✅ Conectado correctamente con Supabase');
      console.log('URL:', supabaseUrl);
      
      // Save credentials to localStorage for reliability
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('SUPABASE_URL', supabaseUrl);
        window.localStorage.setItem('SUPABASE_ANON_KEY', supabaseAnonKey);
      }
      
      return client;
    } catch (error) {
      console.error('Error al conectar con Supabase:', error);
      // Return mock client as fallback
      return createMockClient();
    }
  } else {
    console.warn('No se encontraron credenciales de Supabase. Usando cliente mock.');
    // Create a mock client for development
    return createMockClient();
  }
};

// Function to create a mock client
const createMockClient = (): MockSupabaseClient => {
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
};

// Create and export the Supabase client
let supabase: SupabaseClientType = null;

// Initialize it on first import
if (typeof window !== 'undefined') {
  supabase = createSupabaseClient();
}

export { supabase }; 