import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, CustomerAccountStatus, Prisma } from '@prisma/client';

import type { RequestUser } from '../../common/auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private assertCanManageCustomers(actor: RequestUser) {
    if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'SALON_OWNER') {
      throw new ForbiddenException('Only super admin or salon owner can manage customers.');
    }
  }

  private customerSelect = {
    id: true,
    fullName: true,
    phone: true,
    email: true,
    accountStatus: true,
    createdAt: true,
    salon: { select: { id: true, name: true, slug: true } },
  } satisfies Prisma.CustomerSelect;

  private async getCustomerOrThrow(salonId: string, id: string) {
    const row = await this.prisma.customer.findFirst({
      where: { id, salonId },
      select: this.customerSelect,
    });
    if (!row) {
      throw new NotFoundException('Customer not found.');
    }
    return row;
  }

  listSalonOptions() {
    return this.prisma.salon.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: 'asc' },
      take: 300,
    });
  }

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

  async list(
    salonId: string,
    q: string | undefined,
    user: RequestUser,
    page = 1,
    pageSize = 20,
    includeInactive = false,
  ) {
    if (user.role === 'CUSTOMER') {
      const phone = user.phone?.trim();
      if (!phone) {
        return { items: [], total: 0, page: 1, pageSize: 5 };
      }
      const items = await this.prisma.customer.findMany({
        where: { salonId, phone, accountStatus: CustomerAccountStatus.ACTIVE },
        orderBy: { fullName: 'asc' },
        take: 5,
        select: this.customerSelect,
      });
      return { items, total: items.length, page: 1, pageSize: 5 };
    }

    const search = q?.trim();
    const where: Prisma.CustomerWhereInput = {
      salonId,
      ...(!includeInactive ? { accountStatus: { not: CustomerAccountStatus.DEACTIVATED } } : {}),
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
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, Math.min(100, pageSize));
    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
        select: this.customerSelect,
      }),
    ]);
    return { items, total, page: safePage, pageSize: safePageSize };
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
        select: this.customerSelect,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('A customer with this phone number already exists.');
      }
      throw e;
    }
  }

  async update(salonId: string, id: string, dto: UpdateCustomerDto, actor: RequestUser) {
    this.assertCanManageCustomers(actor);
    await this.getCustomerOrThrow(salonId, id);

    const data: Prisma.CustomerUpdateInput = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) data.phone = dto.phone.trim();
    if (dto.email !== undefined) data.email = dto.email?.trim() ? dto.email.trim() : null;
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.notes !== undefined) data.notes = dto.notes?.trim() ? dto.notes.trim() : null;
    if (dto.accountStatus !== undefined) data.accountStatus = dto.accountStatus;

    if (Object.keys(data).length === 0) {
      return this.getCustomerOrThrow(salonId, id);
    }

    try {
      return await this.prisma.customer.update({
        where: { id },
        data,
        select: this.customerSelect,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('A customer with this phone number already exists.');
      }
      throw e;
    }
  }

  /** Soft-remove from active CRM (keeps history). */
  async deactivate(salonId: string, id: string, actor: RequestUser) {
    this.assertCanManageCustomers(actor);
    await this.getCustomerOrThrow(salonId, id);
    return this.prisma.customer.update({
      where: { id },
      data: { accountStatus: CustomerAccountStatus.DEACTIVATED },
      select: this.customerSelect,
    });
  }
}



