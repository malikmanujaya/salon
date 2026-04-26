import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffDirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  listForSalon(salonId: string) {
    return this.prisma.staffProfile.findMany({
      where: { salonId, status: 'ACTIVE' },
      orderBy: { user: { fullName: 'asc' } },
      select: {
        id: true,
        title: true,
        branchId: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }
}
