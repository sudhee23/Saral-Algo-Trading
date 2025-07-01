// components/MarketNews.tsx
const newsItems = [
  {
    title: "Nifty hits record high amid global rally",
    date: "2025-06-30",
  },
  {
    title: "Reliance announces new green energy venture",
    date: "2025-06-28",
  },
  {
    title: "RBI keeps repo rate unchanged",
    date: "2025-06-25",
  },
  {
    title: "Infosys secures $1 billion cloud contract",
    date: "2025-06-22",
  },
  {
    title: "Foreign investors increase stake in Indian equities",
    date: "2025-06-20",
  },
];

export default function MarketNews() {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">📈 Market News</h2>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 max-h-60 overflow-y-auto">
        <ul className="space-y-3">
          {newsItems.map((item, idx) => (
            <li
              key={idx}
              className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-b-0 last:pb-0"
            >
              <p className="font-medium text-gray-800 dark:text-gray-100">{item.title}</p>
              <span className="text-sm text-gray-500">{item.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
