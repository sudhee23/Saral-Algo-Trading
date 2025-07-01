// lib/fetchOhlcv.ts
import { CandlestickData, Time } from 'lightweight-charts';

export interface Ohlcv extends CandlestickData<Time> {
  volume: number;
}

export async function fetchOhlcv(ticker: string): Promise<Ohlcv[]> {
  const basePath = '/Saral-Algo-Trading/newohlcv.json'; // or real API later

  const res = await fetch(basePath, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to fetch data for ${ticker}`);
  }

  const json = await res.json();
  return json[ticker] ?? [];
}
