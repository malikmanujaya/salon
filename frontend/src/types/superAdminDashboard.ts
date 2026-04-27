export type SuperAdminDashboardSummary = {
  totals: {
    salons: number;
    admins: number;
    staffMembers: number;
    customers: number;
    services: number;
    bookingsToday: number;
    upcomingBookings: number;
    completedThisWeek: number;
  };
  recentBookings: Array<{
    id: string;
    startTime: string;
    status: string;
    salon: { id: string; name: string };
    customer: { fullName: string };
  }>;
};

