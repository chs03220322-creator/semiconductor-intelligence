type YieldRow = { date: string; DGS2: number; DGS10: number; DGS30: number };
const FIELDS = { DGS2: 'BC_2YEAR', DGS10: 'BC_10YEAR', DGS30: 'BC_30YEAR' } as const;

function readXmlField(entry: string, field: string): string | null {
  const pattern = new RegExp('<(?:[A-Za-z0-9_]+:)?' + field + '(?:\s[^>]*)?>([\s\S]*?)<\/(?:[A-Za-z0-9_]+:)?' + field + '>');
  const match = entry.match(pattern);
  if (!match) return null;
  const value = match[1].replaceAll('<![CDATA[', '').replaceAll(']]>', '').trim();
  return !value || value.toLowerCase() === 'null' || value.toUpperCase() === 'N/A' ? null : value;
}

function parseTreasuryXml(xml: string, year: number): YieldRow[] {
  if (!xml.includes('<entry') || !xml.includes('BC_10YEAR') || !xml.includes('BC_30YEAR')) {
    throw new Error('Treasury ' + year + ': unexpected XML schema');
  }
  const rows: YieldRow[] = [];
  const entryPattern = new RegExp('<entry[\s\S]*?<\/entry>', 'g');
  const datePattern = new RegExp('\d{4}-\d{2}-\d{2}');
  const slashDatePattern = new RegExp('\d{2}\/\d{2}\/\d{4}');
  for (const match of xml.matchAll(entryPattern)) {
    const entry = match[0];
    const rawDate = readXmlField(entry, 'NEW_DATE');
    if (!rawDate) continue;
    const dateMatch = rawDate.match(datePattern) || rawDate.match(slashDatePattern);
    if (!dateMatch) continue;
    const date = dateMatch[0].includes('/')
      ? dateMatch[0].split('/').reverse().join('-')
      : dateMatch[0];
    const values = (Object.keys(FIELDS) as Array<keyof typeof FIELDS>).map(key => {
      const raw = readXmlField(entry, FIELDS[key]);
      return raw === null ? NaN : Number(raw);
    });
    if (values.every(v => Number.isFinite(v) && v > 0 && v < 20)) {
      rows.push({ date, DGS2: values[0], DGS10: values[1], DGS30: values[2] });
    }
  }
  if (!rows.length) throw new Error('Treasury ' + year + ': no valid 2Y/10Y/30Y observations');
  return rows;
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
    const yearRows = await Promise.all(years.map(async year => {
      const url = new URL('https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml');
      url.searchParams.set('data', 'daily_treasury_yield_curve');
      url.searchParams.set('field_tdr_date_value', String(year));
      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8',
          'User-Agent': 'Mozilla/5.0 SemiconductorIntelligence/1.0'
        },
        cf: { cacheTtl: 1800, cacheEverything: true }
      } as RequestInit);
      if (!response.ok) throw new Error('U.S. Treasury HTTP ' + response.status + ' (' + year + ')');
      return parseTreasuryXml(await response.text(), year);
    }));
    const all = yearRows.flat().filter(row => row.date >= since).sort((a,b) => a.date.localeCompare(b.date));
    if (all.length < 100) throw new Error('U.S. Treasury returned too few observations: ' + all.length);
    const last = all[all.length - 1];
    const latest = {
      DGS2: { value: last.DGS2, date: last.date },
      DGS10: { value: last.DGS10, date: last.date },
      DGS30: { value: last.DGS30, date: last.date }
    };
    const quarters = new Map<string, { DGS2: number[]; DGS10: number[]; DGS30: number[] }>();
    for (const row of all) {
      const month = Number(row.date.slice(5, 7));
      const quarter = row.date.slice(0, 4) + 'Q' + (Math.floor((month - 1) / 3) + 1);
      if (!quarters.has(quarter)) quarters.set(quarter, { DGS2: [], DGS10: [], DGS30: [] });
      const bucket = quarters.get(quarter)!;
      bucket.DGS2.push(row.DGS2);
      bucket.DGS10.push(row.DGS10);
      bucket.DGS30.push(row.DGS30);
    }
    const history = Array.from(quarters.entries()).sort(([a],[b]) => a.localeCompare(b)).map(([quarter, v]) => {
      const avg = (items: number[]) => Math.round(items.reduce((a,b)=>a+b,0)/items.length*1000)/1000;
      return { quarter, DGS2: avg(v.DGS2), DGS10: avg(v.DGS10), DGS30: avg(v.DGS30) };
    });
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
