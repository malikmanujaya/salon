import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalonServicesService {
  constructor(private readonly prisma: PrismaService) {}

  listActive(salonId: string) {
    return this.prisma.service.findMany({
      where: { salonId, isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        durationMinutes: true,
        priceCents: true,
        currency: true,
        branchId: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
      },
    });
  }
}
