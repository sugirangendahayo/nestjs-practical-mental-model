// Injection tokens + contracts. The tests replace these providers with fakes,
// so keep the token names exactly as they are.

export const SLUG_GENERATOR = 'SLUG_GENERATOR';
export interface SlugGenerator {
  generate(): string;
}

export const CLOCK = 'CLOCK';
export interface Clock {
  now(): Date;
}

export const APP_CONFIG = 'APP_CONFIG';
export interface AppConfig {
  baseUrl: string; // e.g. "http://localhost:3000" (no trailing slash)
}
