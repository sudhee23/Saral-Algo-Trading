import { D1Database } from '@cloudflare/workers-types';

export async function getUserByEmail(db: D1Database, email: string) {
  const result = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  return result;
}

export async function createUser(db: D1Database, email: string, password: string) {
  return await db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').bind(email, password).run();
} 