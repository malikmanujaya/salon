import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { configValidationSchema, configFactory } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { CustomersModule } from './customers/customers.module';
import { SalonServicesModule } from './salon-services/salon-services.module';
import { StaffModule } from './staff/staff.module';

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
    AuthModule,
    CustomersModule,
    SalonServicesModule,
    StaffModule,
    BookingsModule,
  ],
})
export class AppModule {}
