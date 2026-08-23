import { randomUUID } from 'node:crypto';
import { bus } from './bus.js';
import type { LogEntry, LogLevel } from './types.js';

const RING_SIZE = 300;
const ring: LogEntry[] = [];

// Couleurs ANSI pour la console serveur (le frontend a son propre thème).
const ANSI: Record<LogLevel, string> = {
  info: '\x1b[37m',
  ok: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  detect: '\x1b[36m',
  trade: '\x1b[35m',
  sys: '\x1b[90m',
};
const RESET = '\x1b[0m';

export function log(
  level: LogLevel,
  source: string,
  message: string,
  data?: Record<string, unknown>,
): LogEntry {
  const entry: LogEntry = { id: randomUUID(), ts: Date.now(), level, source, message, data };

  ring.push(entry);
  if (ring.length > RING_SIZE) ring.shift();

  const time = new Date(entry.ts).toISOString().slice(11, 19);
  console.log(`${ANSI[level]}[${time}] ${source.padEnd(6)} ${message}${RESET}`);

  bus.emitMessage({ type: 'log', payload: entry });
  return entry;
}

export const logger = {
  info: (src: string, m: string, d?: Record<string, unknown>) => log('info', src, m, d),
  ok: (src: string, m: string, d?: Record<string, unknown>) => log('ok', src, m, d),
  warn: (src: string, m: string, d?: Record<string, unknown>) => log('warn', src, m, d),
  error: (src: string, m: string, d?: Record<string, unknown>) => log('error', src, m, d),
  detect: (src: string, m: string, d?: Record<string, unknown>) => log('detect', src, m, d),
  trade: (src: string, m: string, d?: Record<string, unknown>) => log('trade', src, m, d),
  sys: (src: string, m: string, d?: Record<string, unknown>) => log('sys', src, m, d),
};

export function recentLogs(): LogEntry[] {
  return [...ring];
}
