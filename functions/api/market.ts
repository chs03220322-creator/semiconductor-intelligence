interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change5d: number | null;
  currency: string;
  time?: number;
}
interface YieldPoint { value: number; date: string }

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
        cf: { cacheTtl: 86400, cacheEverything: true }
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
      const closes: number[] = (quote?.close || []).filter(
        (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
      );
      const price = Number(meta?.regularMarketPrice ?? closes[closes.length - 1]);
      const previous = Number(meta?.chartPreviousClose ?? meta?.previousClose ?? closes[closes.length - 2]);

      if (!result || !meta || !Number.isFinite(price) || !Number.isFinite(previous) || previous <= 0) {
        lastError = `Yahoo returned incomplete quote data for ${symbol}`;
        continue;
      }

      const fiveBase = closes.length >= 6 ? closes[closes.length - 6] : closes[0];
      return {
        symbol,
        name: MARKET_NAMES[symbol] || symbol,
        price,
        change: (price / previous - 1) * 100,
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
    'Cache-Control': 'public, max-age=300, s-maxage=86400, stale-while-revalidate=86400'
  };
  const url = new URL(request.url);
  const raw = url.searchParams.get('symbols') || '';
  const symbols = [...new Set(raw.split(',').map(s => s.trim().toUpperCase()).filter(s => /^[A-Z0-9^=.-]{1,20}$/.test(s)))].slice(0, 8);
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

  const yields: Record<string, YieldPoint> = {};
  if (url.searchParams.get('includeYields') !== '0') try {
    const since = new Date(Date.now() - 120 * 86400000).toISOString().slice(0, 10);
    const fredUrl = new URL('https://fred.stlouisfed.org/graph/fredgraph.csv');
    fredUrl.searchParams.set('id', 'DGS2,DGS10,DGS30');
    fredUrl.searchParams.set('cosd', since);
    const response = await fetch(fredUrl.toString(), {
      headers: { Accept: 'text/csv' },
      cf: { cacheTtl: 3600, cacheEverything: true }
    } as RequestInit);
    if (!response.ok) throw new Error('FRED HTTP ' + response.status);
    const rows = (await response.text()).trim().split(/\r?\n/);
    for (const row of rows.slice(1).reverse()) {
      const [date, ...values] = row.split(',');
      ['DGS2', 'DGS10', 'DGS30'].forEach((key, index) => {
        const rawValue = values[index];
        const value = rawValue === undefined || rawValue === '.' ? NaN : Number(rawValue);
        if (!yields[key] && Number.isFinite(value)) yields[key] = { value, date };
      });
      if (Object.keys(yields).length === 3) break;
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'FRED 금리 요청 실패');
  }

  return new Response(JSON.stringify({
    quotes,
    yields,
    errors,
    provider: 'Yahoo Finance Chart (unofficial)',
    quoteCount: Object.keys(quotes).length,
    requestedCount: symbols.length,
    updatedAt: new Date().toISOString()
  }), { status: 200, headers: corsHeaders });
}
