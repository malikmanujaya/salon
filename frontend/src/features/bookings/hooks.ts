import { useQuery } from '@tanstack/react-query';

import { listBookingCustomers, listBookings, listBookingServices, listBookingStaff } from './api';

export const bookingsKeys = {
  all: ['bookings'] as const,
  list: (from: string | null, to: string | null) => [...bookingsKeys.all, 'list', from, to] as const,
  customers: ['bookings', 'customers'] as const,
  services: ['bookings', 'services'] as const,
  staff: ['bookings', 'staff'] as const,
};

export function useBookingsList(fromIso: string | null, toIso: string | null, enabled = true) {
  return useQuery({
    queryKey: bookingsKeys.list(fromIso, toIso),
    queryFn: () => listBookings({ from: fromIso, to: toIso }),
    enabled,
  });
}

export function useBookingCustomers(enabled = true) {
  return useQuery({
    queryKey: bookingsKeys.customers,
    queryFn: listBookingCustomers,
    enabled,
  });
}

export function useBookingServices(enabled = true) {
  return useQuery({
    queryKey: bookingsKeys.services,
    queryFn: listBookingServices,
    enabled,
  });
}

export function useBookingStaff(enabled = true) {
  return useQuery({
    queryKey: bookingsKeys.staff,
    queryFn: listBookingStaff,
    enabled,
  });
}

