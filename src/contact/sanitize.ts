export function sanitizeString(input: unknown, maxLength = 10000): string {
  if (input == null) return '';
  const str = String(input).slice(0, maxLength);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
