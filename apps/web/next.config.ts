import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV !== 'production';
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
let apiOrigin: string;

try {
  const parsedApiUrl = new URL(apiUrl);
  if (!['http:', 'https:'].includes(parsedApiUrl.protocol) || parsedApiUrl.username || parsedApiUrl.password) {
    throw new Error();
  }
  const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsedApiUrl.hostname);
  if (!isDevelopment && parsedApiUrl.protocol !== 'https:' && !isLoopback) {
    throw new Error();
  }
  apiOrigin = parsedApiUrl.origin;
} catch {
  throw new Error('NEXT_PUBLIC_API_URL must be a credential-free HTTP(S) URL and use HTTPS outside local development.');
}

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}${isDevelopment ? ' ws://localhost:3000 ws://127.0.0.1:3000' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

if (process.env.ENABLE_HSTS === 'true') {
  securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
