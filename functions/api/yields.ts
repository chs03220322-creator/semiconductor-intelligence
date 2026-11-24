type YieldRow = { date: string; DGS2: number; DGS10: number; DGS30: number };
type Tenor = keyof Pick<YieldRow, 'DGS2' | 'DGS10' | 'DGS30'>;
const FIELDS: Record<Tenor, string> = { DGS2: 'BC_2YEAR', DGS10: 'BC_10YEAR', DGS30: 'BC_30YEAR' };

function readXmlField(entry: string, field: string): string | null {
  const pattern = new RegExp('<(?:[A-Za-z_][\\w.-]*:)?' + field + '\\b[^>]*>([\\s\\S]*?)<\\/(?:[A-Za-z_][\\w.-]*:)?' + field + '\\s*>', 'i');
  const match = entry.match(pattern);
  if (!match) return null;
  const value = match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim();
  return !value || /^(null|n\/a)$/i.test(value) ? null : value;
}

function parseTreasuryDate(raw: string): string | null {
  const iso = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
  const us = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (us) return us[3] + '-' + us[1].padStart(2, '0') + '-' + us[2].padStart(2, '0');
  return null;
}

function parseTreasuryXml(xml: string, year: number): YieldRow[] {
  const entries = xml.match(/<(?:[A-Za-z_][\w.-]*:)?entry\b[\s\S]*?<\/(?:[A-Za-z_][\w.-]*:)?entry\s*>/gi) || [];
  if (!entries.length) throw new Error('Treasury ' + year + ': XML에 entry 레코드가 없습니다.');
  const rows: YieldRow[] = [];
  for (const entry of entries) {
    const rawDate = readXmlField(entry, 'NEW_DATE');
    const date = rawDate ? parseTreasuryDate(rawDate) : null;
    if (!date || Number(date.slice(0, 4)) !== year) continue;
    const values = (Object.keys(FIELDS) as Tenor[]).map(key => {
      const raw = readXmlField(entry, FIELDS[key]);
      return raw === null ? NaN : Number(raw.replace(/[mMfFdD]$/, ''));
    });
    if (values.every(v => Number.isFinite(v) && v > 0 && v < 20)) rows.push({ date, DGS2: values[0], DGS10: values[1], DGS30: values[2] });
  }
  const unique = new Map(rows.map(row => [row.date, row]));
  const result = Array.from(unique.values()).sort((a, b) => a.date.localeCompare(b.date));
  if (!result.length) throw new Error('Treasury ' + year + ': 2Y/10Y/30Y 유효 관측치 0건');
  return result;
}

export async function onRequestGet(): Promise<Response> {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800' };
  const now = new Date();
  const since = new Date(now.getTime() - 3 * 365.25 * 86400000).toISOString().slice(0, 10);
  const firstYear = Number(since.slice(0, 4));
  const lastYear = now.getUTCFullYear();
  try {
    const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
    const results = await Promise.all(years.map(async year => {
      const url = new URL('https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml');
      url.searchParams.set('data', 'daily_treasury_yield_curve');
      url.searchParams.set('field_tdr_date_value', String(year));
      const response = await fetch(url.toString(), { headers: { Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8', 'User-Agent': 'SemiconductorIntelligence/1.1' }, cf: { cacheTtl: 900, cacheEverything: true } } as RequestInit);
      if (!response.ok) throw new Error('Treasury ' + year + ' HTTP ' + response.status);
      return parseTreasuryXml(await response.text(), year);
    }));
    const all = results.flat().filter(row => row.date >= since).sort((a, b) => a.date.localeCompare(b.date));
    if (all.length < 100) throw new Error('최근 3년 유효 관측치 부족: ' + all.length + '건');
    const last = all[all.length - 1];
    const latest = { DGS2: { value: last.DGS2, date: last.date }, DGS10: { value: last.DGS10, date: last.date }, DGS30: { value: last.DGS30, date: last.date } };
    const quarters = new Map<string, { DGS2: number[]; DGS10: number[]; DGS30: number[] }>();
    for (const row of all) {
      const month = Number(row.date.slice(5, 7));
      const quarter = row.date.slice(0, 4) + 'Q' + (Math.floor((month - 1) / 3) + 1);
      if (!quarters.has(quarter)) quarters.set(quarter, { DGS2: [], DGS10: [], DGS30: [] });
      const bucket = quarters.get(quarter)!;
      bucket.DGS2.push(row.DGS2); bucket.DGS10.push(row.DGS10); bucket.DGS30.push(row.DGS30);
    }
    const history = Array.from(quarters.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([quarter, values]) => {
      const avg = (items: number[]) => Math.round(items.reduce((a, b) => a + b, 0) / items.length * 1000) / 1000;
      return { quarter, DGS2: avg(values.DGS2), DGS10: avg(values.DGS10), DGS30: avg(values.DGS30) };
    });
    if (history.length < 8) throw new Error('분기 평균 데이터 부족: ' + history.length + '개');
    return new Response(JSON.stringify({ ok: true, latest, history, count: history.length, observationCount: all.length, firstObservation: all[0].date, lastObservation: last.date, updatedAt: new Date().toISOString(), source: 'U.S. Treasury Daily Treasury Par Yield Curve Rates' }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'U.S. Treasury request failed', latest: {}, history: [], count: 0, observationCount: 0, updatedAt: new Date().toISOString(), source: 'U.S. Treasury Daily Treasury Par Yield Curve Rates' }), { status: 502, headers });
  }
}
