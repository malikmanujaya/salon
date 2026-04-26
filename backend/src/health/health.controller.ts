import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';

import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.checkDatabase()]);
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    const key = 'database';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { [key]: { status: 'up' } };
    } catch (error) {
      return {
        [key]: {
          status: 'down',
          message: (error as Error).message,
        },
      };
    }
  }
}
