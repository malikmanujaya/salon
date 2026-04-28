import { api } from '@/lib/api';
import type { CustomerAccountStatus, CustomerSummary } from '@/types/booking';

export type CustomersListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};

export type CustomersPageResponse = {
  items: CustomerSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateCustomerInput = {
  fullName: string;
  phone: string;
  email?: string;
};

export type UpdateCustomerInput = {
  fullName?: string;
  phone?: string;
  email?: string | null;
  accountStatus?: CustomerAccountStatus;
};

export async function listCustomers(params: CustomersListParams) {
  const { data } = await api.get<CustomersPageResponse>('/customers', { params });
  return data;
}

export async function createCustomer(payload: CreateCustomerInput) {
  const { data } = await api.post<CustomerSummary>('/customers', payload);
  return data;
}

export async function updateCustomer(customerId: string, payload: UpdateCustomerInput) {
  const { data } = await api.patch<CustomerSummary>(`/customers/${customerId}`, payload);
  return data;
}

export async function deactivateCustomer(customerId: string) {
  const { data } = await api.delete<CustomerSummary>(`/customers/${customerId}`);
  return data;
}
