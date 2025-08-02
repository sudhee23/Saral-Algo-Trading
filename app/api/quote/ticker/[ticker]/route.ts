import data from "@/data.json";

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

// Convert data.json format to StockQuote format
function convertDataToStockQuote(ticker: string): StockQuote | null {
  const openKey = `('Open', '${ticker}')`;
  const highKey = `('High', '${ticker}')`;
  const lowKey = `('Low', '${ticker}')`;
  const closeKey = `('Close', '${ticker}')`;
  const volumeKey = `('Volume', '${ticker}')`;

  const openData = data[openKey as keyof typeof data] as Record<string, number>;
  const highData = data[highKey as keyof typeof data] as Record<string, number>;
  const lowData = data[lowKey as keyof typeof data] as Record<string, number>;
  const closeData = data[closeKey as keyof typeof data] as Record<string, number>;
  const volumeData = data[volumeKey as keyof typeof data] as Record<string, number>;

  if (!openData || !highData || !lowData || !closeData || !volumeData) {
    return null;
  }

  // Get the latest data (last timestamp)
  const timestamps = Object.keys(closeData).sort();
  const latestTimestamp = timestamps[timestamps.length - 1];
  const previousTimestamp = timestamps[timestamps.length - 2];

  const currentPrice = closeData[latestTimestamp];
  const previousClose = previousTimestamp ? closeData[previousTimestamp] : currentPrice;
  const openPrice = openData[latestTimestamp];
  const highPrice = highData[latestTimestamp];
  const lowPrice = lowData[latestTimestamp];
  const volume = volumeData[latestTimestamp];

  return {
    symbol: ticker,
    shortName: ticker.replace('.NS', ''),
    longName: ticker.replace('.NS', ' Limited'),
    currency: 'INR',
    regularMarketPrice: currentPrice,
    regularMarketOpen: openPrice,
    regularMarketPreviousClose: previousClose,
    regularMarketDayHigh: highPrice,
    regularMarketDayLow: lowPrice,
    regularMarketVolume: volume,
    marketCap: currentPrice * volume * 100, // Approximate market cap
    fiftyTwoWeekLow: Math.min(...Object.values(lowData)),
    fiftyTwoWeekHigh: Math.max(...Object.values(highData)),
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }>}) {
  try {
    const resolvedParams = await params;
    const ticker = resolvedParams.ticker.toUpperCase();
    
    console.log('Fetching stock data for:', ticker);
    
    const stockData = convertDataToStockQuote(ticker);
    
    if (!stockData) {
      console.error('No data found for ticker:', ticker);
      return new Response(JSON.stringify({ error: 'Stock data not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Successfully fetched data for:', ticker);
    
    return new Response(JSON.stringify([stockData]), {
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