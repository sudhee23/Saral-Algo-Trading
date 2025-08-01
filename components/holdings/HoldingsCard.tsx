'use client';
import { useState } from 'react';

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
  onWithdraw?: (symbol: string, shares: number, amount: number) => Promise<void>;
}

function getColorForSymbol(symbol: string) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash += symbol.charCodeAt(i);
  return colors[hash % colors.length];
}

function getCompanyName(symbol: string) {
  const companies: { [key: string]: string } = {
    'RELIANCE': 'Reliance Industries Ltd.',
    'TCS': 'Tata Consultancy Services Ltd.',
    'INFY': 'Infosys Ltd.',
    'HDFC': 'HDFC Bank Ltd.',
    'WIPRO': 'Wipro Ltd.',
    'TATAMOTORS': 'Tata Motors Ltd.'
  };
  return companies[symbol] || `${symbol} Ltd.`;
}

function getSector(symbol: string) {
  const sectors: { [key: string]: string } = {
    'RELIANCE': 'Oil & Gas',
    'TCS': 'IT',
    'INFY': 'IT',
    'HDFC': 'Banking',
    'WIPRO': 'IT',
    'TATAMOTORS': 'Automobile'
  };
  return sectors[symbol] || 'Others';
}

export default function HoldingsCard({ holding, onWithdraw }: HoldingsCardProps) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [sharesToWithdraw, setSharesToWithdraw] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };

  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const shares = parseInt(e.target.value) || 0;
    setSharesToWithdraw(e.target.value);
    const amount = shares * holding.currentPrice;
    setWithdrawAmount(amount.toFixed(2));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setWithdrawAmount(e.target.value);
    const shares = Math.floor(amount / holding.currentPrice);
    setSharesToWithdraw(shares.toString());
  };

  const handleWithdrawSubmit = async () => {
    const shares = parseInt(sharesToWithdraw) || 0;
    const amount = parseFloat(withdrawAmount) || 0;

    if (shares <= 0 || shares > holding.quantity) {
      alert(`Please enter a valid number of shares (1 to ${holding.quantity})`);
      return;
    }

    if (onWithdraw) {
      await onWithdraw(holding.stock_symbol, shares, amount);
      setShowWithdrawModal(false);
      setSharesToWithdraw('');
      setWithdrawAmount('');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
        {/* Main Stock Info Row */}
        <div className="flex items-center justify-between mb-3">
          {/* Left: Logo and Company Info */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${getColorForSymbol(holding.stock_symbol)}`}>
              {holding.stock_symbol.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-base">{holding.stock_symbol}</div>
              <div className="text-xs text-gray-500">{getCompanyName(holding.stock_symbol)}</div>
              <div className="text-xs text-gray-400">{getSector(holding.stock_symbol)} • {holding.quantity} units</div>
            </div>
          </div>

          {/* Right: Price and P&L */}
          <div className="text-right">
            <div className="font-semibold text-gray-900 text-base">₹{holding.currentPrice.toLocaleString()}</div>
            <div className={`text-sm font-medium ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toLocaleString()} ({holding.pnlPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Holdings Summary */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleWithdrawClick}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-xs"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/>
            </svg>
            Withdraw
          </button>
          <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs">
            Details
          </button>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Withdraw from {holding.stock_symbol}</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                Available units: {holding.quantity} | Current price: ₹{holding.currentPrice.toLocaleString()}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Units
              </label>
              <input
                type="number"
                value={sharesToWithdraw}
                onChange={handleSharesChange}
                placeholder="Enter units to withdraw"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max={holding.quantity}
                step="1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                step="0.01"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleWithdrawSubmit}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
              >
                Withdraw Units
              </button>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 