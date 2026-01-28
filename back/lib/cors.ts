function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS ?? '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Builds CORS headers for the request.
 *
 * Configure allowed origins via env var `CORS_ORIGINS`:
 *   CORS_ORIGINS=https://example.com,https://www.example.com
 */
export function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('origin');
  if (!origin) return {};

  const allowed = getAllowedOrigins();

  // In local dev, allow any origin to reduce friction.
  const allowAnyInDev = process.env.NODE_ENV !== 'production' && allowed.length === 0;

  const allowAnyViaWildcard = allowed.includes('*');

  const isAllowed = allowAnyInDev || allowAnyViaWildcard || allowed.includes(origin);
  if (!isAllowed) return {};

  const requestedHeaders = req.headers.get('access-control-request-headers');
  const allowHeaders = requestedHeaders?.trim() ? requestedHeaders : 'Content-Type, Authorization';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': allowHeaders,
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
