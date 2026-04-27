import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, StaffStatus, UserStatus } from '@prisma/client';

import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

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

  listMembers(salonId: string): Promise<SalonStaffMember[]> {
    return this.prisma.user.findMany({
      where: {
        salonId,
        role: { in: ['RECEPTIONIST', 'STAFF', 'SALON_OWNER'] },
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

    if (dto.status && !['ACTIVE', 'DISABLED'].includes(dto.status)) {
      throw new ForbiddenException('Only ACTIVE or DISABLED status can be set.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: memberId },
        data: {
          fullName: dto.fullName?.trim() || undefined,
          phone: dto.phone !== undefined ? dto.phone.trim() || null : undefined,
          role: dto.role,
          status: dto.status,
        },
      });

      const shouldHaveStaffProfile = nextRole === CreateSalonStaffRole.STAFF;
      const nextStaffStatus =
        dto.status === UserStatus.DISABLED ? StaffStatus.INACTIVE : StaffStatus.ACTIVE;

      if (shouldHaveStaffProfile) {
        if (existing.staffProfile?.id) {
          await tx.staffProfile.update({
            where: { id: existing.staffProfile.id },
            data: {
              title: dto.title !== undefined ? dto.title.trim() || null : undefined,
              status: nextStaffStatus,
            },
          });
        } else {
          await tx.staffProfile.create({
            data: {
              userId: memberId,
              salonId,
              title: dto.title?.trim() || null,
              status: nextStaffStatus,
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

    return updated;
  }
}
