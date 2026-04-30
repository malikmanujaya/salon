import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingSource, BookingStatus, CustomerAccountStatus, Prisma } from '@prisma/client';

import type { RequestUser } from '../../common/auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

const bookingInclude = {
  customer: true,
  staff: { include: { user: { select: { id: true, fullName: true, email: true } } } },
  services: { include: { service: true } },
} satisfies Prisma.BookingInclude;

type LoadedBooking = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly terminalStatuses: BookingStatus[] = [
    BookingStatus.CANCELLED,
    BookingStatus.NO_SHOW,
  ];

  /** CRM row for the signed-in salon customer (same phone as user). */
  private async getSelfCustomerId(salonId: string, user: RequestUser): Promise<string> {
    const phone = user.phone?.trim();
    if (!phone) {
      throw new BadRequestException('Your profile must include a phone number to book.');
    }
    const existing = await this.prisma.customer.findFirst({
      where: { salonId, phone },
      select: { id: true, accountStatus: true },
    });
    if (existing) {
      if (existing.accountStatus !== CustomerAccountStatus.ACTIVE) {
        throw new ForbiddenException(
          'Your salon customer profile is blocked or inactive. Contact the salon.',
        );
      }
      return existing.id;
    }
    return (
      await this.prisma.customer.create({
        data: {
          salonId,
          fullName: user.fullName,
          phone,
          email: user.email,
        },
      })
    ).id;
  }

  private async assertCustomerOwnsBooking(user: RequestUser, salonId: string, booking: LoadedBooking) {
    if (user.role !== 'CUSTOMER') return;
    const selfId = await this.getSelfCustomerId(salonId, user);
    if (booking.customerId !== selfId) {
      throw new ForbiddenException('You can only access your own bookings.');
    }
  }

  private assertCanChangeStatus(user: RequestUser, booking: LoadedBooking) {
    if (user.role === 'SUPER_ADMIN' || user.role === 'SALON_OWNER') return;
    if (user.role === 'STAFF' && booking.staff?.user.id === user.id) return;
    throw new ForbiddenException(
      'Only super admin, salon owner, or the assigned staff member can change booking status.',
    );
  }

  private assertCanCancel(user: RequestUser, booking: LoadedBooking) {
    if (
      user.role === 'SUPER_ADMIN' ||
      user.role === 'SALON_OWNER' ||
      user.role === 'RECEPTIONIST'
    ) {
      return;
    }
    if (user.role === 'STAFF' && booking.staff?.user.id === user.id) return;
    if (user.role === 'CUSTOMER') return;
    throw new ForbiddenException(
      'You are not allowed to cancel this booking.',
    );
  }

  async findAll(salonId: string, query: QueryBookingsDto, user: RequestUser) {
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid date range.');
    }
    const where: Prisma.BookingWhereInput = {
      salonId,
      startTime: { gte: from, lte: to },
    };
    if (user.role === 'CUSTOMER') {
      where.customerId = await this.getSelfCustomerId(salonId, user);
    }
    return this.prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(salonId: string, id: string, user: RequestUser): Promise<LoadedBooking> {
    const booking = await this.prisma.booking.findFirst({
      where: { id, salonId },
      include: bookingInclude,
    });
    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }
    await this.assertCustomerOwnsBooking(user, salonId, booking);
    return booking;
  }

  private async loadServiceLines(serviceIds: string[], salonId: string) {
    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds }, salonId, isActive: true },
    });
    if (services.length !== serviceIds.length) {
      throw new BadRequestException('One or more services are invalid or inactive.');
    }
    const lines = serviceIds.map((id) => {
      const s = services.find((x) => x.id === id)!;
      return {
        serviceId: s.id,
        priceCents: s.priceCents,
        durationMinutes: s.durationMinutes,
      };
    });
    const totalMinutes = lines.reduce((sum, l) => sum + l.durationMinutes, 0);
    return { lines, totalMinutes };
  }

  private async assertStaffSlot(
    salonId: string,
    staffId: string | null | undefined,
    start: Date,
    end: Date,
    excludeBookingId?: string,
  ) {
    if (!staffId) return;
    const conflict = await this.prisma.booking.findFirst({
      where: {
        salonId,
        staffId,
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        status: { notIn: this.terminalStatuses },
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });
    if (conflict) {
      throw new ConflictException('That stylist already has a booking in this time range.');
    }
  }

  async create(salonId: string, userId: string, dto: CreateBookingDto, user: RequestUser) {
    const start = new Date(dto.startTime);
    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException('Invalid start time.');
    }

    const { lines, totalMinutes } = await this.loadServiceLines(dto.serviceIds, salonId);
    const end = new Date(start.getTime() + totalMinutes * 60_000);

    let customerId: string;
    if (user.role === 'CUSTOMER') {
      customerId = await this.getSelfCustomerId(salonId, user);
    } else {
      if (!dto.customerId) {
        throw new BadRequestException('customerId is required.');
      }
      customerId = dto.customerId;
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, salonId },
      select: { id: true, accountStatus: true },
    });
    if (!customer) {
      throw new BadRequestException('Customer not found for this salon.');
    }
    if (customer.accountStatus !== CustomerAccountStatus.ACTIVE) {
      throw new BadRequestException('This customer is blocked or inactive and cannot be booked.');
    }

    if (dto.staffId) {
      const staff = await this.prisma.staffProfile.findFirst({
        where: { id: dto.staffId, salonId, status: 'ACTIVE' },
      });
      if (!staff) {
        throw new BadRequestException('Invalid staff member.');
      }
    }

    await this.assertStaffSlot(salonId, dto.staffId ?? null, start, end);

    const source =
      user.role === 'CUSTOMER' ? BookingSource.PUBLIC_WEB : BookingSource.ADMIN_PORTAL;

    return this.prisma.booking.create({
      data: {
        salonId,
        branchId: null,
        customerId,
        staffId: dto.staffId ?? null,
        startTime: start,
        endTime: end,
        status: BookingStatus.PENDING,
        source,
        notes: dto.notes?.trim() || null,
        createdById: userId,
        services: {
          create: lines.map((l) => ({
            serviceId: l.serviceId,
            priceCents: l.priceCents,
            durationMinutes: l.durationMinutes,
          })),
        },
      },
      include: bookingInclude,
    });
  }

  async update(salonId: string, id: string, dto: UpdateBookingDto, user: RequestUser) {
    const existing = await this.findOne(salonId, id, user);

    if (dto.status !== undefined && dto.status !== existing.status) {
      this.assertCanChangeStatus(user, existing);
    }

    if (
      user.role === 'STAFF' &&
      (dto.startTime !== undefined ||
        dto.staffId !== undefined ||
        dto.serviceIds !== undefined)
    ) {
      throw new ForbiddenException('Assigned staff can only change booking status or notes.');
    }

    let start = existing.startTime;
    let end = existing.endTime;
    let staffId: string | null = existing.staffId;

    if (dto.serviceIds?.length) {
      const { lines, totalMinutes } = await this.loadServiceLines(dto.serviceIds, salonId);
      start = dto.startTime ? new Date(dto.startTime) : existing.startTime;
      if (Number.isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start time.');
      }
      end = new Date(start.getTime() + totalMinutes * 60_000);
      staffId = dto.staffId !== undefined ? dto.staffId : existing.staffId;

      if (dto.staffId !== undefined) {
        if (dto.staffId) {
          const st = await this.prisma.staffProfile.findFirst({
            where: { id: dto.staffId, salonId, status: 'ACTIVE' },
          });
          if (!st) throw new BadRequestException('Invalid staff member.');
        }
      }

      if (!this.terminalStatuses.includes(existing.status)) {
        await this.assertStaffSlot(salonId, staffId, start, end, id);
      }

      return this.prisma.$transaction(async (tx) => {
        await tx.bookingService.deleteMany({ where: { bookingId: id } });
        await tx.bookingService.createMany({
          data: lines.map((l) => ({
            bookingId: id,
            serviceId: l.serviceId,
            priceCents: l.priceCents,
            durationMinutes: l.durationMinutes,
          })),
        });
        return tx.booking.update({
          where: { id },
          data: {
            startTime: start,
            endTime: end,
            staffId,
            ...(dto.notes !== undefined ? { notes: dto.notes?.trim() || null } : {}),
            ...(dto.status !== undefined ? { status: dto.status } : {}),
          },
          include: bookingInclude,
        });
      });
    }

    if (dto.startTime) {
      start = new Date(dto.startTime);
      if (Number.isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start time.');
      }
      const durationMs = existing.endTime.getTime() - existing.startTime.getTime();
      end = new Date(start.getTime() + durationMs);
    }

    if (dto.staffId !== undefined) {
      staffId = dto.staffId;
      if (dto.staffId) {
        const st = await this.prisma.staffProfile.findFirst({
          where: { id: dto.staffId, salonId, status: 'ACTIVE' },
        });
        if (!st) throw new BadRequestException('Invalid staff member.');
      }
    }

    if (!this.terminalStatuses.includes(dto.status ?? existing.status)) {
      await this.assertStaffSlot(salonId, staffId, start, end, id);
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        ...(dto.startTime ? { startTime: start, endTime: end } : {}),
        ...(dto.staffId !== undefined ? { staffId } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes?.trim() || null } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: bookingInclude,
    });
  }

  async cancel(salonId: string, id: string, user: RequestUser) {
    const existing = await this.findOne(salonId, id, user);
    this.assertCanCancel(user, existing);
    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: bookingInclude,
    });
  }
}



