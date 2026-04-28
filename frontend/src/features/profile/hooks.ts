import { useAuth } from '@/context/AuthContext';

export function useProfile() {
  return useAuth();
}

