import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type RequestUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { requireSalonId } from '../common/require-salon';
import { SalonServicesService } from './salon-services.service';

@ApiTags('services')
@Controller('salon-services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalonServicesController {
  constructor(private readonly salonServices: SalonServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List active services for your salon' })
  list(@CurrentUser() user: RequestUser) {
    const salonId = requireSalonId(user);
    return this.salonServices.listActive(salonId);
  }
}
