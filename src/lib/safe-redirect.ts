/** Allow only same-origin relative paths (no protocol-relative or auth loops). */
export function getSafeInternalPath(
  next: string | null | undefined,
  fallback = '/',
): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return fallback;
  }

  try {
    const url = new URL(next, 'http://localhost');
    if (url.pathname.startsWith('/auth')) {
      return fallback;
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}
