/**
 * Jest setup — runs before each test file.
 *
 * Provides:
 *   - `fetch` mock placeholder (each test resets via global.fetch = jest.fn())
 *   - `expo-linking` stub (no native module in jest-node)
 *   - `react-native-get-random-values` polyfill (uses node's crypto.getRandomValues)
 *   - silences logger output to keep test output clean
 */
import { webcrypto } from 'crypto';

if (typeof (globalThis as any).crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}

jest.mock('react-native-get-random-values', () => ({}));

jest.mock('expo-linking', () => ({
  createURL: (path: string, opts?: { queryParams?: Record<string, string> }) => {
    const base = `shadeapp://${path}`;
    if (!opts?.queryParams) return base;
    const params = new URLSearchParams(opts.queryParams).toString();
    return params ? `${base}?${params}` : base;
  },
  openURL: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));
