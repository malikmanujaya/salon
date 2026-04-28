export function validateStaffMember(fullName: string): string | null {
  if (!fullName.trim()) return 'Full name is required.';
  return null;
}

