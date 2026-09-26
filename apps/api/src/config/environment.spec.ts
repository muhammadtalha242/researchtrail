import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { readRuntimeEnvironment } from './environment';

test('uses loopback-safe development defaults', () => {
  assert.deepEqual(readRuntimeEnvironment({}), {
    frontendOrigin: 'http://localhost:3000',
    host: '127.0.0.1',
    isProduction: false,
    port: 4000,
    trustProxyHops: 0,
  });
});

test('rejects an invalid frontend origin', () => {
  assert.throws(
    () => readRuntimeEnvironment({ FRONTEND_URL: 'https://user:secret@example.com/path' }),
    /FRONTEND_URL must be an absolute HTTP\(S\) origin/,
  );
});

test('requires an explicit frontend origin in production', () => {
  assert.throws(() => readRuntimeEnvironment({ NODE_ENV: 'production' }), /FRONTEND_URL is required in production/);
  assert.throws(
    () => readRuntimeEnvironment({ NODE_ENV: 'production', FRONTEND_URL: 'http://example.com' }),
    /FRONTEND_URL must use HTTPS/,
  );
});

test('rejects unsafe proxy-hop and port values', () => {
  assert.throws(() => readRuntimeEnvironment({ TRUST_PROXY_HOPS: '99' }), /TRUST_PROXY_HOPS/);
  assert.throws(() => readRuntimeEnvironment({ PORT: '0' }), /PORT/);
});
