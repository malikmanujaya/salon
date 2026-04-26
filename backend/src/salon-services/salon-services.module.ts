import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { SalonServicesController } from './salon-services.controller';
import { SalonServicesService } from './salon-services.service';

@Module({
  imports: [PrismaModule],
  controllers: [SalonServicesController],
  providers: [SalonServicesService],
})
export class SalonServicesModule {}
