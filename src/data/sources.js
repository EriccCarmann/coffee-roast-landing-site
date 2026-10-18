// Options of "Where did you hear about us?".
// `value` is what is sent and saved (readable Russian, like order_type). The label the visitor sees comes from the
// translations: order.s1, order.s2 ... (same keys as here, see src/i18n/locales/*.json).
// This list is used by the form AND by the server (which accepts only these values), so edit it here only:
// add a line here + the same key in all three locale files.
export const SOURCES = [
  { key: 's1', value: 'Реклама' },
  { key: 's2', value: 'Поиск в интернете' },
  { key: 's3', value: 'YouTube' },
  { key: 's4', value: 'Instagram' },
  { key: 's5', value: 'Telegram' },
  { key: 's6', value: 'Рекомендация знакомых' },
  { key: 's7', value: 'Другое' },
];
