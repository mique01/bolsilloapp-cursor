import { createClient } from '@supabase/supabase-js';

// For client-side usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anonymous Key is missing. Please check your environment variables.');
}

// Client for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get URL for Supabase Storage
export function getStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
} 