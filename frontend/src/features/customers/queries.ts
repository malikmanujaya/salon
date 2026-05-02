import { useQuery } from '@tanstack/react-query';

import { listCustomers, type CustomersListParams } from './api';

export const customersKeys = {
  all: ['customers'] as const,
  list: (params: CustomersListParams) => [...customersKeys.all, 'list', params] as const,
};

export function useCustomersList(params: CustomersListParams, enabled = true) {
  return useQuery({
    queryKey: customersKeys.list(params),
    queryFn: () => listCustomers(params),
    enabled,
  });
}
