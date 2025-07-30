import { Hono } from 'hono';
import yahooFinance from 'yahoo-finance2';

const quote = new Hono();
const TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
    ),
  ]);
}

quote.get('/ticker/:symbol', async (c) => {
  const symbolsParam = c.req.param('symbol');
  if (!symbolsParam) {
    return c.json({ error: 'Symbol is required' }, 400);
  }
  try {
    const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase());
    const result = await withTimeout(yahooFinance.quote(symbols), TIMEOUT_MS);
    return c.json(result);
  } catch (error: unknown) {
    console.error('Error fetching quote:', error);
    return c.json({ error: (error as Error).message || 'Failed to fetch quote' }, 500);
  }
});

quote.get('/history/:symbol', async (c) => {
  const symbol = c.req.param('symbol');
  const startDate = c.req.query('start');
  const endDate = c.req.query('end');
  let interval = c.req.query('interval') || '1d';

  if (!symbol) {
    return c.json({ error: 'Symbol is required' }, 400);
  }

  if (!startDate || isNaN(Date.parse(startDate))) {
    return c.json({ error: 'Invalid or missing start date' }, 400);
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    return c.json({ error: 'Invalid end date' }, 400);
  }

  const allowedIntervals = ['1d', '1wk', '1mo', '5m', '15m', '30m', '1h'] as const;
  if (!allowedIntervals.includes(interval as typeof allowedIntervals[number])) {
    interval = '1d';
  }

  try {
    const result = await withTimeout(
      yahooFinance.chart(symbol, {
        period1: new Date(startDate),
        period2: endDate ? new Date(endDate) : undefined,
        interval: interval as (typeof allowedIntervals)[number],
      }),
      TIMEOUT_MS
    );

    return c.json(
      result.quotes.map((quote) => ({
        time: quote.date.getTime() / 1000,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume,
      }))
    );
  } catch (error: unknown) {
    console.error('Error fetching history:', error);
    return c.json({ error: (error as Error).message || 'Failed to fetch history' }, 500);
  }
});

export default quote;
