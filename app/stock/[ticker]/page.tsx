'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchTicker } from '@/utils/fetchOhlcv';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const runtime = 'edge';

interface StockDetail {
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

export default function StockDetailPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [stockData, setStockData] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const data = await fetchTicker(ticker);
        setStockData(data);
      } catch (err) {
        setError('Failed to fetch stock data');
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchStockData();
    }
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="p-6 flex-1">
          <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-300 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="p-6 flex-1">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Stock Not Found</h1>
            <p className="text-gray-600">Unable to fetch data for {ticker}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const priceChange = stockData.regularMarketPrice - stockData.regularMarketPreviousClose;
  const priceChangePercent = (priceChange / stockData.regularMarketPreviousClose) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-6 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {stockData.shortName} ({stockData.symbol})
            </h1>
            <p className="text-gray-600 mb-4">{stockData.longName}</p>
            
            {/* Price Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-800">
                    ${stockData.regularMarketPrice.toFixed(2)}
                  </div>
                  <div className={`text-lg ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Previous Close</div>
                  <div className="text-lg font-semibold">${stockData.regularMarketPreviousClose.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Trading Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Open</span>
                  <span className="font-semibold">${stockData.regularMarketOpen.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Day High</span>
                  <span className="font-semibold">${stockData.regularMarketDayHigh.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Day Low</span>
                  <span className="font-semibold">${stockData.regularMarketDayLow.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volume</span>
                  <span className="font-semibold">{stockData.regularMarketVolume.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Valuation</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Cap</span>
                  <span className="font-semibold">${(stockData.marketCap / 1e9).toFixed(2)}B</span>
                </div>
                {stockData.trailingPE && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">P/E Ratio</span>
                    <span className="font-semibold">{stockData.trailingPE.toFixed(2)}</span>
                  </div>
                )}
                {stockData.forwardPE && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Forward P/E</span>
                    <span className="font-semibold">{stockData.forwardPE.toFixed(2)}</span>
                  </div>
                )}
                {stockData.epsTrailingTwelveMonths && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">EPS (TTM)</span>
                    <span className="font-semibold">${stockData.epsTrailingTwelveMonths.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">52 Week Range</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">High</span>
                  <span className="font-semibold">${stockData.fiftyTwoWeekHigh.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Low</span>
                  <span className="font-semibold">${stockData.fiftyTwoWeekLow.toFixed(2)}</span>
                </div>
                {stockData.fiftyTwoWeekChangePercent && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Change</span>
                    <span className={`font-semibold ${stockData.fiftyTwoWeekChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stockData.fiftyTwoWeekChangePercent.toFixed(2)}%
                    </span>
                  </div>
                )}
                {stockData.dividendYield && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dividend Yield</span>
                    <span className="font-semibold">{stockData.dividendYield.toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {stockData.averageAnalystRating && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Analyst Rating</h3>
              <div className="text-lg font-semibold text-blue-600">{stockData.averageAnalystRating}</div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 