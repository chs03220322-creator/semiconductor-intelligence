interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change5d: number | null;
  currency: string;
  time?: number;
}

const MARKET_NAMES: Record<string, string> = {
  '^GSPC': 'S&P 500', '^IXIC': 'NASDAQ Composite', '^DJI': 'Dow Jones',
  '^RUT': 'Russell 2000', '^VIX': 'VIX', NVDA: 'NVIDIA', MSFT: 'Microsoft',
  GOOGL: 'Alphabet', AMZN: 'Amazon', META: 'Meta', AAPL: 'Apple',
  AVGO: 'Broadcom', TSLA: 'Tesla'
};

const YAHOO_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
};

async function fetchYahooChart(symbol: string): Promise<Quote> {
  const hosts = ['query1.finance.yahoo.com'];
  let lastError = 'Yahoo chart request failed';

  for (const host of hosts) {
    const endpoint = new URL(`https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}`);
    endpoint.searchParams.set('range', '1mo');
    endpoint.searchParams.set('interval', '1d');
    endpoint.searchParams.set('events', 'div,splits');

    try {
      const response = await fetch(endpoint.toString(), {
        headers: YAHOO_HEADERS,
        cf: { cacheTtl: 300, cacheEverything: true }
      } as RequestInit);
      if (!response.ok) {
        lastError = `Yahoo ${host} HTTP ${response.status} for ${symbol}`;
        if (response.status === 429) break;
        continue;
      }

      const body = await response.json() as any;
      if (body?.chart?.error) {
        lastError = body.chart.error.description || `Yahoo chart error for ${symbol}`;
        continue;
      }
      const result = body?.chart?.result?.[0];
      const meta = result?.meta;
      const quote = result?.indicators?.quote?.[0];
      const timestamps: number[] = result?.timestamp || [];
      const rawCloses: unknown[] = quote?.close || [];
      const validCloses = timestamps.map((time, index) => ({
        time, close: rawCloses[index]
      })).filter((point): point is { time: number; close: number } =>
        typeof point.close === 'number' && Number.isFinite(point.close)
      );
      const price = Number(meta?.regularMarketPrice ?? validCloses[validCloses.length - 1]?.close);
      const marketTime = Number(meta?.regularMarketTime);
      const exchangeTimeZone = meta.exchangeTimezoneName || 'America/New_York';
      const dateKey = (seconds: number) => new Intl.DateTimeFormat('en-CA', {
        timeZone: exchangeTimeZone, year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date(seconds * 1000));
      const marketDate = Number.isFinite(marketTime) ? dateKey(marketTime) : '';
      const lastClose = validCloses[validCloses.length - 1];
      const lastCloseDate = lastClose ? dateKey(lastClose.time) : '';
      // Calculate against the previous completed session, not chartPreviousClose metadata.
      const previous = lastClose && lastCloseDate === marketDate
        ? validCloses[validCloses.length - 2]?.close
        : lastClose?.close;

      if (!result || !meta || !Number.isFinite(price) || !Number.isFinite(previous) || Number(previous) <= 0) {
        lastError = `Yahoo returned incomplete quote data for ${symbol}`;
        continue;
      }

      const hasCompletedCurrentSession = Boolean(lastClose && lastCloseDate === marketDate);
      const fiveBaseIndex = validCloses.length - (hasCompletedCurrentSession ? 6 : 5);
      const fiveBase = fiveBaseIndex >= 0 ? validCloses[fiveBaseIndex].close : undefined;
      return {
        symbol,
        name: MARKET_NAMES[symbol] || symbol,
        price,
        change: (price / Number(previous) - 1) * 100,
        change5d: Number.isFinite(fiveBase) && fiveBase > 0 ? (price / fiveBase - 1) * 100 : null,
        currency: meta.currency || 'USD',
        time: meta.regularMarketTime
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : `Yahoo request failed for ${symbol}`;
    }
  }
  throw new Error(lastError);
}

export async function onRequestGet({ request }: { request: Request }): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=300'
  };
  const url = new URL(request.url);
  const raw = url.searchParams.get('symbols') || '';
  const symbols = [...new Set(raw.split(',').map(s => s.trim().toUpperCase()).filter(s => /^[A-Z0-9^=.-]{1,20}$/.test(s)))].slice(0, 5);
  if (!symbols.length) return new Response(JSON.stringify({ error: 'No valid symbols supplied' }), { status: 400, headers: corsHeaders });

  const quotes: Record<string, Quote> = {};
  const errors: string[] = [];

  // Limit concurrency to avoid triggering Yahoo's rate limits.
  for (let i = 0; i < symbols.length; i += 5) {
    const batch = symbols.slice(i, i + 5);
    const results = await Promise.allSettled(batch.map(fetchYahooChart));
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') quotes[result.value.symbol] = result.value;
      else errors.push(result.reason instanceof Error ? result.reason.message : `Yahoo failed for ${batch[index]}`);
    });
  }

  return new Response(JSON.stringify({
    quotes,
    errors,
    provider: 'Yahoo Finance Chart (unofficial)',
    quoteCount: Object.keys(quotes).length,
    requestedCount: symbols.length,
    updatedAt: new Date().toISOString()
  }), { status: 200, headers: corsHeaders });
}
