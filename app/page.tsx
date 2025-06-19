import Footer from "@/components/Footer";
import Graph from "@/components/Graph";
import Navbar from "@/components/Navbar";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-6 flex-1">
        <Graph ticker={"RELIANCE.NS"} />
        <h2 className="text-xl font-medium">Welcome to ALTRA Trading Platform</h2>
      </main>
       <Footer />
    </div>
  );
}
