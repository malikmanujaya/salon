import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';
import type { RequestUser } from '../decorators/current-user.decorator';

type AccessPayload = {
  sub: string;
  email: string;
  role: string;
  typ?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService<AppConfig>,
    private readonly prisma: PrismaService,
  ) {
    const jwt = config.get('jwt', { infer: true });
    if (!jwt?.accessSecret) {
      throw new Error('JWT access secret is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.accessSecret,
    });
  }

  async validate(payload: AccessPayload): Promise<RequestUser> {
    if (payload.typ && payload.typ !== 'access') {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

    if (!user || user.status !== 'ACTIVE') {
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
}
