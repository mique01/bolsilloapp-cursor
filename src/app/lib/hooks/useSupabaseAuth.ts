import { useSupabaseAuth as useSupabaseAuthContext } from '../contexts/SupabaseAuthContext';

export default function useSupabaseAuth() {
  return useSupabaseAuthContext();
} 