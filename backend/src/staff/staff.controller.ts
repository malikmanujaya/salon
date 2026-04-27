import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type RequestUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import { UpdateStaffMemberDto } from './dto/update-staff-member.dto';
import { StaffDirectoryService } from './staff.service';

@ApiTags('staff')
@Controller('staff')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staff: StaffDirectoryService) {}

  private static readonly SINGLE_SALON_ID = 'cmofwb8i70001jbrc1f7zigpf';

  private resolveSalonId(_user: RequestUser): string {
    return StaffController.SINGLE_SALON_ID;
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

  @Patch('members/:id')
  @ApiOperation({ summary: 'Update salon team member details/role/status' })
  updateMember(
    @CurrentUser() user: RequestUser,
    @Param('id') memberId: string,
    @Body() dto: UpdateStaffMemberDto,
  ) {
    const salonId = this.resolveSalonId(user);
    return this.staff.updateMember(salonId, memberId, dto, user);
  }

  @Delete('members/:id')
  @ApiOperation({ summary: 'Deactivate salon team member account' })
  deactivateMember(@CurrentUser() user: RequestUser, @Param('id') memberId: string) {
    const salonId = this.resolveSalonId(user);
    return this.staff.deactivateMember(salonId, memberId, user);
  }
}
