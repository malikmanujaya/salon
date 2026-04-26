import { ForbiddenException } from '@nestjs/common';

import type { RequestUser } from '../auth/decorators/current-user.decorator';

export function requireSalonId(user: RequestUser): string {
  if (!user.salonId) {
    throw new ForbiddenException(
      'This account is not linked to a salon. Sign in with a salon user to manage bookings.',
    );
  }
  return user.salonId;
}
