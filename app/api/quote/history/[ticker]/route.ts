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
  
  return timestamps.map(timestamp => ({
    time: parseInt(timestamp) / 1000, // Convert milliseconds to seconds
    open: openData[timestamp],
    high: highData[timestamp],
    low: lowData[timestamp],
    close: closeData[timestamp],
    volume: volumeData[timestamp]
  }));
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