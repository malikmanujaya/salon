import { api } from '@/lib/api-client';
import type { AuthUser } from '@/types/user';

import type { UpdateProfileInput } from './types';

export async function updateProfile(payload: UpdateProfileInput) {
  const { data } = await api.patch<AuthUser>('/auth/me', payload);
  return data;
}

