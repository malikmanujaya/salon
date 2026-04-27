import { Body, Controller, ForbiddenException, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, type RequestUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { requireSalonId } from '../common/require-salon';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomersDto } from './dto/query-customers.dto';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get('me/dashboard')
  @ApiOperation({ summary: 'Customer dashboard summary (self)' })
  meDashboard(@CurrentUser() user: RequestUser) {
    const salonId = requireSalonId(user);
    return this.customers.customerDashboard(salonId, user);
  }

  @Get()
  @ApiOperation({ summary: 'Search customers (optional q)' })
  list(@CurrentUser() user: RequestUser, @Query() query: QueryCustomersDto) {
    const salonId = requireSalonId(user);
    return this.customers.list(salonId, query.q, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create customer' })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateCustomerDto) {
    if (user.role === 'CUSTOMER') {
      throw new ForbiddenException('Salon customers cannot add CRM records.');
    }
    const salonId = requireSalonId(user);
    return this.customers.create(salonId, dto);
  }
}
