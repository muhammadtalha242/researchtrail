import { BadRequestException } from '@nestjs/common';

const OPENALEX_ID_PATTERNS = {
  author: /^A\d{1,20}$/,
  topic: /^T\d{1,20}$/,
  work: /^W\d{1,20}$/,
} as const;

export function normalizeOpenAlexId(value: string) {
  try {
    return decodeURIComponent(value)
      .replace(/^https?:\/\/(api\.)?openalex\.org\//i, '')
      .trim();
  } catch {
    return '';
  }
}

export function parseOpenAlexId(value: string, entity: keyof typeof OPENALEX_ID_PATTERNS) {
  const normalized = normalizeOpenAlexId(value);
  if (!OPENALEX_ID_PATTERNS[entity].test(normalized)) {
    throw new BadRequestException(`Invalid OpenAlex ${entity} identifier.`);
  }
  return normalized;
}

export function safeExternalUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}
