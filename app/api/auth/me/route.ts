export async function GET(req: Request) {
  const res = await fetch(`${process.env.HONO_BACKEND_URL}/auth/me`, {
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