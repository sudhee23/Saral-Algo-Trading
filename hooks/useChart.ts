"use client";
import { useEffect, useRef } from "react";
import {
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  Time,
  LineData,
  TickMarkType,
  LineSeries,
  CandlestickSeries,
} from "lightweight-charts";
import { Ohlcv } from "@/utils/fetchOhlcv";

type ChartType = "candlestick" | "line" | "volume";

export function useChart(
  containerRef: React.RefObject<HTMLDivElement |null>,
  data: Ohlcv[],
  chartType: ChartType
) {
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick" | "Line" | "Area"> | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0 || containerRef.current.clientWidth === 0) return;

    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch {}
      chartRef.current = null;
      seriesRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#000" },
        textColor: "#eee",
        attributionLogo: false,
      },
      localization: {
        locale: "en-US",
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit", 
            second: "2-digit",
            hour12: true 
          });
        },
      },
      timeScale: {
        visible: true,
        timeVisible: true,
        tickMarkFormatter: (time: number, type: TickMarkType) => {
          const date = new Date(time * 1000);
          switch (type) {
            case TickMarkType.DayOfMonth:
              return date.toLocaleDateString("en-US",{month: "long", day: "2-digit", year: "numeric"});
            case TickMarkType.Time:
              return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
            case TickMarkType.Month:
              return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
            case TickMarkType.Year:
              return date.getFullYear().toString();
            case TickMarkType.TimeWithSeconds:
              return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
          }
        },
      },
      grid: {
        vertLines: { color: "#333" },
        horzLines: { color: "#333" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
    });

    let series: typeof seriesRef.current;

    if (chartType === "candlestick") {
      series = chart.addSeries(CandlestickSeries);
      series.setData(data);
    } else {
      const lineData: LineData<Time>[] = data.map((d) => ({
        time: d.time,
        value: chartType === "line" ? d.close : d.volume ?? 0,
      }));
      series = chart.addSeries(LineSeries, {
        color: chartType === "volume" ? "#26a69a" : "#2196f3",
        lineWidth: 2,
      });
      series.setData(lineData);
    }

    if (data.length > 0) {
      chart.timeScale().setVisibleRange({ from: data[0].time, to: data[data.length - 1].time });
      chart.timeScale().applyOptions({
        rightOffset: 0,
        barSpacing: 5,
        fixLeftEdge: true,
        fixRightEdge: true,
      });
    }

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width && chartRef.current) {
          chartRef.current.resize(entry.contentRect.width, 400);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch {}
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [containerRef, data, chartType]);
}
