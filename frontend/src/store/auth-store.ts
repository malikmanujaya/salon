import type { AuthUser } from '@/types/user';

export type AuthStoreState = {
  user: AuthUser | null;
};
