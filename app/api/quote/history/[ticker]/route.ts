import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const resolvedParams = await params;
    const ticker = resolvedParams.ticker.toUpperCase();
    const url = new URL(req.url);
    
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    const interval = url.searchParams.get('interval') || '5m';

    //@ts-expect-error: Backend URL from env
    const backendBase = getRequestContext().env.HONO_BACKEND_URL || 'https://algo-trading-backend.saral-automations.workers.dev';
    const backendUrl = new URL(`/quote/history/${ticker}`, backendBase);
    if (start) backendUrl.searchParams.set('start', start);
    if (end) backendUrl.searchParams.set('end', end);
    backendUrl.searchParams.set('interval', interval);

    const res = await fetch(backendUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`Backend responded with status ${res.status}`);
      return new Response(JSON.stringify({ error: 'Failed to fetch data from backend' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await res.json();

    // If backend already returns chartData in correct format:
    if (!Array.isArray(result)) {
      return new Response(JSON.stringify({ error: 'Invalid data format from backend' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chart proxy route:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch chart data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
