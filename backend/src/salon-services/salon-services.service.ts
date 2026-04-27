import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonServiceDto } from './dto/create-salon-service.dto';
import { UpdateSalonServiceDto } from './dto/update-salon-service.dto';

const serviceSelect = {
  id: true,
  name: true,
  description: true,
  durationMinutes: true,
  priceCents: true,
  currency: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  staff: {
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      title: true,
      user: { select: { id: true, fullName: true, email: true } },
    },
  },
} satisfies Prisma.ServiceSelect;

export type SalonServiceRow = Prisma.ServiceGetPayload<{ select: typeof serviceSelect }>;

@Injectable()
export class SalonServicesService {
  constructor(private readonly prisma: PrismaService) {}

  assertCanView(user: RequestUser) {
    if (user.role === 'CUSTOMER') {
      throw new ForbiddenException('Customers cannot view service catalog.');
    }
  }

  assertCanManage(user: RequestUser) {
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'SALON_OWNER') {
      throw new ForbiddenException('Only admin users can manage services.');
    }
  }

  private async sanitizeStaffIds(salonId: string, staffIds?: string[]): Promise<string[]> {
    if (!staffIds?.length) return [];
    const unique = Array.from(new Set(staffIds.map((x) => x.trim()).filter(Boolean)));
    if (!unique.length) return [];
    const rows = await this.prisma.staffProfile.findMany({
      where: { id: { in: unique }, salonId, status: 'ACTIVE' },
      select: { id: true },
    });
    return rows.map((x) => x.id);
  }

  async listAll(salonId: string, q?: string): Promise<SalonServiceRow[]> {
    const query = q?.trim();
    return this.prisma.service.findMany({
      where: {
        salonId,
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { currency: { contains: query } },
                { staff: { some: { user: { fullName: { contains: query } } } } },
              ],
            }
          : {}),
      },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      select: serviceSelect,
    });
  }

  async listActive(salonId: string, q?: string): Promise<SalonServiceRow[]> {
    const query = q?.trim();
    return this.prisma.service.findMany({
      where: {
        salonId,
        isActive: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { currency: { contains: query } },
                { staff: { some: { user: { fullName: { contains: query } } } } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
      select: serviceSelect,
    });
  }

  async create(salonId: string, dto: CreateSalonServiceDto): Promise<SalonServiceRow> {
    const staffIds = await this.sanitizeStaffIds(salonId, dto.staffIds);
    return this.prisma.service.create({
      data: {
        salonId,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        durationMinutes: dto.durationMinutes,
        priceCents: dto.priceCents,
        currency: dto.currency?.trim() || 'LKR',
        branchId: null,
        categoryId: null,
        staff: staffIds.length ? { connect: staffIds.map((id) => ({ id })) } : undefined,
      },
      select: serviceSelect,
    });
  }

  async update(salonId: string, serviceId: string, dto: UpdateSalonServiceDto): Promise<SalonServiceRow> {
    const existing = await this.prisma.service.findFirst({
      where: { id: serviceId, salonId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Service not found.');
    }

    const staffIds = dto.staffIds ? await this.sanitizeStaffIds(salonId, dto.staffIds) : undefined;

    return this.prisma.service.update({
      where: { id: serviceId },
      data: {
        name: dto.name?.trim(),
        description: dto.description !== undefined ? dto.description?.trim() || null : undefined,
        durationMinutes: dto.durationMinutes,
        priceCents: dto.priceCents,
        currency: dto.currency?.trim(),
        isActive: dto.isActive,
        branchId: null,
        categoryId: null,
        staff: staffIds ? { set: staffIds.map((id) => ({ id })) } : undefined,
      },
      select: serviceSelect,
    });
  }

  async deactivate(salonId: string, serviceId: string): Promise<SalonServiceRow> {
    const existing = await this.prisma.service.findFirst({
      where: { id: serviceId, salonId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Service not found.');
    }
    return this.prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
      select: serviceSelect,
    });
  }
}
