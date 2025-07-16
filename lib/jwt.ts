import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET || 'your_secret'; // replace in prod

export function signJwt(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
