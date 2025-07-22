import { sign, verify } from 'hono/jwt';
import { Context } from 'hono';
import { JWTPayload } from 'hono/utils/jwt/types';

const JWT_SECRET = (c: Context) => c.env.JWT_SECRET || 'your_secret';

export async function signJwt(payload: JWTPayload, c: Context) {
  return await sign(payload, JWT_SECRET(c));
}

export async function verifyJwt(token: string, c: Context) {
  try {
    return await verify(token, JWT_SECRET(c));
  } catch {
    return null;
  }
} 