// Input cleaning shared by the public form and the admin area.

export const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function phoneIsValid(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

// Admin input is strict: too long = an error the admin can fix, not a silent cut.
export const ADMIN_LIMITS = { name: 80, phone: 40, order_type: 100, heard_from: 100, comment: 1000 };

export function cleanAdminOrder(body = {}) {
  const value = {};
  const errors = {};
  for (const [field, max] of Object.entries(ADMIN_LIMITS)) {
    const raw = typeof body[field] === 'string' ? body[field].trim() : '';
    if (raw.length > max) errors[field] = 'too_long';
    value[field] = raw;
  }
  if (!errors.phone && !phoneIsValid(value.phone)) errors.phone = 'invalid';
  return { value, errors };
}
