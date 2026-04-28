import { UnauthorizedException } from '@nestjs/common';
import { CustomerAccountStatus, UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type UserAuthRow = {
  role: string;
  status: string;
  salonId: string | null;
  phone: string | null;
};

/**
 * Enforces User.status === ACTIVE and, for salon customers, matching CRM
 * Customer.accountStatus === ACTIVE (blocked / deactivated cannot sign in).
 */
export async function assertUserMayAuthenticate(prisma: PrismaService, user: UserAuthRow | null): Promise<void> {
  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedException('Invalid email or password.');
  }

  if (user.role !== UserRole.CUSTOMER) {
    return;
  }

  const salonId = user.salonId;
  const phone = user.phone?.trim();
  if (!salonId || !phone) {
    return;
  }

  const customer = await prisma.customer.findFirst({
    where: { salonId, phone },
    select: { accountStatus: true },
  });

  if (customer && customer.accountStatus !== CustomerAccountStatus.ACTIVE) {
    throw new UnauthorizedException('Invalid email or password.');
  }
}
