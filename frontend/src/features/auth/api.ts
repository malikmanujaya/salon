import { api } from '@/lib/api-client';
import type { AuthTokensResponse, AuthUser } from '@/types/user';

import type { LoginInput, RegisterInput } from './types';

export async function loginApi(input: LoginInput) {
  const { data } = await api.post<AuthTokensResponse>('/auth/login', input);
  return data;
}

export async function registerApi(input: RegisterInput) {
  const { data } = await api.post<AuthTokensResponse>('/auth/register', {
    fullName: input.fullName,
    email: input.email,
    password: input.password,
    phone: input.phone.trim(),
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}

