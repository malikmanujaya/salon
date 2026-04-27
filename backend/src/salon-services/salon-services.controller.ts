import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type RequestUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSalonServiceDto } from './dto/create-salon-service.dto';
import { UpdateSalonServiceDto } from './dto/update-salon-service.dto';
import { SalonServicesService } from './salon-services.service';

@ApiTags('services')
@Controller('salon-services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalonServicesController {
  constructor(private readonly salonServices: SalonServicesService) {}

  private static readonly SINGLE_SALON_ID = 'cmofwb8i70001jbrc1f7zigpf';

  private resolveSalonId(_user: RequestUser): string {
    return SalonServicesController.SINGLE_SALON_ID;
  }

  @Get()
  @ApiOperation({ summary: 'List active services (or all with includeInactive=true)' })
  list(
    @CurrentUser() user: RequestUser,
    @Query('includeInactive') includeInactive?: string,
  ) {
    this.salonServices.assertCanView(user);
    const salonId = this.resolveSalonId(user);
    const wantsAll = includeInactive === '1' || includeInactive === 'true';
    return wantsAll ? this.salonServices.listAll(salonId) : this.salonServices.listActive(salonId);
  }

  @Post()
  @ApiOperation({ summary: 'Create service and assign staff (multi-select)' })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateSalonServiceDto) {
    this.salonServices.assertCanManage(user);
    const salonId = this.resolveSalonId(user);
    return this.salonServices.create(salonId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service details/assignment' })
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateSalonServiceDto) {
    this.salonServices.assertCanManage(user);
    const salonId = this.resolveSalonId(user);
    return this.salonServices.update(salonId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate service' })
  deactivate(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    this.salonServices.assertCanManage(user);
    const salonId = this.resolveSalonId(user);
    return this.salonServices.deactivate(salonId, id);
  }
}
