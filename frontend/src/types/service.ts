export type ServiceAssignedStaff = {
  id: string;
  title: string | null;
  user: { id: string; fullName: string; email: string };
};

export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staff: ServiceAssignedStaff[];
};

export type ServiceInput = {
  name: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
  currency?: string;
  staffIds?: string[];
};

