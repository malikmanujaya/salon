import type { ServiceInput } from './types';

export function validateServiceInput(input: ServiceInput): string | null {
  if (!input.name.trim()) return 'Service name is required.';
  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes < 5) {
    return 'Duration must be at least 5 minutes.';
  }
  if (!Number.isFinite(input.priceCents) || input.priceCents < 0) {
    return 'Price must be zero or more.';
  }
  return null;
}

