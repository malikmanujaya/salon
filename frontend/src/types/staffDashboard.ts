import type { BookingDetail } from './booking';

export type StaffDashboardSummary = {
  staffId: string | null;
  totals: {
    today: number;
    upcoming: number;
    completedThisWeek: number;
    total: number;
  };
  nextBooking: BookingDetail | null;
  todayBookings: BookingDetail[];
  recentBookings: BookingDetail[];
};

