import type { LoginInput, RegisterInput } from './types';

export function validateLogin(input: LoginInput): string | null {
  if (!input.email.trim()) return 'Email is required.';
  if (!input.password) return 'Password is required.';
  return null;
}

export function validateRegister(input: RegisterInput): string | null {
  if (!input.fullName.trim()) return 'Full name is required.';
  if (!input.email.trim()) return 'Email is required.';
  if (!input.phone.trim()) return 'Phone is required.';
  if (input.password.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

