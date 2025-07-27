'use client';

interface WatchlistWithPrice {
  id: string;
  stock_symbol: string;
  added_at: string;
  currentPrice: number;
}

interface WatchlistCardProps {
  item: WatchlistWithPrice;
  onRemove: (symbol: string) => void;
}

function getColorForSymbol(symbol: string) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash += symbol.charCodeAt(i);
  return colors[hash % colors.length];
}

export default function WatchlistCard({ item, onRemove }: WatchlistCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getColorForSymbol(item.stock_symbol)}`}>
            {item.stock_symbol.slice(0,2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-lg">{item.stock_symbol}</div>
            <div className="text-sm text-gray-500">Added {new Date(item.added_at).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="text-right">
            <div className="font-semibold text-gray-900 text-lg">₹{item.currentPrice.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Current Price</div>
          </div>
          <button 
            onClick={() => onRemove(item.stock_symbol)} 
            className="px-3 py-1.5 text-red-600 hover:text-red-800 font-medium hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
} 