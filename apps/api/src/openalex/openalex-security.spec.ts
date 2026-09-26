import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeOpenAlexId, parseOpenAlexId, safeExternalUrl } from './openalex-security';

test('normalizes canonical OpenAlex URLs', () => {
  assert.equal(normalizeOpenAlexId('https://api.openalex.org/W12345'), 'W12345');
  assert.equal(normalizeOpenAlexId('https%3A%2F%2Fopenalex.org%2FT987'), 'T987');
});

test('accepts only the expected OpenAlex entity type', () => {
  assert.equal(parseOpenAlexId('W12345', 'work'), 'W12345');
  assert.throws(() => parseOpenAlexId('T12345', 'work'), /Invalid OpenAlex work identifier/);
  assert.throws(() => parseOpenAlexId('%E0%A4%A', 'work'), /Invalid OpenAlex work identifier/);
});

test('allows only credential-free HTTPS external links', () => {
  assert.equal(safeExternalUrl('https://example.org/paper'), 'https://example.org/paper');
  assert.equal(safeExternalUrl('http://example.org/paper'), null);
  assert.equal(safeExternalUrl('javascript:alert(1)'), null);
  assert.equal(safeExternalUrl('https://user:secret@example.org/paper'), null);
  assert.equal(safeExternalUrl('not a URL'), null);
});
