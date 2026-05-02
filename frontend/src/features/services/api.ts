import { api } from '@/lib/api-client';
import type { StaffSummary } from '@/types/booking';

import type { ServiceInput, ServiceRow } from './types';

export async function listServices(params: { includeInactive?: boolean; q?: string }) {
  const { data } = await api.get<ServiceRow[]>('/salon-services', { params });
  return data;
}

export async function createService(payload: ServiceInput) {
  const { data } = await api.post<ServiceRow>('/salon-services', payload);
  return data;
}

export async function updateService(serviceId: string, payload: ServiceInput) {
  const { data } = await api.patch<ServiceRow>(`/salon-services/${serviceId}`, payload);
  return data;
}

export async function deactivateService(serviceId: string) {
  const { data } = await api.delete<ServiceRow>(`/salon-services/${serviceId}`);
  return data;
}

export async function listServiceStaff() {
  const { data } = await api.get<StaffSummary[]>('/staff');
  return data;
}

