import { api } from '@/lib/api';
import type { CreateSalonStaffRole, SalonStaffMember, StaffUserStatus } from '@/types/staff';

export type ListStaffMembersParams = {
  q?: string;
};

export type CreateStaffMemberInput = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: CreateSalonStaffRole;
  title?: string;
};

export type UpdateStaffMemberInput = {
  fullName?: string;
  phone?: string | null;
  role?: CreateSalonStaffRole;
  title?: string | null;
  status?: StaffUserStatus;
};

export async function listStaffMembers(params: ListStaffMembersParams = {}) {
  const { data } = await api.get<SalonStaffMember[]>('/staff/members', { params });
  return data;
}

export async function createStaffMember(payload: CreateStaffMemberInput) {
  const { data } = await api.post<SalonStaffMember>('/staff/members', payload);
  return data;
}

export async function updateStaffMember(memberId: string, payload: UpdateStaffMemberInput) {
  const { data } = await api.patch<SalonStaffMember>(`/staff/members/${memberId}`, payload);
  return data;
}

export async function deactivateStaffMember(memberId: string) {
  const { data } = await api.delete<SalonStaffMember>(`/staff/members/${memberId}`);
  return data;
}
