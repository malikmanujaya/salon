import { useAuth } from '@/context/AuthContext';

export function useAuthFeature() {
  return useAuth();
}

