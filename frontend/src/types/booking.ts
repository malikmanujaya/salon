export type BookingCustomer = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
};

export type BookingStaff = {
  id: string;
  title: string | null;
  user: { id: string; fullName: string; email: string };
};

export type BookingServiceLine = {
  id: string;
  serviceId: string;
  priceCents: number;
  durationMinutes: number;
  service: { id: string; name: string };
};

export type BookingDetail = {
  id: string;
  salonId: string;
  branchId: string | null;
  customerId: string;
  staffId: string | null;
  startTime: string;
  endTime: string;
  status: string;
  source: string;
  notes: string | null;
  customer: BookingCustomer;
  staff: BookingStaff | null;
  services: BookingServiceLine[];
};

export type CustomerSummary = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  createdAt: string;
  salon?: { id: string; name: string; slug: string };
};

export type SalonServiceSummary = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  branchId: string | null;
  categoryId: string | null;
  category: { id: string; name: string } | null;
};

export type StaffSummary = {
  id: string;
  title: string | null;
  branchId: string | null;
  user: { id: string; fullName: string; email: string };
};
