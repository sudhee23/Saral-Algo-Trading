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

import HoldingsCard from './HoldingsCard';

interface HoldingsListProps {
  holdings: HoldingWithPrice[];
  onWithdraw?: (symbol: string, shares: number, amount: number) => Promise<void>;
}

export default function HoldingsList({ holdings, onWithdraw }: HoldingsListProps) {
  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="mb-6">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <span className="text-5xl text-gray-300 font-bold">📈</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Introducing Holdings</h2>
        <p className="text-gray-500 mb-6">Investing in stocks will never be the same again</p>
        <button className="px-6 py-2 bg-[#001f3f] text-white rounded-lg font-semibold hover:bg-[#001a33] transition">
          Try it out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Your Holdings</h3>
        <div className="text-sm text-gray-500">
          {holdings.length} stock{holdings.length !== 1 ? 's' : ''}
        </div>
      </div>
      {holdings.map((holding) => (
        <HoldingsCard key={holding.id} holding={holding} onWithdraw={onWithdraw} />
      ))}
    </div>
  );
} 