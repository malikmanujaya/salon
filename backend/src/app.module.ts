import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configValidationSchema, configFactory } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configFactory],
      validate: configValidationSchema,
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
