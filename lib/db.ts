import { D1Database } from '@cloudflare/workers-types';

export type Env = {
  DB: D1Database
}

// helper to run a query (works inside Next.js API routes)
export async function queryUserByEmail(db: D1Database, email: string) {
  const { results } = await db.prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .all();
  return results[0];
}

export async function insertUser(db: D1Database, id: string, email: string, hashedPassword: string) {
  await db.prepare("INSERT INTO users (id, email, password) VALUES (?, ?, ?)")
    .bind(id, email, hashedPassword)
    .run();
}
