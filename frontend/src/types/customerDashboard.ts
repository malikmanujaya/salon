import type { BookingDetail } from './booking';

export type CustomerDashboardSummary = {
  customerId: string | null;
  totals: {
    upcoming: number;
    completed: number;
    cancelled: number;
    total: number;
  };
  nextBooking: BookingDetail | null;
  recentBookings: BookingDetail[];
};
