


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
  try {
    const resolvedParams = await params;
    const fetchUrl = `https://algo-trading-backend.saral-automations.workers.dev/quote/ticker/${resolvedParams.ticker}`;
    
    console.log('Fetching from:', fetchUrl);
    
    const res = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error('Backend response not ok:', res.status, res.statusText);
      return new Response(JSON.stringify({ error: `Backend returned ${res.status}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const dataArray = await res.json() as StockQuote[];
    console.log('Successfully fetched data for:', resolvedParams.ticker);
    
    // Backend returns an array, so we need to extract the first item
    const data: StockQuote = dataArray[0];
    
    if (!data) {
      return new Response(JSON.stringify({ error: 'No stock data found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch stock data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 