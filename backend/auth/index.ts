import { Hono } from 'hono';
import { getUserByEmail, createUser } from '../db';
import { hashPassword, verifyPassword } from '../middlewares/hash';
import { signJwt, verifyJwt } from '../middlewares/jwt';
import type { Context } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';

function getD1(c: Context): D1Database {
  const db = (c.env as Record<string, unknown>).DB;
  if (!db) throw new Error('D1 database not found in context.env');
  return db as D1Database;
}

const auth = new Hono();

// POST /auth/login
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  const db = getD1(c);
  const user = await getUserByEmail(db, email);
  console.log('c.env:', c.env);
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  const valid = await verifyPassword(password, String(user.password));
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  const token = await signJwt({ id: user.id, email: user.email }, c);
  c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Secure; SameSite=Strict; Max-Age=3600`);
  return c.json({ success: true });
});

// POST /auth/signup
auth.post('/signup', async (c) => {
  const { email, password } = await c.req.json();
  const db = getD1(c);
  const existing = await getUserByEmail(db, email);
  console.log('c.env:', c.env);
  if (existing) {
    return c.json({ error: 'User already exists' }, 400);
  }
  const hash = await hashPassword(password);
  await createUser(db, email, hash);
  const token = await signJwt({ email }, c);
  c.header('Set-Cookie', `token=${token}; HttpOnly; Path=/; Secure; SameSite=Strict; Max-Age=3600`);
  return c.json({ success: true });
});

// GET /auth/me
auth.get('/me', async (c) => {
  let token = c.req.header('Authorization')?.replace('Bearer ', '') || c.req.query('token');
  if (!token) {
    // Try to get from cookie
    const cookie = c.req.header('Cookie');
    if (cookie) {
      const match = cookie.match(/token=([^;]+)/);
      if (match) token = match[1];
    }
  }
  if (!token) {
    return c.json({ user: null }, 401);
  }
  const user = await verifyJwt(token, c);
  if (!user) {
    return c.json({ user: null }, 401);
  }
  return c.json({ user });
});

// POST /auth/logout
auth.post('/logout', async (c) => {
  // Clear the cookie by setting an expired date
  c.header(
    'Set-Cookie',
    'token=; HttpOnly; Path=/; Secure; SameSite=Strict; Max-Age=0'
  );
  return c.json({ success: true });
});

export default auth; 