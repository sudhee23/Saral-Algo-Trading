import Footer from "@/components/Footer";
import Graph from "@/components/Graph";
import Navbar from "@/components/Navbar";
import { createChart, CrosshairMode, CandlestickData, CandlestickSeries } from "lightweight-charts";

async function getData(): Promise<CandlestickData[]> {
  const res = await fetch("http://localhost:3000/ohlcv.json"); // or /api/data if using API
  const json = await res.json();
  return json["MARUTI.NS"]; // or whichever ticker you want
}

export default async function Home() {
  const data = await getData()
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-6 flex-1">
        <Graph candlestickdata={data} />
        <h2 className="text-xl font-medium">Welcome to ALTRA Trading Platform</h2>
      </main>
       <Footer />
    </div>
  );
}
