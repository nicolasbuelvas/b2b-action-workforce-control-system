export function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .trim();
}

export function normalizeLinkedInUrl(url: string): string {
  return url
    .toLowerCase()
    .split('?')[0]
    .replace(/\/$/, '')
    .trim();
}

export function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}
