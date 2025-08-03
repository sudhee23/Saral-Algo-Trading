import Footer from "@/components/Footer";
import Graph from "@/components/Graph";
import MarketNews from "@/components/MarketNews";
import Navbar from "@/components/Navbar";
import StocksTable from "@/components/StocksTable";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-6 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3">
            <Graph initialTicker={"RELIANCE.NS"} showTickerSelector={true}/>
          </div>
          <div className="w-full lg:w-1/3">
            <StocksTable />
          </div>
        </div>
        <MarketNews />
      </main>
       <Footer />
    </div>
  );
}
