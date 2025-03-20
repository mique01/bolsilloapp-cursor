import { SupabaseClient } from '@supabase/supabase-js';

// Define interfaces for Supabase responses
export interface SupabaseAuthResponse {
  data: any | null;
  error: Error | null;
}

export interface SupabaseDataResponse<T = any> {
  data: T | null;
  error: any | null;
}

// Define interface for our mock client
export interface MockSupabaseClient {
  auth: {
    signUp: (options: { email: string; password: string }) => Promise<SupabaseAuthResponse>;
    signIn: (options: { email: string; password: string }) => Promise<SupabaseAuthResponse>;
    signInWithPassword: (options: { email: string; password: string }) => Promise<SupabaseAuthResponse>;
    signOut: () => Promise<{ error: null }>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: { unsubscribe: () => void } } };
    getSession: () => Promise<{ data: { session: any }; error: null }>;
    getUser: () => Promise<{ data: { user: any }; error: null }>;
    resetPasswordForEmail: (email: string) => Promise<SupabaseAuthResponse>;
    updateUser: (options: { password: string }) => Promise<SupabaseAuthResponse>;
  };
  from: (table: string) => any;
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: any) => Promise<SupabaseDataResponse>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
      download: (path: string) => Promise<SupabaseDataResponse>;
      list: (path?: string, options?: any) => Promise<SupabaseDataResponse>;
      remove: (paths: string | string[]) => Promise<SupabaseDataResponse>;
    };
  };
}

// Union type for either real or mock client
export type SupabaseClientType = SupabaseClient | MockSupabaseClient; 