import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type RequestUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { requireSalonId } from '../common/require-salon';
import { StaffDirectoryService } from './staff.service';

@ApiTags('staff')
@Controller('staff')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staff: StaffDirectoryService) {}

  @Get()
  @ApiOperation({ summary: 'List active staff for your salon' })
  list(@CurrentUser() user: RequestUser) {
    const salonId = requireSalonId(user);
    return this.staff.listForSalon(salonId);
  }
}
