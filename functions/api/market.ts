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

export async function onRequestGet({ request }: { request: Request }): Promise<Response> {
  const corsHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120'
  };
  const url = new URL(request.url);
  const raw = url.searchParams.get('symbols') || '';
  const symbols = [...new Set(raw.split(',').map(s => s.trim().toUpperCase()).filter(s => /^[A-Z0-9^=.-]{1,20}$/.test(s)))].slice(0, 100);
  if (!symbols.length) return new Response(JSON.stringify({ error: 'No valid symbols supplied' }), { status: 400, headers: corsHeaders });

  const quotes: Record<string, Quote> = {};
  const errors: string[] = [];
  const batches: string[][] = [];
  for (let i = 0; i < symbols.length; i += 20) batches.push(symbols.slice(i, i + 20));

  await Promise.all(batches.map(async batch => {
    const endpoint = new URL('https://query1.finance.yahoo.com/v7/finance/spark');
    endpoint.searchParams.set('symbols', batch.join(','));
    endpoint.searchParams.set('range', '1mo');
    endpoint.searchParams.set('interval', '1d');
    try {
      const response = await fetch(endpoint.toString(), {
        headers: { Accept: 'application/json' },
        cf: { cacheTtl: 30, cacheEverything: true }
      } as RequestInit);
      if (!response.ok) throw new Error('Yahoo HTTP ' + response.status);
      const body = await response.json() as any;
      const items = body?.spark?.result || [];
      for (const item of items) {
        const symbol = String(item?.symbol || '');
        const result = item?.response?.[0];
        const meta = result?.meta;
        const closes: number[] = (result?.indicators?.quote?.[0]?.close || []).filter((v: unknown): v is number => typeof v === 'number' && Number.isFinite(v));
        const price = Number(meta?.regularMarketPrice ?? closes[closes.length - 1]);
        const previous = Number(meta?.chartPreviousClose ?? meta?.previousClose);
        if (!symbol || !Number.isFinite(price) || !Number.isFinite(previous) || previous === 0) continue;
        const fiveBase = closes.length >= 6 ? closes[closes.length - 6] : NaN;
        quotes[symbol] = {
          symbol,
          name: MARKET_NAMES[symbol] || symbol,
          price,
          change: (price / previous - 1) * 100,
          change5d: Number.isFinite(fiveBase) && fiveBase !== 0 ? (price / fiveBase - 1) * 100 : null,
          currency: meta?.currency || 'USD',
          time: meta?.regularMarketTime
        };
      }
      if (items.length === 0) errors.push('Yahoo 시세 응답에 종목이 없습니다.');
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Yahoo 시세 요청 실패');
    }
  }));

  const yields: Record<string, YieldPoint> = {};
  try {
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

  return new Response(JSON.stringify({ quotes, yields, errors, updatedAt: new Date().toISOString() }), {
    status: 200,
    headers: corsHeaders
  });
}
