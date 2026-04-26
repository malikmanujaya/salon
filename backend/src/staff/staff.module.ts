import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { StaffController } from './staff.controller';
import { StaffDirectoryService } from './staff.service';

@Module({
  imports: [PrismaModule],
  controllers: [StaffController],
  providers: [StaffDirectoryService],
})
export class StaffModule {}
