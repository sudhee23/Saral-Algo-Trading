

export const runtime = 'edge';
export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }>}) {
  // async access the ticker from params
  const { ticker } = await params;
  const { searchParams } = new URL(req.url); // Extract query params (start, end)
  const startDate = await searchParams.get('start');
  const endDate = await searchParams.get('end');
  const interval = await searchParams.get('interval') || '5m'; // Default to 5m interval if not provided
  const fetchUrl = `https://algo-trading-backend.saral-automations.workers.dev/quote/history/${ticker}`
  const queryParts = [];
  if (startDate) {
    queryParts.push(`start=${startDate}`);
  }
  if (endDate) {
    queryParts.push(`end=${endDate}`);
  }
  if (interval) {
    queryParts.push(`interval=${interval}`); // Only add if your Hono backend expects this
  }
  const res = await fetch(`${fetchUrl}?${queryParts.join('&')}`, {
    method: 'GET',
    headers: {
      'Cookie': req.headers.get('cookie') || '',
      'Authorization': req.headers.get('authorization') || '',
    },
    credentials: 'include',
  });
  if (!res.ok) {
    console.error(`Failed to fetch data for ${ticker}: ${res.statusText}`);
    throw new Error(`Failed to fetch data for ${ticker}`);
  }
  
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': res.headers.get('set-cookie') || '',
    },
  });
} 