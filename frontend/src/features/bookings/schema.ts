export function validateBookingRange(fromIso: string | null, toIso: string | null): string | null {
  if (!fromIso || !toIso) return 'Date range is required.';
  if (new Date(fromIso).getTime() > new Date(toIso).getTime()) {
    return 'From must be on or before To.';
  }
  return null;
}

