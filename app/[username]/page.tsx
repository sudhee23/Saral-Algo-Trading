'use client';
import { useMe } from '@/hooks/useMe';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchOhlcv } from '@/utils/fetchOhlcv';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const runtime = 'edge';

interface Holding {
  id: string;
  stock_symbol: string;
  quantity: number;
  avg_price: number;
  created_at: string;
}

interface WatchlistItem {
  id: string;
  stock_symbol: string;
  added_at: string;
}

interface HoldingWithPrice extends Holding {
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  pnl: number;
  pnlPercent: number;
}

interface WatchlistWithPrice extends WatchlistItem {
  currentPrice: number;
}

const TABS = [
  { key: 'holdings', label: 'Holdings' },
  { key: 'watchlist', label: 'Watchlist' },
];

function getColorForSymbol(symbol: string) {
  // Simple hash for color
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash += symbol.charCodeAt(i);
  return colors[hash % colors.length];
}



export default function UserPage() {
  const { user, isLoading } = useMe();
  const params = useParams();
  const router = useRouter();
  const routeUsername = params.username;
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [holdingsData, setHoldingsData] = useState<HoldingWithPrice[]>([]);
  const [watchlistData, setWatchlistData] = useState<WatchlistWithPrice[]>([]);
  const [activeTab, setActiveTab] = useState<'holdings' | 'watchlist'>('holdings');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Redirect if logged in user does not match route username
  useEffect(() => {
    if (!isLoading && user && user.email) {
      const userName = user.email.split('@')[0];
      if (userName !== routeUsername) {
        router.replace(`/${userName}`);
      }
    }
  }, [isLoading, user, routeUsername, router]);

  // Mock data for holdings and watchlist
  useEffect(() => {
    if (user) {
      // Mock holdings data
      const mockHoldings: Holding[] = [
        {
          id: '1',
          stock_symbol: 'RELIANCE',
          quantity: 100,
          avg_price: 2500,
          created_at: '2024-01-15'
        },
        {
          id: '2',
          stock_symbol: 'TCS',
          quantity: 50,
          avg_price: 3800,
          created_at: '2024-02-20'
        },
        {
          id: '3',
          stock_symbol: 'INFY',
          quantity: 75,
          avg_price: 1500,
          created_at: '2024-03-10'
        }
      ];
      setHoldings(mockHoldings);

      // Mock watchlist data
      const mockWatchlist: WatchlistItem[] = [
        {
          id: '1',
          stock_symbol: 'HDFC',
          added_at: '2024-01-10'
        },
        {
          id: '2',
          stock_symbol: 'WIPRO',
          added_at: '2024-02-05'
        },
        {
          id: '3',
          stock_symbol: 'TATAMOTORS',
          added_at: '2024-03-15'
        }
      ];
      setWatchlist(mockWatchlist);
    }
  }, [user]);

  // Fetch current prices for holdings and watchlist
  useEffect(() => {
    if (holdings.length > 0 || watchlist.length > 0) {
      fetchCurrentPrices();
    }
  }, [holdings, watchlist]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const fetchCurrentPrices = useCallback(async () => {
    try {
      const allSymbols = [
        ...holdings.map(h => h.stock_symbol),
        ...watchlist.map(w => w.stock_symbol)
      ];
      
      const uniqueSymbols = [...new Set(allSymbols)];
      const priceData = await Promise.all(
        uniqueSymbols.map(async (symbol) => {
          try {
            const ohlcv = await fetchOhlcv(symbol);
            if (ohlcv.length > 0) {
              const last = ohlcv[ohlcv.length - 1];
              return { symbol, currentPrice: last.close };
            }
            return { symbol, currentPrice: 0 };
          } catch {
            return { symbol, currentPrice: 0 };
          }
        })
      );

      // Update holdings data with current prices
      const holdingsWithPrices = holdings.map(holding => {
        const priceInfo = priceData.find(p => p.symbol === holding.stock_symbol);
        const currentPrice = priceInfo?.currentPrice || 0;
        const totalValue = holding.quantity * currentPrice;
        const totalCost = holding.quantity * holding.avg_price;
        const pnl = totalValue - totalCost;
        const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
        
        return {
          ...holding,
          currentPrice,
          totalValue,
          totalCost,
          pnl,
          pnlPercent
        };
      });
      setHoldingsData(holdingsWithPrices);

      // Update watchlist data with current prices
      const watchlistWithPrices = watchlist.map(item => {
        const priceInfo = priceData.find(p => p.symbol === item.stock_symbol);
        return {
          ...item,
          currentPrice: priceInfo?.currentPrice || 0
        };
      });
      setWatchlistData(watchlistWithPrices);
    } catch {
      console.error('Error fetching current prices');
    }
  }, [holdings, watchlist]);

  const removeFromWatchlist = async (symbol: string) => {
    // Mock removal - just filter out the item
    setWatchlist(prev => prev.filter(item => item.stock_symbol !== symbol));
    setWatchlistData(prev => prev.filter(item => item.stock_symbol !== symbol));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="mb-4">Don&apos;t have an account?</p>
        <Link href={`/login?next=/${routeUsername}`}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Log in here
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Groww-style Header Bar */}
      <div className="w-full bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Left: Logo and Stocks label */}
          <div className="flex items-center space-x-3 -ml-2">
            <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 16L10 10L14 14L20 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Stocks</span>
          </div>
          {/* Right: Search, bell, profile */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm" />
              <span className="absolute left-3 top-2.5 text-gray-400">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-2-2"/></svg>
              </span>
            </div>
            {/* Removed profile icon and dropdown from header */}
          </div>
        </div>
      </div>

      {/* (Removed profile card section) */}
      {/* Tabs and ALTRA header */}
      <div className="bg-white sticky top-16 z-20 shadow-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Removed ALTRA logo/text */}
              <nav className="flex space-x-8">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'holdings' | 'watchlist')}
                    className={`text-base font-medium pb-2 border-b-2 transition-all duration-200 ${
                      activeTab === tab.key 
                        ? 'border-[#001f3f] text-[#001f3f]' 
                        : 'border-transparent text-gray-500 hover:text-[#001f3f] hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {activeTab === 'holdings' ? `${holdingsData.length} Holdings` : `${watchlistData.length} Watchlist`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Holdings/Watchlist Tabs and Content (as before) */}
        {activeTab === 'holdings' && (
          <div className="bg-white rounded-xl shadow p-8 mt-8">
            {holdingsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="mb-6">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <span className="text-5xl text-gray-300 font-bold">📈</span>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-800">Introducing Holdings</h2>
                <p className="text-gray-500 mb-6">Investing in stocks will never be the same again</p>
                <button className="px-6 py-2 bg-[#001f3f] text-white rounded-lg font-semibold hover:bg-[#001a33] transition">Try it out</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Your Holdings</h3>
                  <div className="text-sm text-gray-500">
                    {holdingsData.length} stock{holdingsData.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {holdingsData.map((holding) => (
                  <div key={holding.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getColorForSymbol(holding.stock_symbol)}`}>
                          {holding.stock_symbol.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">{holding.stock_symbol}</div>
                          <div className="text-sm text-gray-500">{holding.quantity} shares</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-lg">₹{holding.currentPrice.toLocaleString()}</div>
                        <div className={`text-sm font-medium ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toLocaleString()} ({holding.pnlPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Avg Price</div>
                          <div className="font-medium text-gray-900">₹{holding.avg_price.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Value</div>
                          <div className="font-medium text-gray-900">₹{holding.totalValue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Cost</div>
                          <div className="font-medium text-gray-900">₹{holding.totalCost.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Watchlist Section */}
        {activeTab === 'watchlist' && (
          <div className="bg-white rounded-xl shadow p-8 mt-8">
            {watchlistData.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="mb-6">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <span className="text-5xl text-gray-300 font-bold">👀</span>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-800">No stocks in watchlist</h2>
                <p className="text-gray-500 mb-6">Add stocks to your watchlist to track them here</p>
                <button className="px-6 py-2 bg-[#001f3f] text-white rounded-lg font-semibold hover:bg-[#001a33] transition">Add to Watchlist</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Your Watchlist</h3>
                  <div className="text-sm text-gray-500">
                    {watchlistData.length} stock{watchlistData.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {watchlistData.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getColorForSymbol(item.stock_symbol)}`}>
                          {item.stock_symbol.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">{item.stock_symbol}</div>
                          <div className="text-sm text-gray-500">Added {new Date(item.added_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 text-lg">₹{item.currentPrice.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Current Price</div>
                        </div>
                        <button 
                          onClick={() => removeFromWatchlist(item.stock_symbol)} 
                          className="px-4 py-2 text-red-600 hover:text-red-800 font-medium hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}