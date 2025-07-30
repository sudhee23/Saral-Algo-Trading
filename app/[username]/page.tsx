'use client';
import { useMe } from '@/hooks/useMe';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchOhlcv } from '@/utils/fetchOhlcv';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HoldingsList from '@/components/holdings/HoldingsList';
import WatchlistList from '@/components/watchlist/WatchlistList';

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
  
  // New state for amount request modals
  const [showAddAmountModal, setShowAddAmountModal] = useState(false);
  const [showWithdrawAmountModal, setShowWithdrawAmountModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

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

  // New functions for handling amount requests
  const handleAddAmountRequest = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      // Here you would typically make an API call to submit the request
      console.log('Add amount request:', addAmount);
      alert(`Add amount request of ₹${addAmount} submitted successfully!`);
      setAddAmount('');
      setShowAddAmountModal(false);
    } catch (error) {
      alert('Failed to submit add amount request');
    }
  };

  const handleWithdrawAmountRequest = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      // Here you would typically make an API call to submit the request
      console.log('Withdraw amount request:', withdrawAmount);
      alert(`Withdraw amount request of ₹${withdrawAmount} submitted successfully!`);
      setWithdrawAmount('');
      setShowWithdrawAmountModal(false);
    } catch (error) {
      alert('Failed to submit withdraw amount request');
    }
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
        {/* Holdings/Watchlist Tabs and Content */}
        {activeTab === 'holdings' && (
          <div className="bg-white rounded-xl shadow p-8 mt-8">
            {/* Add Amount Request and Withdraw Amount Request Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setShowAddAmountModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Amount Request
              </button>
              <button
                onClick={() => setShowWithdrawAmountModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/>
                </svg>
                Withdraw Amount Request
              </button>
            </div>
            <HoldingsList holdings={holdingsData} />
          </div>
        )}
        {/* Watchlist Section */}
        {activeTab === 'watchlist' && (
          <div className="bg-white rounded-xl shadow p-8 mt-8">
            <WatchlistList 
              watchlist={watchlistData} 
              onRemoveFromWatchlist={removeFromWatchlist}
            />
          </div>
        )}
      </div>

      {/* Add Amount Request Modal */}
      {showAddAmountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Amount Request</h3>
              <button
                onClick={() => setShowAddAmountModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Add (₹)
              </label>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                step="0.01"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddAmountRequest}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowAddAmountModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Amount Request Modal */}
      {showWithdrawAmountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Withdraw Amount Request</h3>
              <button
                onClick={() => setShowWithdrawAmountModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Withdraw (₹)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                step="0.01"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleWithdrawAmountRequest}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
              >
                Submit Request
              </button>
              <button
                onClick={() => setShowWithdrawAmountModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}