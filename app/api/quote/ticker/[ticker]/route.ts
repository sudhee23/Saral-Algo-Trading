


export const runtime = 'edge';
export interface StockQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;

  regularMarketPrice: number;
  regularMarketOpen: number;
  regularMarketPreviousClose: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;

  marketCap: number;
  trailingPE?: number;
  forwardPE?: number;
  epsTrailingTwelveMonths?: number;

  dividendYield?: number;
  averageAnalystRating?: string;

  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekChangePercent?: number;
}
export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }>}) {
  const resolvedParams = await params;
  const fetchUrl = `https://algo-trading-backend.saral-automations.workers.dev/quote/ticker/${resolvedParams.ticker}`;
  const res = await fetch(fetchUrl, {
    method: 'GET',
    headers: {
      'Cookie': req.headers.get('cookie') || '',
      'Authorization': req.headers.get('authorization') || '',
    },
    credentials: 'include',
  });
  
  const data:StockQuote = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': res.headers.get('set-cookie') || '',
    },
  });
} 