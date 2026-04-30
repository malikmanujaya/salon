export type RequestUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  salonId: string | null;
  salon: { id: string; name: string; slug: string } | null;
};
