'use client';

interface WatchlistWithPrice {
  id: string;
  stock_symbol: string;
  added_at: string;
  currentPrice: number;
}

import WatchlistCard from './WatchlistCard';

interface WatchlistListProps {
  watchlist: WatchlistWithPrice[];
  onRemoveFromWatchlist: (symbol: string) => void;
}

export default function WatchlistList({ watchlist, onRemoveFromWatchlist }: WatchlistListProps) {
  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="mb-6">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <span className="text-5xl text-gray-300 font-bold">👀</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">No stocks in watchlist</h2>
        <p className="text-gray-500 mb-6">Add stocks to your watchlist to track them here</p>
        <button className="px-6 py-2 bg-[#001f3f] text-white rounded-lg font-semibold hover:bg-[#001a33] transition">
          Add to Watchlist
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Your Watchlist</h3>
        <div className="text-sm text-gray-500">
          {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''}
        </div>
      </div>
      {watchlist.map((item) => (
        <WatchlistCard 
          key={item.id} 
          item={item} 
          onRemove={onRemoveFromWatchlist}
        />
      ))}
    </div>
  );
} 