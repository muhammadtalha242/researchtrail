const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:3000';

export type RuntimeEnvironment = {
  frontendOrigin: string;
  host: string;
  isProduction: boolean;
  port: number;
  trustProxyHops: number;
};

function parseInteger(name: string, value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = value === undefined || value === '' ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

function parseOrigin(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('FRONTEND_URL must be an absolute HTTP(S) origin.');
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('FRONTEND_URL must be an absolute HTTP(S) origin without credentials, path, query or fragment.');
  }

  return url.origin;
}

export function readRuntimeEnvironment(env: NodeJS.ProcessEnv = process.env): RuntimeEnvironment {
  const isProduction = env.NODE_ENV === 'production';
  if (isProduction && !env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is required in production.');
  }

  const frontendOrigin = parseOrigin(env.FRONTEND_URL || DEFAULT_FRONTEND_ORIGIN);
  if (isProduction && new URL(frontendOrigin).protocol !== 'https:') {
    throw new Error('FRONTEND_URL must use HTTPS in production.');
  }

  return {
    frontendOrigin,
    host: env.HOST?.trim() || '127.0.0.1',
    isProduction,
    port: parseInteger('PORT', env.PORT, 4000, 1, 65_535),
    trustProxyHops: parseInteger('TRUST_PROXY_HOPS', env.TRUST_PROXY_HOPS, 0, 0, 5),
  };
}
