const MAX_STRING_LENGTH = 10000;

function sanitizeString(input: unknown, maxLength = MAX_STRING_LENGTH): string {
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

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (typeof v === 'string') {
      (out as Record<string, unknown>)[key] = sanitizeString(v);
    } else if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      (out as Record<string, unknown>)[key] = sanitizeObject(v as Record<string, unknown>);
    }
  }
  return out;
}
