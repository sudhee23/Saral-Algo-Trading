'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchTicker } from '@/utils/fetchOhlcv';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Graph from '@/components/Graph';

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
  const [activeTab, setActiveTab] = useState('summary');

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
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 flex">
          {/* Left Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-6 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-300 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-6 bg-gray-300 rounded"></div>
                ))}
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
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
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

  const navigationTabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'chart', label: 'Chart' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'historical', label: 'Historical Data' },
    { id: 'profile', label: 'Profile' },
    { id: 'financials', label: 'Financials' },
    { id: 'analysis', label: 'Analysis' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{stockData.shortName}</h2>
            <nav className="space-y-1">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Stock Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {stockData.shortName} ({stockData.symbol})
                </h1>
                <p className="text-gray-600">{stockData.longName}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">
                  ₹{stockData.regularMarketPrice.toFixed(2)}
                </div>
                <div className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </div>
                <div className="text-sm text-gray-600">Previous Close: ₹{stockData.regularMarketPreviousClose.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          {activeTab === 'chart' && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <Graph initialTicker={ticker} />
            </div>
          )}

          {/* Summary Section */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Key Metrics Table */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Previous Close</div>
                    <div className="font-semibold">₹{stockData.regularMarketPreviousClose.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Open</div>
                    <div className="font-semibold">₹{stockData.regularMarketOpen.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Day&apos;s Range</div>
                    <div className="font-semibold">₹{stockData.regularMarketDayLow.toFixed(2)} - ₹{stockData.regularMarketDayHigh.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Volume</div>
                    <div className="font-semibold">{stockData.regularMarketVolume.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Market Cap</div>
                    <div className="font-semibold">₹{(stockData.marketCap / 1e12).toFixed(2)}T</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">52 Week Range</div>
                    <div className="font-semibold">₹{stockData.fiftyTwoWeekLow.toFixed(2)} - ₹{stockData.fiftyTwoWeekHigh.toFixed(2)}</div>
                  </div>
                  {stockData.trailingPE && (
                    <div>
                      <div className="text-sm text-gray-600">P/E Ratio</div>
                      <div className="font-semibold">{stockData.trailingPE.toFixed(2)}</div>
                    </div>
                  )}
                  {stockData.dividendYield && (
                    <div>
                      <div className="text-sm text-gray-600">Dividend Yield</div>
                      <div className="font-semibold">{stockData.dividendYield.toFixed(2)}%</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <Graph initialTicker={ticker} />
              </div>
            </div>
          )}

          {/* Statistics Section */}
          {activeTab === 'statistics' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Trading Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Open</span>
                      <span className="font-semibold">₹{stockData.regularMarketOpen.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Day High</span>
                      <span className="font-semibold">₹{stockData.regularMarketDayHigh.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Day Low</span>
                      <span className="font-semibold">₹{stockData.regularMarketDayLow.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume</span>
                      <span className="font-semibold">{stockData.regularMarketVolume.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Valuation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Cap</span>
                      <span className="font-semibold">₹{(stockData.marketCap / 1e12).toFixed(2)}T</span>
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
                        <span className="font-semibold">₹{stockData.epsTrailingTwelveMonths.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs can be implemented similarly */}
          {!['summary', 'chart', 'statistics'].includes(activeTab) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{navigationTabs.find(tab => tab.id === activeTab)?.label}</h3>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="space-y-6">
            {/* Quote Lookup */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Quote Lookup</h3>
              <input
                type="text"
                placeholder="Search for stocks..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Market Indices */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Market Indices</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">NIFTY 50</span>
                  <span className="font-semibold text-green-600">22,419.95 +0.45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SENSEX</span>
                  <span className="font-semibold text-green-600">73,852.94 +0.32%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BANK NIFTY</span>
                  <span className="font-semibold text-red-600">48,123.45 -0.12%</span>
                </div>
              </div>
            </div>

            {/* Top Gainers */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Top Gainers</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">TCS.NS</span>
                  <span className="font-semibold text-green-600">₹3,456.78 +2.34%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">INFY.NS</span>
                  <span className="font-semibold text-green-600">₹1,234.56 +1.87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">HDBANK.NS</span>
                  <span className="font-semibold text-green-600">₹987.65 +1.23%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 