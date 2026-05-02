import { ApiProperty } from '@nestjs/swagger';

export class SuperAdminDashboardTotalsDto {
  @ApiProperty() salons!: number;
  @ApiProperty() admins!: number;
  @ApiProperty() staffMembers!: number;
  @ApiProperty() customers!: number;
  @ApiProperty() services!: number;
  @ApiProperty() bookingsToday!: number;
  @ApiProperty() upcomingBookings!: number;
  @ApiProperty() completedThisWeek!: number;
}

export class SuperAdminDashboardSummaryDto {
  @ApiProperty({ type: SuperAdminDashboardTotalsDto })
  totals!: SuperAdminDashboardTotalsDto;

  @ApiProperty()
  recentBookings!: Array<{
    id: string;
    startTime: Date;
    status: string;
    salon: { id: string; name: string };
    customer: { fullName: string };
  }>;
}



