'use client';

interface HoldingWithPrice {
  id: string;
  stock_symbol: string;
  quantity: number;
  avg_price: number;
  created_at: string;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  pnl: number;
  pnlPercent: number;
}

interface HoldingsCardProps {
  holding: HoldingWithPrice;
}

function getColorForSymbol(symbol: string) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash += symbol.charCodeAt(i);
  return colors[hash % colors.length];
}

export default function HoldingsCard({ holding }: HoldingsCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
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
  );
} 