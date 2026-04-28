import { useQuery } from '@tanstack/react-query';

import { listServices, listServiceStaff } from './api';

export const servicesKeys = {
  all: ['services'] as const,
  list: (q: string) => [...servicesKeys.all, 'list', q] as const,
  staff: ['services', 'staff'] as const,
};

export function useServicesList(q: string, enabled = true) {
  return useQuery({
    queryKey: servicesKeys.list(q),
    queryFn: () => listServices({ includeInactive: true, q: q.trim() || undefined }),
    enabled,
  });
}

export function useServiceStaff(enabled = true) {
  return useQuery({
    queryKey: servicesKeys.staff,
    queryFn: listServiceStaff,
    enabled,
  });
}

