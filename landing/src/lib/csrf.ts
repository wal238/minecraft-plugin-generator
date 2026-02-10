const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_BUILDER_URL,
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:5173'] : []),
]);

export function validateOrigin(req: Request): Response | null {
  const origin = req.headers.get('origin');

  // Primary check: Origin header
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return null;
  }

  // Fallback: Sec-Fetch-Site header (browser-enforced, cannot be spoofed by JS)
  const secFetchSite = req.headers.get('sec-fetch-site');
  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
    return null;
  }

  return new Response('Forbidden: invalid origin', { status: 403 });
}
