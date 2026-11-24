interface YieldPoint { value: number; date: string }
type SeriesKey = 'DGS2' | 'DGS10' | 'DGS30';

function parseFredCsv(csv: string, key: SeriesKey) {
  const rows = csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (rows.length < 2) throw new Error(key + ': FRED CSV has no observations');
  const header = rows[0].split(',');
  const valueIndex = header.findIndex((v, i) => i > 0 && v.trim() === key);
  const dateIndex = header.findIndex(v => ['observation_date', 'DATE'].includes(v.trim().toLowerCase()) || v.trim().toLowerCase() === 'date');
  if (valueIndex < 0 || dateIndex < 0) throw new Error(key + ': unexpected FRED CSV header: ' + rows[0]);
  const points: YieldPoint[] = [];
  for (const row of rows.slice(1)) {
    const cols = row.split(',');
    const date = (cols[dateIndex] || '').trim();
    const raw = (cols[valueIndex] || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !raw || raw === '.') continue;
    const value = Number(raw);
    if (Number.isFinite(value) && value > 0 && value < 20) points.push({ date, value });
  }
  if (!points.length) throw new Error(key + ': no valid numeric observations');
  return points;
}

export async function onRequestGet(): Promise<Response> {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800' };
  const since = new Date(Date.now() - 3 * 366 * 86400000).toISOString().slice(0, 10);
  try {
    const keys: SeriesKey[] = ['DGS2', 'DGS10', 'DGS30'];
    const series = await Promise.all(keys.map(async key => {
      const url = new URL('https://fred.stlouisfed.org/graph/fredgraph.csv');
      url.searchParams.set('id', key);
      url.searchParams.set('cosd', since);
      const response = await fetch(url.toString(), {
        headers: { Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8', 'User-Agent': 'Mozilla/5.0 SemiconductorIntelligence/1.0' },
        cf: { cacheTtl: 1800, cacheEverything: true }
      } as RequestInit);
      if (!response.ok) throw new Error(key + ': FRED HTTP ' + response.status);
      const contentType = response.headers.get('content-type') || '';
      const body = await response.text();
      if (contentType.includes('text/html') || body.trimStart().startsWith('<!DOCTYPE')) throw new Error(key + ': FRED returned HTML instead of CSV');
      return [key, parseFredCsv(body, key)] as const;
    }));
    const byKey = Object.fromEntries(series) as Record<SeriesKey, YieldPoint[]>;
    const latest: Record<string, YieldPoint> = {};
    const quarters = new Map<string, Record<SeriesKey, number[]>>();
    for (const key of keys) {
      latest[key] = byKey[key][byKey[key].length - 1];
      for (const point of byKey[key]) {
        const month = Number(point.date.slice(5, 7));
        const quarter = point.date.slice(0, 4) + 'Q' + (Math.floor((month - 1) / 3) + 1);
        if (!quarters.has(quarter)) quarters.set(quarter, { DGS2: [], DGS10: [], DGS30: [] });
        quarters.get(quarter)![key].push(point.value);
      }
    }
    const history = Array.from(quarters.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([quarter, values]) => {
      const avg = (items: number[]) => items.length ? Math.round(items.reduce((a, b) => a + b, 0) / items.length * 1000) / 1000 : null;
      return { quarter, DGS2: avg(values.DGS2), DGS10: avg(values.DGS10), DGS30: avg(values.DGS30) };
    }).filter(row => row.DGS2 !== null && row.DGS10 !== null && row.DGS30 !== null);
    if (history.length < 8) throw new Error('FRED returned only ' + history.length + ' complete quarters; expected about 12');
    return new Response(JSON.stringify({ ok: true, latest, history, count: history.length, updatedAt: new Date().toISOString(), source: 'FRED DGS2/DGS10/DGS30' }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'FRED request failed', latest: {}, history: [], updatedAt: new Date().toISOString() }), { status: 502, headers });
  }
}
