import { supabase } from '@/lib/supabase';

// Since getStorageUrl is not exported from the supabase.ts file, 
// let's define a function to get the public URL
const getStorageUrl = (bucket: string, path: string): string => {
  // Safely access env var with optional chaining
  const supabaseUrl = process?.env?.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};

// Upload file to Supabase Storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options: { upsert?: boolean; cacheControl?: string } = {}
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options);
  
  return { 
    data: data ? {
      ...data,
      publicUrl: data.path ? getStorageUrl(bucket, data.path) : null
    } : null, 
    error 
  };
}

// Download a file
export async function downloadFile(
  bucket: string,
  path: string
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
  
  return { data, error };
}

// List files in a bucket
export async function listFiles(
  bucket: string,
  path: string = '',
  options: { limit?: number; offset?: number; sortBy?: { column: string; order: string } } = {}
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path, options);
  
  return { 
    data: data?.map((file: { name: string }) => ({
      ...file,
      publicUrl: file.name ? getStorageUrl(bucket, `${path ? path + '/' : ''}${file.name}`) : null
    })), 
    error 
  };
}

// Remove a file
export async function removeFile(
  bucket: string,
  paths: string | string[]
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(Array.isArray(paths) ? paths : [paths]);
  
  return { data, error };
}

// Get public URL for a file
export function getPublicUrl(bucket: string, path: string) {
  return getStorageUrl(bucket, path);
} 