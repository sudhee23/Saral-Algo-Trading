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
  LineData,
  LineSeries,
  TickMarkType,
} from "lightweight-charts";

async function getData(ticker:string): Promise<CandlestickData<Time>[]> {
  //const basepath=""
  const basepath= "/Saral-Algo-Trading"
  const res = await fetch(`${basepath}/ohlcv.json`);
  const json = await res.json();
  return json[ticker]; 
}

type GraphData = {
  initialTicker: string;
};

export default function Graph({ initialTicker }: GraphData) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [data, setData] = useState<CandlestickData<Time>[]>([]);
  const [chartType, setChartType] = useState<"candlestick" | "line" | "volume">("candlestick");
  const [ticker, setTicker] = useState<string>(initialTicker);
  const TICKERS = ["RELIANCE.NS","MARUTI.NS","TCS.NS"]
  useEffect(() => {
    getData(ticker).then(setData);
  }, [ticker]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0 || chartContainerRef.current.clientWidth === 0) return;

    // Clean up previous chart if it exists and hasn't been disposed
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {
        // Ignore errors if chart is already disposed
      }
      chartRef.current = null;
      seriesRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#000000" },
        textColor: "#eee",
        attributionLogo:false

      },
      localization:{
        locale: "en-US",
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      },
      timeScale:{
        visible: true,
        timeVisible: true,
        tickMarkFormatter: (time: number,tickMarktype:TickMarkType) => {
          if (tickMarktype === TickMarkType.DayOfMonth) {
            const date = new Date(time * 1000);
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
            });
          }
          else if (tickMarktype === TickMarkType.Time){
            const date = new Date(time * 1000);
            return date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          else if (tickMarktype === TickMarkType.Month){
            const date = new Date(time * 1000);
            return date.toLocaleString("en-US", {
              year: "numeric",
              month: "long",
            });
          }
          else if (tickMarktype === TickMarkType.Year){
            const date = new Date(time * 1000);
            return date.toLocaleString("en-US", {
              year: "numeric",
            });
          }
          else if (tickMarktype === TickMarkType.TimeWithSeconds){
            const date = new Date(time * 1000);
            return date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
          }
        }
      },
      grid: {
        vertLines: { color: "#333" },
        horzLines: { color: "#333" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        
      },
    });
    let series: ISeriesApi<any>;
    if (chartType === "candlestick") {
      series = chart.addSeries(CandlestickSeries);
      series.setData(data);
    } else if (chartType === "line") {
      // Convert candlestick data to line data (use close price)
      const lineData: LineData<Time>[] = data.map(d => ({
        time: d.time,
        value: d.close,
      }));
      series = chart.addSeries(LineSeries);
      series.setData(lineData);
    } else {
      // Convert candlestick data to line data (use volume)
      const volumeLineData: LineData<Time>[] = data.map(d => ({
        time: d.time,
        value: (d as any).volume ?? 0,
      }));
      series = chart.addSeries(LineSeries, {
        color: "#26a69a",
        lineWidth: 2,
      });
      series.setData(volumeLineData);
    }
    if (data.length > 0) {
      const from = data[0].time;
      const to = data[data.length - 1].time;
      chart.timeScale().setVisibleRange({ from, to });
    }
    chart.timeScale().applyOptions({
        rightOffset: 0,
        barSpacing: 5, // Adjust as needed (smaller = more candles visible)
        fixLeftEdge: true,
        fixRightEdge: true,
      });

    chartRef.current = chart;
    seriesRef.current = series;

    // Add ResizeObserver for more reliable resizing
    const resizeObserver = new window.ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width && chartRef.current) {
          chartRef.current.resize(entry.contentRect.width, 400);
        }
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    const handleResize = () => {
      chart.resize(chartContainerRef.current!.clientWidth, 400);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          // Ignore errors if chart is already disposed
        }
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [data, chartType]);

  return (
    <div className="mb-8 w-full h-full">
      <div className="w-full h-full min-h-[400px] bg-black rounded-md overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 bg-black/80 z-10">
          <select
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            className="px-2 py-1 rounded border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            {TICKERS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={() => setChartType("candlestick")}
            className={`px-4 py-1 rounded font-medium transition ${
              chartType === "candlestick"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            Candlestick
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-4 py-1 rounded font-medium transition ${
              chartType === "line"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType("volume")}
            className={`px-4 py-1 rounded font-medium transition ${
              chartType === "volume"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            Volume
          </button>
        </div>
        <div ref={chartContainerRef} className="flex-1 w-full" />
      </div>
    </div>
  );
}