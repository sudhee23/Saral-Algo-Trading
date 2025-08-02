
export const runtime = 'edge';
export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }>}) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(req.url); // Extract query params (start, end)
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const interval = searchParams.get('interval') || '1d'; // Default to 1d interval if not provided
    const fetchUrl = `https://algo-trading-backend.saral-automations.workers.dev/quote/history/${resolvedParams.ticker}`;
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
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    console.error(`Failed to fetch data for ${resolvedParams.ticker}: ${res.statusText}`);
    return new Response(JSON.stringify({ error: `Backend returned ${res.status}` }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const data = await res.json();
  console.log('Successfully fetched history data for:', resolvedParams.ticker);
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  } catch (error) {
    console.error('Error in history API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch history data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 