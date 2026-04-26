import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import type { AppConfig } from '../config/configuration';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<AppConfig>) {
    super({
      datasources: {
        db: { url: config.get('databaseUrl', { infer: true }) },
      },
      log: ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Connected to MySQL via Prisma');
    } catch (error) {
      this.logger.warn(
        `Prisma could not connect to the database — the API will keep running, ` +
          `but database calls will fail until MySQL is reachable. (${(error as Error).message})`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
