export async function POST() {
  //@ts-expect-error: Environment variable is not defined in the type definitions
  const res = await fetch(`${getRequestContext().env.HONO_BACKEND_URL}/auth/logout`, {
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