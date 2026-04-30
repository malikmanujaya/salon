import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type RequestUser } from '../../common/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  private static readonly SINGLE_SALON_ID = 'cmofwb8i70001jbrc1f7zigpf';

  private resolveSalonId(_user: RequestUser): string {
    return BookingsController.SINGLE_SALON_ID;
  }

  @Get()
  @ApiOperation({ summary: 'List bookings in a time range' })
  list(@CurrentUser() user: RequestUser, @Query() query: QueryBookingsDto) {
    const salonId = this.resolveSalonId(user);
    return this.bookings.findAll(salonId, query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one booking' })
  one(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    const salonId = this.resolveSalonId(user);
    return this.bookings.findOne(salonId, id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create booking' })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateBookingDto) {
    const salonId = this.resolveSalonId(user);
    return this.bookings.create(salonId, user.id, dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking (time, staff, status, services, notes)' })
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateBookingDto) {
    const salonId = this.resolveSalonId(user);
    return this.bookings.update(salonId, id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel booking' })
  cancel(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    const salonId = this.resolveSalonId(user);
    return this.bookings.cancel(salonId, id, user);
  }
}


