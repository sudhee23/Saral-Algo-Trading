import jwt from 'jsonwebtoken';

export function signJwt(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!);
}
