import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="p-6 flex-1">
        <h2 className="text-xl font-medium">Welcome to ALTRA Trading Platform</h2>
      </main>
       <Footer />
    </div>
  );
}
