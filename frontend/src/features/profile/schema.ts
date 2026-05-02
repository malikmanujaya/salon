import type { UpdateProfileInput } from './types';

export function validateProfile(input: UpdateProfileInput): string | null {
  if (!input.fullName?.trim()) return 'Full name is required.';
  if (!input.email?.trim()) return 'Email is required.';
  if (input.phone?.trim() && !/^\d{10}$/.test(input.phone.trim())) {
    return 'Phone number must be exactly 10 digits.';
  }
  return null;
}

