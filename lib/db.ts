import type { D1Database } from '@cloudflare/workers-types';

// lib/db.ts
export async function queryLocalDb(sql: string, params: any[] = []) {
  // in local dev, connect to SQLite with better-sqlite3 or similar
  return []; // fake
}

export async function queryCloudflareDb(db: D1Database, sql: string, params: any[] = []) {
  return await db.prepare(sql).bind(...params).all();
}
