import { api } from '@/lib/api-client';
import type { BookingDetail, CustomerSummary, SalonServiceSummary, StaffSummary } from '@/types/booking';

type CustomersResponse = CustomerSummary[] | { items?: CustomerSummary[] };

export async function listBookings(params: { from?: string | null; to?: string | null }) {
  const { data } = await api.get<BookingDetail[]>('/bookings', { params });
  return data;
}

export async function listBookingCustomers() {
  const { data } = await api.get<CustomersResponse>('/customers');
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function listBookingServices() {
  const { data } = await api.get<SalonServiceSummary[]>('/salon-services');
  return data;
}

export async function listBookingStaff() {
  const { data } = await api.get<StaffSummary[]>('/staff');
  return data;
}

