// lib/fetchOhlcv.ts
import { StockQuote } from '@/app/api/quote/ticker/[ticker]/route';
import { CandlestickData, Time } from 'lightweight-charts';

export interface Ohlcv extends CandlestickData<Time> {
  volume: number;
  adjClose?: number;
}

export async function fetchOhlcv(ticker: string): Promise<Ohlcv[]> {
  // Use a proper date range that will have data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 30 days ago
  
  const res = await fetch(`api/quote/history/${ticker}?start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`, { cache: 'no-store' });

  if (!res.ok) {
    console.error(`Failed to fetch data for ${ticker}: ${res.statusText}`);
    return []; // Return empty array instead of throwing
  }

  const json: Ohlcv[]= await res.json();
  return json ?? [];
}
export async function fetchquote(tickers:string[]):Promise<StockQuote[]>{
  const res = await fetch(`api/quote/ticker/${tickers.join(',')}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch quote for ${tickers.join(', ')}`);
  }
  const json: StockQuote[] = await res.json();
  return json;
}

export async function fetchTicker(ticker: string): Promise<StockQuote> {
  const res = await fetch(`api/quote/ticker/${ticker}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch ticker data for ${ticker}`);
  }
  const json: StockQuote = await res.json();
  return json;
}
