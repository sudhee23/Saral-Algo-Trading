export async function POST() {
  const res = await fetch(`${process.env.HONO_BACKEND_URL}/auth/logout`, {
    method: 'POST',
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