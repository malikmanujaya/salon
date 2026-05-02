import { api } from '@/lib/api-client';
import type { CustomerDashboardSummary } from '@/types/customerDashboard';
import type { StaffDashboardSummary } from '@/types/staffDashboard';
import type { SuperAdminDashboardSummary } from '@/types/superAdminDashboard';

export async function fetchCustomerDashboard() {
  const { data } = await api.get<CustomerDashboardSummary>('/customers/me/dashboard');
  return data;
}

export async function fetchStaffDashboard() {
  const { data } = await api.get<StaffDashboardSummary>('/staff/me/dashboard');
  return data;
}

export async function fetchSuperAdminDashboard() {
  const { data } = await api.get<SuperAdminDashboardSummary>('/auth/superadmin/dashboard');
  return data;
}

