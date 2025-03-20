import { useAuth } from '../contexts/SupabaseAuthContext';

export default function useSupabaseAuth() {
  return useAuth();
} 