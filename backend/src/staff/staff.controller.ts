import { Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type RequestUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { requireSalonId } from '../common/require-salon';
import { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import { StaffDirectoryService } from './staff.service';

@ApiTags('staff')
@Controller('staff')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staff: StaffDirectoryService) {}

  private static readonly SUPER_ADMIN_SALON_ID = 'cmofwb8i70001jbrc1f7zigpf';

  private resolveSalonId(user: RequestUser): string {
    return user.role === 'SUPER_ADMIN' ? StaffController.SUPER_ADMIN_SALON_ID : requireSalonId(user);
  }

  @Get()
  @ApiOperation({ summary: 'List active stylists (staff profiles) for bookings' })
  list(@CurrentUser() user: RequestUser) {
    const salonId = this.resolveSalonId(user);
    return this.staff.listForSalon(salonId);
  }

  @Get('members')
  @ApiOperation({ summary: 'List salon team (admin, receptionist, stylists)' })
  listMembers(@CurrentUser() user: RequestUser) {
    this.staff.assertCanViewMembers(user);
    const salonId = this.resolveSalonId(user);
    return this.staff.listMembers(salonId);
  }

  @Post('members')
  @ApiOperation({ summary: 'Create salon user (Receptionist, Admin/Owner, or Staff)' })
  createMember(@CurrentUser() user: RequestUser, @Body() dto: CreateStaffMemberDto) {
    if (user.role === 'CUSTOMER') {
      throw new ForbiddenException('Customers cannot create staff.');
    }
    const salonId = this.resolveSalonId(user);
    return this.staff.createMember(salonId, dto, user);
  }
}
