'use client';

import { StockQuote } from "@/app/api/quote/ticker/[ticker]/route";
import { fetchquote } from "@/utils/fetchOhlcv";
import { useState, useEffect } from "react";
import Link from "next/link";

// Move SECTOR_TICKERS outside the component
const SECTOR_TICKERS: Record<string, string> = {
    'BANKING': '^NSEBANK',
    'IT': '^CNXIT',
    'PHARMA': '^CNXPHARMA',
    'ENERGY': '^CNXENERGY',
};

const RECOMMENDED_STOCKS = [
    'RELIANCE.NS',
    'TCS.NS', 
    'INFY.NS',
    'HDBANK.NS',
    'MARUTI.NS'
];

export default function StocksTable() {
    // List of sector along with current value and change percentage using fetchOhlcv
    const [sectorData, setSectorData] = useState<{ sector: string; ticker: string; value: number; change: number }[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const tickers = Object.values(SECTOR_TICKERS);
            const quotes: StockQuote[] = await fetchquote(tickers);
            const data = Object.entries(SECTOR_TICKERS).map(([sector, ticker]) => {
                const quote = quotes.find(q => q.symbol === ticker);
                if (quote) {
                    const value = quote.regularMarketPrice || 0;
                    const change = (quote.regularMarketPrice - quote.regularMarketOpen) / quote.regularMarketOpen * 100 || 0;
                    return { sector, ticker, value, change };
                }
                return null;
            });
            setSectorData(data.filter(Boolean) as { sector: string; ticker: string; value: number; change: number }[]);
        };
        fetchData();
    }, []);
    return (
        <div className="w-full h-full p-4 bg-gray-900 text-white rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sector Performance</h2>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="bg-gray-800">
                        <th className="px-4 py-2 border-b">Sector</th>
                        <th className="px-4 py-2 border-b">Current Value</th>
                        <th className="px-4 py-2 border-b">Change (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {sectorData.map((sector) => (
                        <tr key={sector.ticker} className="hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-2 border-b">{sector.sector}</td>
                            <td className="px-4 py-2 border-b">{sector.value.toFixed(2)}</td>
                            <td className={`px-4 py-2 border-b ${sector.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {sector.change.toFixed(2)}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2 className="text-xl font-semibold mt-6 mb-4">Recommended Stocks</h2>
            <div className="space-y-2">
                {RECOMMENDED_STOCKS.map((stock) => (
                    <Link 
                        key={stock} 
                        href={`/stock/${stock}`}
                        className="block text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        {stock}
                    </Link>
                ))}
            </div>
        </div>
    );

}
