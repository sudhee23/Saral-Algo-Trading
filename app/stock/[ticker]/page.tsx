'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useChart } from '@/hooks/useChart';
import { fetchOhlcv, fetchTicker, Ohlcv } from '@/utils/fetchOhlcv';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  
  const [stockData, setStockData] = useState<StockDetail | null>(null);
  const [chartData, setChartData] = useState<Ohlcv[]>([]);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'volume'>('candlestick');
  const [timeframe, setTimeframe] = useState<'1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y'>('1d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stock details
  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        setLoading(true);
        const details = await fetchTicker(ticker);
        setStockData(details);
      } catch (err) {
        setError('Failed to fetch stock details');
        console.error('Error fetching stock details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchStockDetails();
    }
  }, [ticker]);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const data = await fetchOhlcv(ticker);
        setChartData(data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
      }
    };

    if (ticker) {
      fetchChartData();
    }
  }, [ticker, timeframe]);

  // Initialize chart
  useEffect(() => {
    if (chartContainerRef.current && chartData.length > 0) {
      useChart(chartContainerRef, chartData, chartType);
    }
  }, [chartData, chartType]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Stock Not Found</h2>
            <p className="text-gray-600">Unable to fetch data for {ticker}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const priceChange = stockData.regularMarketPrice - stockData.regularMarketPreviousClose;
  const priceChangePercent = (priceChange / stockData.regularMarketPreviousClose) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 p-6">
        {/* Stock Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stockData.shortName}</h1>
              <p className="text-lg text-gray-600">{stockData.symbol}</p>
              {stockData.longName && (
                <p className="text-sm text-gray-500 mt-1">{stockData.longName}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {stockData.currency} {stockData.regularMarketPrice.toFixed(2)}
              </div>
              <div className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </div>
              <div className="text-sm text-gray-500">
                Previous Close: {stockData.currency} {stockData.regularMarketPreviousClose.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Market Cap</div>
              <div className="text-lg font-semibold">
                {stockData.marketCap ? `$${(stockData.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Volume</div>
              <div className="text-lg font-semibold">
                {stockData.regularMarketVolume.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">P/E Ratio</div>
              <div className="text-lg font-semibold">
                {stockData.trailingPE ? stockData.trailingPE.toFixed(2) : 'N/A'}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">52W Range</div>
              <div className="text-lg font-semibold">
                ${stockData.fiftyTwoWeekLow.toFixed(2)} - ${stockData.fiftyTwoWeekHigh.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Price Chart</h2>
            <div className="flex items-center gap-2">
              {/* Timeframe Selector */}
                             <select
                 value={timeframe}
                 onChange={(e) => setTimeframe(e.target.value as '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y')}
                 className="px-3 py-1 border border-gray-300 rounded-md text-sm"
               >
                <option value="1d">1D</option>
                <option value="5d">5D</option>
                <option value="1mo">1M</option>
                <option value="3mo">3M</option>
                <option value="6mo">6M</option>
                <option value="1y">1Y</option>
              </select>
              
              {/* Chart Type Selector */}
              {['candlestick', 'line', 'volume'].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type as 'candlestick' | 'line' | 'volume')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    chartType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full h-96 bg-black rounded-md overflow-hidden">
            <div ref={chartContainerRef} className="w-full h-full" />
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trading Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Trading Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Open</span>
                <span className="font-semibold">{stockData.currency} {stockData.regularMarketOpen.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Day High</span>
                <span className="font-semibold">{stockData.currency} {stockData.regularMarketDayHigh.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Day Low</span>
                <span className="font-semibold">{stockData.currency} {stockData.regularMarketDayLow.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volume</span>
                <span className="font-semibold">{stockData.regularMarketVolume.toLocaleString()}</span>
              </div>
              {stockData.dividendYield && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dividend Yield</span>
                  <span className="font-semibold">{(stockData.dividendYield * 100).toFixed(2)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Valuation Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Valuation Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-semibold">
                  {stockData.marketCap ? `$${(stockData.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">P/E Ratio (TTM)</span>
                <span className="font-semibold">
                  {stockData.trailingPE ? stockData.trailingPE.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Forward P/E</span>
                <span className="font-semibold">
                  {stockData.forwardPE ? stockData.forwardPE.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">EPS (TTM)</span>
                <span className="font-semibold">
                  {stockData.epsTrailingTwelveMonths ? stockData.epsTrailingTwelveMonths.toFixed(2) : 'N/A'}
                </span>
              </div>
              {stockData.averageAnalystRating && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Analyst Rating</span>
                  <span className="font-semibold">{stockData.averageAnalystRating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 