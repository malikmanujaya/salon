import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonStaffRole, type CreateStaffMemberDto } from './dto/create-staff-member.dto';

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
    if (user.role === 'STAFF') {
      throw new ForbiddenException('Staff cannot view the team directory.');
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
}
