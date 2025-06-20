"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  CandlestickData,
  CandlestickSeries,
  ISeriesApi,
  IChartApi,
  Time,
} from "lightweight-charts";

async function getData(ticker:string): Promise<CandlestickData<Time>[]> {
  const res = await fetch("/Saral-Algo-Trading/ohlcv.json");
  const json = await res.json();
  return json[ticker]; 
}

type GraphData = {
  ticker: string;
};

export default function Graph({ ticker }: GraphData) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [data, setData] = useState<CandlestickData<Time>[]>([]);
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick");

  useEffect(() => {
    getData(ticker).then(setData);
  }, [ticker]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#000000" },
        textColor: "#eee",
        attributionLogo:false
      },
      grid: {
        vertLines: { color: "#333" },
        horzLines: { color: "#333" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    const series = chart.addSeries(CandlestickSeries);
    series.setData(data);

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      chart.resize(chartContainerRef.current!.clientWidth, 400);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, chartType]);

  return (
    <div className="mb-8">
      <div className="mb-4">
        <button
          onClick={() => setChartType("candlestick")}
          className={`mr-2 px-4 py-1 rounded ${
            chartType === "candlestick" ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
        >
          Candlestick
        </button>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
