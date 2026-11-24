interface YieldPoint { value: number; date: string }
export async function onRequestGet(): Promise<Response> {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=3600' };
  const since = new Date(Date.now() - 3 * 366 * 86400000).toISOString().slice(0, 10);
  try {
    const url = new URL('https://fred.stlouisfed.org/graph/fredgraph.csv');
    url.searchParams.set('id', 'DGS2,DGS10,DGS30');
    url.searchParams.set('cosd', since);
    const response = await fetch(url.toString(), { headers: { Accept: 'text/csv' }, cf: { cacheTtl: 3600, cacheEverything: true } } as RequestInit);
    if (!response.ok) throw new Error('FRED HTTP ' + response.status);
    const rows = (await response.text()).trim().split(/\\r?\\n/);
    const latest: Record<string, YieldPoint> = {};
    const quarters: Record<string, { DGS2: number[]; DGS10: number[]; DGS30: number[] }> = {};
    for (const row of rows.slice(1)) {
      const [date, ...values] = row.split(',');
      if (!date) continue;
      const month = Number(date.slice(5, 7));
      if (!month) continue;
      const quarter = date.slice(0, 4) + 'Q' + (Math.floor((month - 1) / 3) + 1);
      quarters[quarter] ||= { DGS2: [], DGS10: [], DGS30: [] };
      (['DGS2', 'DGS10', 'DGS30'] as const).forEach((key, index) => {
        const raw = values[index];
        const value = raw === undefined || raw === '.' ? NaN : Number(raw);
        if (Number.isFinite(value)) quarters[quarter][key].push(value);
      });
    }
    for (const row of rows.slice(1).reverse()) {
      const [date, ...values] = row.split(',');
      (['DGS2', 'DGS10', 'DGS30'] as const).forEach((key, index) => {
        const value = values[index] === '.' || values[index] === undefined ? NaN : Number(values[index]);
        if (!latest[key] && Number.isFinite(value)) latest[key] = { value, date };
      });
      if (Object.keys(latest).length === 3) break;
    }
    const history = Object.keys(quarters).sort().map(quarter => {
      const avg = (v: number[]) => v.length ? Math.round(v.reduce((a,b)=>a+b,0)/v.length*1000)/1000 : null;
      return { quarter, DGS2: avg(quarters[quarter].DGS2), DGS10: avg(quarters[quarter].DGS10), DGS30: avg(quarters[quarter].DGS30) };
    });
    return new Response(JSON.stringify({ latest, history, updatedAt: new Date().toISOString(), source: 'FRED DGS2/DGS10/DGS30' }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'FRED request failed', latest: {}, history: [] }), { status: 502, headers });
  }
}
