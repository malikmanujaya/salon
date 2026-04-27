import { ConflictException, Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';

import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private async getSelfCustomerId(salonId: string, user: RequestUser): Promise<string | null> {
    const phone = user.phone?.trim();
    if (!phone) return null;
    const row = await this.prisma.customer.findFirst({
      where: { salonId, phone },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  async customerDashboard(salonId: string, user: RequestUser) {
    const customerId = await this.getSelfCustomerId(salonId, user);
    if (!customerId) {
      return {
        customerId: null,
        totals: { upcoming: 0, completed: 0, cancelled: 0, total: 0 },
        nextBooking: null,
        recentBookings: [],
      };
    }

    const now = new Date();
    const [total, upcoming, completed, cancelled, nextBooking, recentBookings] = await Promise.all([
      this.prisma.booking.count({ where: { salonId, customerId } }),
      this.prisma.booking.count({
        where: {
          salonId,
          customerId,
          status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
          startTime: { gte: now },
        },
      }),
      this.prisma.booking.count({ where: { salonId, customerId, status: BookingStatus.COMPLETED } }),
      this.prisma.booking.count({
        where: { salonId, customerId, status: { in: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] } },
      }),
      this.prisma.booking.findFirst({
        where: {
          salonId,
          customerId,
          status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
          startTime: { gte: now },
        },
        include: {
          services: { include: { service: { select: { name: true } } } },
          staff: { include: { user: { select: { fullName: true } } } },
        },
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.booking.findMany({
        where: { salonId, customerId },
        include: {
          services: { include: { service: { select: { name: true } } } },
          staff: { include: { user: { select: { fullName: true } } } },
        },
        orderBy: { startTime: 'desc' },
        take: 5,
      }),
    ]);

    return {
      customerId,
      totals: { upcoming, completed, cancelled, total },
      nextBooking,
      recentBookings,
    };
  }

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
