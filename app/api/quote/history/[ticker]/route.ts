import data from "@/data.json";

export const runtime = 'edge';

// Convert data.json format to chart data format
function convertDataToChartData(ticker: string) {
  const openKey = `('Open', '${ticker}')`;
  const highKey = `('High', '${ticker}')`;
  const lowKey = `('Low', '${ticker}')`;
  const closeKey = `('Close', '${ticker}')`;
  const volumeKey = `('Volume', '${ticker}')`;

  const openData = data[openKey as keyof typeof data] as Record<string, number>;
  const highData = data[highKey as keyof typeof data] as Record<string, number>;
  const lowData = data[lowKey as keyof typeof data] as Record<string, number>;
  const closeData = data[closeKey as keyof typeof data] as Record<string, number>;
  const volumeData = data[volumeKey as keyof typeof data] as Record<string, number>;

  if (!openData || !highData || !lowData || !closeData || !volumeData) {
    return [];
  }

  const timestamps = Object.keys(closeData).sort();
  const chartData = [];

  // Convert daily data to intraday format
  for (const timestamp of timestamps) {
    const baseTime = parseInt(timestamp) / 1000; // Convert to seconds
    const baseDate = new Date(baseTime * 1000);
    
    // Create intraday data points (9:30 AM to 3:30 PM with 5-minute intervals)
    const marketOpen = new Date(baseDate);
    marketOpen.setHours(9, 30, 0, 0);
    
    const marketClose = new Date(baseDate);
    marketClose.setHours(15, 30, 0, 0);
    
    const open = openData[timestamp];
    const high = highData[timestamp];
    const low = lowData[timestamp];
    const close = closeData[timestamp];
    const volume = volumeData[timestamp];
    
         // Generate 5-minute interval data points
     let currentTime = new Date(marketOpen);
     let currentPrice = open;
     const currentVolume = volume / 75; // Distribute volume across 75 intervals (9:30-15:30, 5-min intervals)
    
    while (currentTime <= marketClose) {
      // Simulate price movement within the day's range
      const progress = (currentTime.getTime() - marketOpen.getTime()) / (marketClose.getTime() - marketOpen.getTime());
      const priceVariation = (high - low) * 0.1; // 10% of day's range for intraday variation
      
      let intradayPrice;
      if (progress < 0.3) {
        // First 30% of day: price moves from open towards high
        intradayPrice = open + (high - open) * (progress / 0.3) + (Math.random() - 0.5) * priceVariation;
      } else if (progress < 0.7) {
        // Middle 40%: price fluctuates around high
        intradayPrice = high + (Math.random() - 0.5) * priceVariation;
      } else {
        // Last 30%: price moves from high towards close
        intradayPrice = high - (high - close) * ((progress - 0.7) / 0.3) + (Math.random() - 0.5) * priceVariation;
      }
      
      // Ensure price stays within day's range
      intradayPrice = Math.max(low, Math.min(high, intradayPrice));
      
      chartData.push({
        time: Math.floor(currentTime.getTime() / 1000),
        open: currentPrice,
        high: Math.max(currentPrice, intradayPrice),
        low: Math.min(currentPrice, intradayPrice),
        close: intradayPrice,
        volume: Math.floor(currentVolume * (0.5 + Math.random()))
      });
      
             currentPrice = intradayPrice;
       currentTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // Add 5 minutes
    }
  }

  return chartData;
}

export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }>}) {
  try {
    const resolvedParams = await params;
    const ticker = resolvedParams.ticker.toUpperCase();
    
    console.log('Fetching chart data for:', ticker);
    
    const chartData = convertDataToChartData(ticker);
    
    if (chartData.length === 0) {
      console.error('No chart data found for ticker:', ticker);
      return new Response(JSON.stringify({ error: 'Chart data not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Successfully fetched chart data for:', ticker);
    
    return new Response(JSON.stringify(chartData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in history API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch chart data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 