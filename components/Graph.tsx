"use client";
import React, { useEffect, useRef, useState } from "react";
import { useChart } from "@/hooks/useChart";
import { fetchOhlcv, Ohlcv } from "@/utils/fetchOhlcv";

type GraphData = {
  initialTicker: string;
};

export default function Graph({ initialTicker }: GraphData) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartType, setChartType] = useState<"candlestick" | "line" | "volume">("candlestick");
  const [ticker, setTicker] = useState<string>(initialTicker);
  const [data, setData] = useState<Ohlcv[]>([]);
  useEffect(() => {
    fetchOhlcv(ticker).then(setData);
  }, [ticker]); 
  useChart(chartContainerRef, data, chartType); // this does chart creation logic

  const TICKERS = ["RELIANCE.NS", "MARUTI.NS", "TCS.NS"];

  return (
    <div className="mb-8 w-full h-full">
      <div className="w-full h-full min-h-[400px] bg-black rounded-md overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 bg-black/80 z-10">
          <select
            value={ticker}
            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setTicker(e.target.value)}
            className="px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            {TICKERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {["candlestick", "line", "volume"].map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type as "candlestick" | "line" | "volume")}
              className={`px-4 py-1 rounded font-medium transition ${
                chartType === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div ref={chartContainerRef} className="flex-1 w-full" />
      </div>
    </div>
  );
}
