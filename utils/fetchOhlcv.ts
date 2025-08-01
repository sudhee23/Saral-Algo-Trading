// lib/fetchOhlcv.ts
import { StockQuote } from '@/app/api/quote/ticker/[ticker]/route';
import { CandlestickData, Time } from 'lightweight-charts';

export interface Ohlcv extends CandlestickData<Time> {
  volume: number;
  adjClose?: number;
}

export async function fetchOhlcv(ticker: string): Promise<Ohlcv[]> {
  const res = await fetch(`api/quote/history/${ticker}?start=2025-07-26&end=2025-07-29`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to fetch data for ${ticker}`);
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


