export type SalonStaffMember = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
  staffProfile: {
    id: string;
    title: string | null;
    status: string;
    branchId: string | null;
  } | null;
};

export type CreateSalonStaffRole = 'RECEPTIONIST' | 'SALON_OWNER' | 'STAFF';
