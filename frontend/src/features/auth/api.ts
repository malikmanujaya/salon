import { api } from '@/lib/api-client';
import type { AuthTokensResponse, AuthUser } from '@/types/user';

import type {
  ForgotPasswordRequestInput,
  ForgotPasswordResetInput,
  ForgotPasswordVerifyInput,
  LoginInput,
  RegisterInput,
} from './types';

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

export async function requestPasswordResetOtp(input: ForgotPasswordRequestInput) {
  const { data } = await api.post<{ ok: boolean; message: string }>('/auth/forgot-password/request-otp', input);
  return data;
}

export async function verifyPasswordResetOtp(input: ForgotPasswordVerifyInput) {
  const { data } = await api.post<{ resetToken: string }>('/auth/forgot-password/verify-otp', input);
  return data;
}

export async function resetPasswordWithOtp(input: ForgotPasswordResetInput) {
  const { data } = await api.post<{ ok: boolean }>('/auth/forgot-password/reset', input);
  return data;
}

