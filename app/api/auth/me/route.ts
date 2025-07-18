import {getRequestContext} from '@cloudflare/next-on-pages';
export const runtime = 'edge';
export async function GET(req: Request) {
  //@ts-expect-error: Environment variable is not defined in the type definitions
  const res = await fetch(`${getRequestContext().env.HONO_BACKEND_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Cookie': req.headers.get('cookie') || '',
      'Authorization': req.headers.get('authorization') || '',
    },
    credentials: 'include',
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': res.headers.get('set-cookie') || '',
    },
  });
} 