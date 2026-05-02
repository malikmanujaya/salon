import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { BookingStatus, Prisma, StaffStatus, UserStatus } from '@prisma/client';

import type { RequestUser } from '../../common/auth/decorators/current-user.decorator';
import { AuditLogService } from '../../common/logging/audit-log.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalonStaffRole, type CreateStaffMemberDto } from './dto/create-staff-member.dto';
import { UpdateStaffMemberDto } from './dto/update-staff-member.dto';

const BCRYPT_ROUNDS = 12;

const memberSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  staffProfile: {
    select: {
      id: true,
      title: true,
      status: true,
      branchId: true,
    },
  },
} satisfies Prisma.UserSelect;

export type SalonStaffMember = Prisma.UserGetPayload<{ select: typeof memberSelect }>;

@Injectable()
export class StaffDirectoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async staffDashboard(salonId: string, user: RequestUser) {
    if (user.role !== 'STAFF') {
      throw new ForbiddenException('Only staff users can access this dashboard.');
    }

    const staffProfile = await this.prisma.staffProfile.findFirst({
      where: { userId: user.id, salonId },
      select: { id: true, title: true },
    });

    if (!staffProfile) {
      return {
        staffId: null,
        totals: { today: 0, upcoming: 0, completedThisWeek: 0, total: 0 },
        nextBooking: null,
        todayBookings: [],
        recentBookings: [],
      };
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const [total, today, upcoming, completedThisWeek, nextBooking, todayBookings, recentBookings] =
      await Promise.all([
        this.prisma.booking.count({
          where: { salonId, staffId: staffProfile.id },
        }),
        this.prisma.booking.count({
          where: {
            salonId,
            staffId: staffProfile.id,
            startTime: { gte: startOfDay, lte: endOfDay },
            status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
          },
        }),
        this.prisma.booking.count({
          where: {
            salonId,
            staffId: staffProfile.id,
            startTime: { gt: now },
            status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
          },
        }),
        this.prisma.booking.count({
          where: {
            salonId,
            staffId: staffProfile.id,
            status: BookingStatus.COMPLETED,
            startTime: { gte: weekStart },
          },
        }),
        this.prisma.booking.findFirst({
          where: {
            salonId,
            staffId: staffProfile.id,
            startTime: { gt: now },
            status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
          },
          include: {
            customer: { select: { fullName: true, phone: true } },
            services: { include: { service: { select: { name: true } } } },
          },
          orderBy: { startTime: 'asc' },
        }),
        this.prisma.booking.findMany({
          where: {
            salonId,
            staffId: staffProfile.id,
            startTime: { gte: startOfDay, lte: endOfDay },
            status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
          },
          include: {
            customer: { select: { fullName: true, phone: true } },
            services: { include: { service: { select: { name: true } } } },
          },
          orderBy: { startTime: 'asc' },
          take: 8,
        }),
        this.prisma.booking.findMany({
          where: { salonId, staffId: staffProfile.id },
          include: {
            customer: { select: { fullName: true, phone: true } },
            services: { include: { service: { select: { name: true } } } },
          },
          orderBy: { startTime: 'desc' },
          take: 5,
        }),
      ]);

    return {
      staffId: staffProfile.id,
      totals: { today, upcoming, completedThisWeek, total },
      nextBooking,
      todayBookings,
      recentBookings,
    };
  }

  private async getMemberOrThrow(salonId: string, memberId: string): Promise<SalonStaffMember> {
    const member = await this.prisma.user.findFirst({
      where: {
        id: memberId,
        salonId,
        role: { in: ['RECEPTIONIST', 'STAFF', 'SALON_OWNER'] },
      },
      select: memberSelect,
    });
    if (!member) {
      throw new NotFoundException('Staff member not found.');
    }
    return member;
  }

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

  listMembers(salonId: string, q?: string): Promise<SalonStaffMember[]> {
    const query = q?.trim();
    return this.prisma.user.findMany({
      where: {
        salonId,
        role: { in: ['RECEPTIONIST', 'STAFF', 'SALON_OWNER'] },
        ...(query
          ? {
              OR: [
                { fullName: { contains: query } },
                { email: { contains: query } },
                { phone: { contains: query } },
                { staffProfile: { title: { contains: query } } },
              ],
            }
          : {}),
      },
      orderBy: { fullName: 'asc' },
      select: memberSelect,
    });
  }

  assertCanViewMembers(user: RequestUser) {
    if (user.role === 'CUSTOMER') {
      throw new ForbiddenException('Customers cannot view salon staff.');
    }
  }

  assertCanCreateMember(actor: RequestUser, targetRole: CreateSalonStaffRole) {
    if (actor.role === 'CUSTOMER' || actor.role === 'STAFF') {
      throw new ForbiddenException('You cannot create salon users.');
    }
    if (actor.role === 'RECEPTIONIST') {
      throw new ForbiddenException('Receptionists cannot create salon users.');
    }
    if (actor.role === 'SALON_OWNER') {
      if (targetRole === CreateSalonStaffRole.SALON_OWNER) {
        throw new ForbiddenException('Only a platform admin can create another salon admin.');
      }
    }
  }

  private assertCanMutateMember(actor: RequestUser, targetRole: CreateSalonStaffRole) {
    this.assertCanCreateMember(actor, targetRole);
  }

  async createMember(salonId: string, dto: CreateStaffMemberDto, actor: RequestUser): Promise<SalonStaffMember> {
    this.assertCanCreateMember(actor, dto.role);

    const salon = await this.prisma.salon.findFirst({ where: { id: salonId }, select: { id: true } });
    if (!salon) {
      throw new NotFoundException('Salon not found.');
    }

    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            fullName: dto.fullName.trim(),
            phone: dto.phone?.trim() || null,
            role: dto.role,
            status: 'ACTIVE',
            salonId,
          },
          select: { id: true },
        });

        if (dto.role === CreateSalonStaffRole.STAFF) {
          await tx.staffProfile.create({
            data: {
              userId: user.id,
              salonId,
              title: dto.title?.trim() || null,
              status: 'ACTIVE',
            },
          });
        }

        const row = await tx.user.findUnique({
          where: { id: user.id },
          select: memberSelect,
        });
        if (!row) throw new NotFoundException('User was not created.');
        return row;
      });
      await this.auditLog.logDbChange({
        feature: 'staff',
        action: 'create',
        entity: 'user',
        entityId: created.id,
        actorId: actor.id,
        salonId,
        details: { role: created.role, status: created.status },
      });
      return created;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('An account with this email already exists.');
      }
      throw e;
    }
  }

  async updateMember(
    salonId: string,
    memberId: string,
    dto: UpdateStaffMemberDto,
    actor: RequestUser,
  ): Promise<SalonStaffMember> {
    if (actor.id === memberId && dto.role && dto.role !== CreateSalonStaffRole.SALON_OWNER) {
      throw new ForbiddenException('You cannot change your own role here.');
    }
    const existing = await this.getMemberOrThrow(salonId, memberId);
    const nextRole = dto.role ?? (existing.role as CreateSalonStaffRole);
    this.assertCanMutateMember(actor, nextRole);

    if (dto.status && !['ACTIVE', 'DISABLED', 'SUSPENDED'].includes(dto.status)) {
      throw new ForbiddenException('Only ACTIVE, SUSPENDED, or DISABLED account status can be set.');
    }

    const nextStaffStatusFromUser =
      dto.status === undefined
        ? undefined
        : dto.status === UserStatus.DISABLED
          ? StaffStatus.INACTIVE
          : dto.status === UserStatus.SUSPENDED
            ? StaffStatus.ON_LEAVE
            : StaffStatus.ACTIVE;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: memberId },
        data: {
          fullName: dto.fullName?.trim() || undefined,
          phone: dto.phone === undefined ? undefined : dto.phone?.trim() || null,
          role: dto.role,
          status: dto.status,
        },
      });

      const shouldHaveStaffProfile = nextRole === CreateSalonStaffRole.STAFF;

      if (shouldHaveStaffProfile) {
        if (existing.staffProfile?.id) {
          await tx.staffProfile.update({
            where: { id: existing.staffProfile.id },
            data: {
              title: dto.title === undefined ? undefined : dto.title?.trim() || null,
              ...(nextStaffStatusFromUser !== undefined ? { status: nextStaffStatusFromUser } : {}),
            },
          });
        } else {
          await tx.staffProfile.create({
            data: {
              userId: memberId,
              salonId,
              title: dto.title?.trim() || null,
              status: nextStaffStatusFromUser ?? StaffStatus.ACTIVE,
            },
          });
        }
      } else if (existing.staffProfile?.id) {
        await tx.staffProfile.update({
          where: { id: existing.staffProfile.id },
          data: { status: StaffStatus.INACTIVE },
        });
      }

      const row = await tx.user.findUnique({ where: { id: memberId }, select: memberSelect });
      if (!row) throw new NotFoundException('Staff member was not updated.');
      return row;
    });
    await this.auditLog.logDbChange({
      feature: 'staff',
      action: 'update',
      entity: 'user',
      entityId: memberId,
      actorId: actor.id,
      salonId,
      details: {
        fields: Object.keys(dto),
        role: updated.role,
        status: updated.status,
      },
    });

    return updated;
  }

  async deactivateMember(salonId: string, memberId: string, actor: RequestUser): Promise<SalonStaffMember> {
    if (actor.id === memberId) {
      throw new ForbiddenException('You cannot deactivate your own account.');
    }
    const existing = await this.getMemberOrThrow(salonId, memberId);
    this.assertCanMutateMember(actor, existing.role as CreateSalonStaffRole);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: memberId },
        data: { status: UserStatus.DISABLED },
      });

      if (existing.staffProfile?.id) {
        await tx.staffProfile.update({
          where: { id: existing.staffProfile.id },
          data: { status: StaffStatus.INACTIVE },
        });
      }

      const row = await tx.user.findUnique({ where: { id: memberId }, select: memberSelect });
      if (!row) throw new NotFoundException('Staff member was not updated.');
      return row;
    });
    await this.auditLog.logDbChange({
      feature: 'staff',
      action: 'deactivate',
      entity: 'user',
      entityId: memberId,
      actorId: actor.id,
      salonId,
      details: { status: updated.status },
    });

    return updated;
  }
}



