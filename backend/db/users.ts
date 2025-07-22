import { D1Database } from '@cloudflare/workers-types';

export async function getUserByEmail(db: D1Database, email: string) {
  const result = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  return result;
}

export async function createUser(db: D1Database, email: string, password: string, role:string = 'USER') {
  return await db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?)').bind(email, password, role).run();
} 