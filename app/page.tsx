import Footer from "@/components/Footer";
import Graph from "@/components/Graph";
import Navbar from "@/components/Navbar";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-6 flex-1">
        <div className="flex gap-6">
          <div className="w-2/3">
            <Graph initialTicker={"RELIANCE.NS"} />
          </div>
          <div className="w-1/3 rounded-lg min-h-[400px] flex items-center justify-center">
            <span className="text-gray-400">Table will appear here</span>
          </div>
        </div>
      </main>
       <Footer />
    </div>
  );
}
