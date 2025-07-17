import type { D1Database } from '@cloudflare/workers-types';

// lib/db.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function queryLocalDb(sql: string, params: unknown[] = []) {
  // in local dev, connect to SQLite with better-sqlite3 or similar
  return []; // fake
}

export async function queryCloudflareDb(db: D1Database, sql: string, params: unknown[] = []) {
  return await db.prepare(sql).bind(...params).all();
}
