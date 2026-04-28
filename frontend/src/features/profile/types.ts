import type { AuthUser } from '@/types/user';

export type UpdateProfileInput = {
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
};

export type ProfileUser = AuthUser;

