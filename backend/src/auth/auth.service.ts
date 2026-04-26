import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';

import type { AppConfig } from '../config/configuration';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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

  private generateSalonSlug(): string {
    return `s-${randomBytes(12).toString('hex')}`;
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
      role: user.role,
      status: user.status,
      salonId: user.salonId,
      salon: user.salon,
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const salonName = `${dto.fullName.trim()}'s Salon`;
        const salon = await tx.salon.create({
          data: {
            name: salonName,
            slug: this.generateSalonSlug(),
          },
        });

        const user = await tx.user.create({
          data: {
            email,
            phone: dto.phone?.trim() || null,
            passwordHash,
            fullName: dto.fullName.trim(),
            role: 'SALON_OWNER',
            status: 'ACTIVE',
            salonId: salon.id,
          },
          select: { id: true, email: true, role: true },
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
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid email or password.');
    }

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
}
