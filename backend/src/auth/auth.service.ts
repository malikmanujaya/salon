import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { BookingStatus, Prisma } from '@prisma/client';

import type { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import { assertUserMayAuthenticate } from './assert-user-may-authenticate';
import type { RequestUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateMeDto } from './dto/update-me.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  private get jwtOpts() {
    return this.config.get('jwt', { infer: true })!;
  }

  private signAccess(user: { id: string; email: string; role: string }): string {
    const { accessSecret, accessExpiresIn } = this.jwtOpts;
    return this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role, typ: 'access' },
      { secret: accessSecret, expiresIn: accessExpiresIn },
    );
  }

  private signRefresh(userId: string): string {
    const { refreshSecret, refreshExpiresIn } = this.jwtOpts;
    return this.jwt.sign(
      { sub: userId, typ: 'refresh' },
      { secret: refreshSecret, expiresIn: refreshExpiresIn },
    );
  }

  private async buildPublicUser(userId: string): Promise<RequestUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        salonId: true,
        salon: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      salonId: user.salonId,
      salon: user.salon,
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const phone = dto.phone.trim();
    if (!phone) {
      throw new BadRequestException('Phone number is required.');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const salon = await tx.salon.findFirst({
          orderBy: { createdAt: 'asc' },
        });
        if (!salon) {
          throw new NotFoundException(
            'No salon exists yet. Run the database seed (creates the single salon) or add a Salon row.',
          );
        }

        const existingCustomer = await tx.customer.findFirst({
          where: { salonId: salon.id, phone },
        });
        if (existingCustomer) {
          throw new ConflictException(
            'This phone is already registered at that salon. Sign in, or use a different phone.',
          );
        }

        const user = await tx.user.create({
          data: {
            email,
            phone,
            passwordHash,
            fullName: dto.fullName.trim(),
            role: 'CUSTOMER',
            status: 'ACTIVE',
            salonId: salon.id,
          },
          select: { id: true, email: true, role: true },
        });

        await tx.customer.create({
          data: {
            salonId: salon.id,
            fullName: dto.fullName.trim(),
            phone,
            email,
          },
        });

        return user;
      });

      const user = await this.buildPublicUser(result.id);
      return {
        accessToken: this.signAccess(user),
        refreshToken: this.signRefresh(user.id),
        user,
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('An account with this email already exists.');
      }
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        passwordHash: true,
        status: true,
        salonId: true,
        phone: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    await assertUserMayAuthenticate(this.prisma, user);

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const publicUser = await this.buildPublicUser(user.id);
    return {
      accessToken: this.signAccess(publicUser),
      refreshToken: this.signRefresh(user.id),
      user: publicUser,
    };
  }

  async refresh(refreshToken: string) {
    const { refreshSecret } = this.jwtOpts;
    let sub: string;
    try {
      const payload = this.jwt.verify<{ sub: string; typ?: string }>(refreshToken, {
        secret: refreshSecret,
      });
      if (payload.typ !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token.');
      }
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const sessionUser = await this.prisma.user.findUnique({
      where: { id: sub },
      select: { role: true, status: true, salonId: true, phone: true },
    });
    await assertUserMayAuthenticate(this.prisma, sessionUser);

    const publicUser = await this.buildPublicUser(sub);
    return {
      accessToken: this.signAccess(publicUser),
      refreshToken: this.signRefresh(publicUser.id),
      user: publicUser,
    };
  }

  async me(user: RequestUser): Promise<RequestUser> {
    return this.buildPublicUser(user.id);
  }

  async updateMe(user: RequestUser, dto: UpdateMeDto): Promise<RequestUser> {
    const data: Prisma.UserUpdateInput = {};
    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim();
    }
    if (dto.email !== undefined) {
      data.email = dto.email.trim().toLowerCase();
    }
    if (dto.phone !== undefined) {
      data.phone = dto.phone.trim() || null;
    }
    if (dto.avatarUrl !== undefined) {
      data.avatarUrl = dto.avatarUrl.trim() || null;
    }

    if (Object.keys(data).length === 0) {
      return this.buildPublicUser(user.id);
    }

    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Another account already uses this email.');
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2000') {
        throw new BadRequestException('Avatar image is too large for storage. Try a smaller file.');
      }
      throw e;
    }

    return this.buildPublicUser(user.id);
  }

  async superAdminDashboard(user: RequestUser) {
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only super admin can access this dashboard.');
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const [
      salons,
      admins,
      staffMembers,
      customers,
      services,
      bookingsToday,
      upcomingBookings,
      completedThisWeek,
      recentBookings,
    ] = await Promise.all([
      this.prisma.salon.count(),
      this.prisma.user.count({ where: { role: 'SALON_OWNER', status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { role: { in: ['STAFF', 'RECEPTIONIST'] }, status: 'ACTIVE' } }),
      this.prisma.customer.count(),
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.booking.count({
        where: {
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
        },
      }),
      this.prisma.booking.count({
        where: {
          startTime: { gt: now },
          status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
        },
      }),
      this.prisma.booking.count({
        where: {
          startTime: { gte: weekStart },
          status: BookingStatus.COMPLETED,
        },
      }),
      this.prisma.booking.findMany({
        include: {
          salon: { select: { id: true, name: true } },
          customer: { select: { fullName: true } },
        },
        orderBy: { startTime: 'desc' },
        take: 6,
      }),
    ]);

    return {
      totals: {
        salons,
        admins,
        staffMembers,
        customers,
        services,
        bookingsToday,
        upcomingBookings,
        completedThisWeek,
      },
      recentBookings,
    };
  }
}
