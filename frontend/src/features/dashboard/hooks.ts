import { useQuery } from '@tanstack/react-query';

import { fetchCustomerDashboard, fetchStaffDashboard, fetchSuperAdminDashboard } from './api';

export const dashboardKeys = {
  customer: (userId?: string) => ['dashboard', 'customer', userId] as const,
  staff: (userId?: string) => ['dashboard', 'staff', userId] as const,
  superAdmin: (userId?: string) => ['dashboard', 'super-admin', userId] as const,
};

export function useCustomerDashboard(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.customer(userId),
    queryFn: fetchCustomerDashboard,
    enabled,
  });
}

export function useStaffDashboard(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.staff(userId),
    queryFn: fetchStaffDashboard,
    enabled,
  });
}

export function useSuperAdminDashboard(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.superAdmin(userId),
    queryFn: fetchSuperAdminDashboard,
    enabled,
  });
}

