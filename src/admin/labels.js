// All visible admin texts that are not in the components themselves. The admin is in English;
// the status values are the ones stored in the database (see STATUSES in server/db.js).
export const STATUS_LABELS = { 'to deliver': 'To deliver', 'in delivery': 'In delivery', delivered: 'Delivered' };
export const DEFAULT_STATUSES = Object.keys(STATUS_LABELS);
export const statusLabel = (s) => STATUS_LABELS[s] || s;
export const statusClass = (s) => `st-${String(s).replace(/\s+/g, '-')}`;

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date added' },
  { value: 'status', label: 'Status' },
];

export const LIMITS = { name: 80, phone: 40, order_type: 100, heard_from: 100, comment: 1000 }; // same as the server

export const phoneIsValid = (p) => {
  const n = String(p).replace(/\D/g, '').length;
  return n >= 7 && n <= 15;
};

const FIELD_NAMES = { name: 'Name', phone: 'Phone', order_type: 'Order', heard_from: 'Heard from', comment: 'Comment' };
export function fieldError(field, code) {
  if (code === 'invalid' && field === 'phone') return 'Enter a valid phone number (7–15 digits).';
  if (code === 'too_long') return `${FIELD_NAMES[field] || field} is too long (max ${LIMITS[field]} characters).`;
  return 'Please check this field.';
}

export function errorText(err) {
  if (!err) return 'Something went wrong.';
  if (err.status === 404) return 'This order no longer exists.';
  if (err.status === 429) return 'Too many attempts. Try again later.';
  if (err.status === 0) return 'No connection to the server.';
  return 'Something went wrong. Please try again.';
}
