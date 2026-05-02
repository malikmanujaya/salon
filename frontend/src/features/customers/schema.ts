export function validateCustomerPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return 'Phone must be exactly 10 digits.';
  return null;
}

