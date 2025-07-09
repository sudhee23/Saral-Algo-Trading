import { NextResponse } from 'next/server';
import { comparePassword } from '@/lib/hash';
import { signJwt } from '@/lib/jwt';
import { queryUserByEmail, Env } from '@/lib/db';

export async function POST(req: Request, { env }: { env: Env }) {
  const { email, password } = await req.json();

  const user = await queryUserByEmail(env.DB, email);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await comparePassword(password, user.password as string);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signJwt({ id: user.id, email });

  const res = NextResponse.json({ message: 'Login successful' });
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return res;
}
