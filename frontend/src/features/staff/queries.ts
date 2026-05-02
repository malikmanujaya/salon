import { useQuery } from '@tanstack/react-query';

import { listStaffMembers, type ListStaffMembersParams } from './api';

export const staffKeys = {
  all: ['staff-members'] as const,
  list: (params: ListStaffMembersParams) => [...staffKeys.all, 'list', params] as const,
};

export function useStaffMembersList(params: ListStaffMembersParams, enabled = true) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => listStaffMembers(params),
    enabled,
  });
}
