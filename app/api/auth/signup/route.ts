import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/hash';
import { signJwt } from '@/lib/jwt';
import { insertUser, queryUserByEmail, Env } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(req: Request, { env }: { env: Env }) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await queryUserByEmail(env.DB, email);
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const userId = nanoid();

  await insertUser(env.DB, userId, email, hashed);

  const token = signJwt({ id: userId, email });

  const res = NextResponse.json({ message: 'User created' });
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return res;
}
