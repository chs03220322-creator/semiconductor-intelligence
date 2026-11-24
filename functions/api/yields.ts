interface YieldPoint { value: number; date: string }
type SeriesKey = 'DGS2' | 'DGS10' | 'DGS30';
const TREASURY_FIELDS: Record<SeriesKey, string> = {
  DGS2: 'BC_2YEAR',
  DGS10: 'BC_10YEAR',
  DGS30: 'BC_30YEAR'
};

function xmlField(entry: string, field: string): string | null {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = entry.match(new RegExp('<(?:[A-Za-z0-9_]+:)?' + escaped + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[A-Za-z0-9_]+:)?' + escaped + '>'));
  if (!match) return null;
  const value = match[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim();
  return !value || value.toLowerCase() === 'null' ? null : value;
}

function parseTreasuryXml(xml: string, year: number): YieldPoint[] {
  if (!xml.includes('<entry') || !xml.includes('BC_10YEAR')) {
    throw new Error('Treasury ' + year + ': unexpected XML structure');
  }
  const points: YieldPoint[] = [];
  for (const entryMatch of xml.matchAll(/<entry[\\s\\S]*?<\\/entry>/g)) {
    const entry = entryMatch[0];
    const rawDate = xmlField(entry, 'NEW_DATE') || xmlField(entry, 'NEW_DATE');
    if (!rawDate) continue;
    const date = rawDate.match(/\\d{4}-\\d{2}-\\d{2}/)?.[0]
      || rawDate.match(/\\d{2}\\/\\d{2}\\/\\d{4}/)?.[0];
    if (!date) continue;
    const isoDate = date.includes('/') ? date.split('/').reverse().join('-') : date;
    const raw2 = xmlField(entry, TREASURY_FIELDS.DGS2);
    const raw10 = xmlField(entry, TREASURY_FIELDS.DGS10);
    const raw30 = xmlField(entry, TREASURY_FIELDS.DGS30);
    const values = [raw2, raw10, raw30].map(v => v === null ? NaN : Number(v));
    if (values.every(v => Number.isFinite(v) && v > 0 && v < 20)) {
      points.push({ date: isoDate, value: values[0] });
      (points[points.length - 1] as YieldPoint & { v10?: number; v30?: number }).v10 = values[1];
      (points[points.length - 1] as YieldPoint & { v30?: number }).v30 = values[2];
    }
  }
  if (!points.length) throw new Error('Treasury ' + year + ': no valid 2Y/10Y/30Y observations');
  return points;
}

export async function onRequestGet(): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=1800'
  };
  const now = new Date();
  const since = new Date(now.getTime() - 3 * 365.25 * 86400000).toISOString().slice(0, 10);
  const firstYear = Number(since.slice(0, 4));
  const lastYear = now.getUTCFullYear();
  try {
    const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
    const xmlByYear = await Promise.all(years.map(async year => {
      const url = new URL('https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml');
      url.searchParams.set('data', 'daily_treasury_yield_curve');
      url.searchParams.set('field_tdr_date_value', String(year));
      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8', 'User-Agent': 'Mozilla/5.0 SemiconductorIntelligence/1.0' },
        cf: { cacheTtl: 1800, cacheEverything: true }
      } as RequestInit);
      if (!response.ok) throw new Error('U.S. Treasury HTTP ' + response.status + ' (' + year + ')');
      const xml = await response.text();
      return parseTreasuryXml(xml, year);
    }));
    const all = xmlByYear.flat().filter(p => p.date >= since).sort((a,b) => a.date.localeCompare(b.date));
    if (all.length < 100) throw new Error('U.S. Treasury returned too few observations: ' + all.length);
    const latestRow = all[all.length - 1] as YieldPoint & { v10?: number; v30?: number };
    const latest = {
      DGS2: { value: latestRow.value, date: latestRow.date },
      DGS10: { value: latestRow.v10 as number, date: latestRow.date },
      DGS30: { value: latestRow.v30 as number, date: latestRow.date }
    };
    const quarters = new Map<string, { DGS2: number[]; DGS10: number[]; DGS30: number[] }>();
    for (const point of all) {
      const row = point as YieldPoint & { v10?: number; v30?: number };
      const month = Number(point.date.slice(5, 7));
      const quarter = point.date.slice(0, 4) + 'Q' + (Math.floor((month - 1) / 3) + 1);
      if (!quarters.has(quarter)) quarters.set(quarter, { DGS2: [], DGS10: [], DGS30: [] });
      const bucket = quarters.get(quarter)!;
      bucket.DGS2.push(point.value);
      if (row.v10 !== undefined) bucket.DGS10.push(row.v10);
      if (row.v30 !== undefined) bucket.DGS30.push(row.v30);
    }
    const history = Array.from(quarters.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([quarter, v]) => {
      const avg = (items: number[]) => items.length ? Math.round(items.reduce((a,b)=>a+b,0)/items.length*1000)/1000 : null;
      return { quarter, DGS2: avg(v.DGS2), DGS10: avg(v.DGS10), DGS30: avg(v.DGS30) };
    }).filter(r => r.DGS2 !== null && r.DGS10 !== null && r.DGS30 !== null);
    if (history.length < 8) throw new Error('U.S. Treasury returned only ' + history.length + ' complete quarters');
    return new Response(JSON.stringify({
      ok: true, latest, history, count: history.length,
      updatedAt: new Date().toISOString(),
      source: 'U.S. Treasury Daily Treasury Par Yield Curve Rates'
    }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : 'U.S. Treasury request failed',
      latest: {}, history: [], count: 0, updatedAt: new Date().toISOString(),
      source: 'U.S. Treasury Daily Treasury Par Yield Curve Rates'
    }), { status: 502, headers });
  }
}
