import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  list(salonId: string, q: string | undefined, user: RequestUser) {
    if (user.role === 'CUSTOMER') {
      const phone = user.phone?.trim();
      if (!phone) return [];
      return this.prisma.customer.findMany({
        where: { salonId, phone },
        orderBy: { fullName: 'asc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          createdAt: true,
        },
      });
    }

    const search = q?.trim();
    const where: Prisma.CustomerWhereInput = {
      salonId,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    };
    return this.prisma.customer.findMany({
      where,
      orderBy: { fullName: 'asc' },
      take: 200,
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async create(salonId: string, dto: CreateCustomerDto) {
    const phone = dto.phone.trim();
    try {
      return await this.prisma.customer.create({
        data: {
          salonId,
          fullName: dto.fullName.trim(),
          phone,
          email: dto.email?.trim() || null,
          gender: dto.gender ?? null,
          notes: dto.notes?.trim() || null,
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('A customer with this phone number already exists.');
      }
      throw e;
    }
  }
}
