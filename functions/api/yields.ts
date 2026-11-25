type YieldRow = { date: string; DGS2: number | null; DGS10: number | null; DGS30: number | null };
type Tenor = 'DGS2' | 'DGS10' | 'DGS30';
const FIELDS: Record<Tenor, string> = { DGS2: 'BC_2YEAR', DGS10: 'BC_10YEAR', DGS30: 'BC_30YEAR' };
const TENORS: Tenor[] = ['DGS2', 'DGS10', 'DGS30'];
const BASE_URL = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml';

function xmlText(entry: string, field: string): string | null {
  const pattern = new RegExp('<(?:[A-Za-z_][\\w.-]*:)?' + field + '\\b([^>]*)>([\\s\\S]*?)<\\/(?:[A-Za-z_][\\w.-]*:)?' + field + '\\s*>', 'i');
  const match = entry.match(pattern);
  if (!match || /(?:m:)?null\s*=\s*["']true["']/i.test(match[1])) return null;
  const value = match[2].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim();
  if (!value || /^(null|n\/a)$/i.test(value)) return null;
  return value;
}

function parseDate(raw: string): string | null {
  const match = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) return match[1] + '-' + match[2] + '-' + match[3];
  const us = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  return us ? us[3] + '-' + us[1].padStart(2, '0') + '-' + us[2].padStart(2, '0') : null;
}

function parseRate(raw: string | null): number | null {
  if (raw === null) return null;
  // OData Edm.Double/Decimal values can carry d/f/m suffixes.
  const value = Number(raw.replace(/[dDfFmM]$/, ''));
  return Number.isFinite(value) && value > 0 && value < 20 ? value : null;
}

function parseTreasuryXml(xml: string, year: number): YieldRow[] {
  const entries = xml.match(/<(?:[A-Za-z_][\w.-]*:)?entry\b[\s\S]*?<\/(?:[A-Za-z_][\w.-]*:)?entry\s*>/gi) || [];
  if (!entries.length) throw new Error('Treasury ' + year + ': entry 레코드가 없습니다.');
  const rows: YieldRow[] = [];
  for (const entry of entries) {
    const rawDate = xmlText(entry, 'NEW_DATE');
    const date = rawDate ? parseDate(rawDate) : null;
    if (!date || Number(date.slice(0, 4)) !== year) continue;
    const row: YieldRow = { date, DGS2: null, DGS10: null, DGS30: null };
    for (const tenor of TENORS) row[tenor] = parseRate(xmlText(entry, FIELDS[tenor]));
    if (TENORS.some(tenor => row[tenor] !== null)) rows.push(row);
  }
  const unique = new Map(rows.map(row => [row.date, row]));
  const result = Array.from(unique.values()).sort((a, b) => a.date.localeCompare(b.date));
  if (!result.length) throw new Error('Treasury ' + year + ': 유효 금리 관측치가 없습니다.');
  return result;
}

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 1000) / 1000;
}

export async function onRequestGet(): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800'
  };
  const now = new Date();
  const since = new Date(now.getTime() - 3 * 365.25 * 86400000).toISOString().slice(0, 10);
  const firstYear = Number(since.slice(0, 4));
  const lastYear = now.getUTCFullYear();
  try {
    const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
    const settled = await Promise.allSettled(years.map(async year => {
      const url = new URL(BASE_URL);
      url.searchParams.set('data', 'daily_treasury_yield_curve');
      url.searchParams.set('field_tdr_date_value', String(year));
      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8', 'User-Agent': 'SemiconductorIntelligence/1.2 (+https://semiconductor-intelligence.pages.dev)' },
        signal: AbortSignal.timeout(18000),
        cf: { cacheTtl: 900, cacheEverything: true }
      } as RequestInit);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const xml = await response.text();
      if (!xml.includes('<feed') && !xml.includes(':feed')) throw new Error('XML feed 형식이 아닙니다.');
      return parseTreasuryXml(xml, year);
    }));
    const errors = settled.flatMap((result, index) => result.status === 'rejected'
      ? [years[index] + '년: ' + (result.reason instanceof Error ? result.reason.message : '요청 실패')]
      : []);
    const all = settled.flatMap(result => result.status === 'fulfilled' ? result.value : [])
      .filter(row => row.date >= since)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (all.length < 100) throw new Error('최근 3년 관측치 부족 (' + all.length + '일). ' + errors.join('; '));
    const latest = {} as Record<Tenor, { value: number; date: string }>;
    for (const tenor of TENORS) {
      const row = [...all].reverse().find(item => item[tenor] !== null);
      if (!row) throw new Error(tenor + ' 최신 관측치를 찾을 수 없습니다.');
      latest[tenor] = { value: row[tenor] as number, date: row.date };
    }
    const buckets = new Map<string, Record<Tenor, number[]>>();
    for (const row of all) {
      const month = Number(row.date.slice(5, 7));
      const quarter = row.date.slice(0, 4) + 'Q' + (Math.floor((month - 1) / 3) + 1);
      if (!buckets.has(quarter)) buckets.set(quarter, { DGS2: [], DGS10: [], DGS30: [] });
      const bucket = buckets.get(quarter)!;
      for (const tenor of TENORS) if (row[tenor] !== null) bucket[tenor].push(row[tenor] as number);
    }
    const history = Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([quarter, values]) => ({
      quarter, DGS2: average(values.DGS2), DGS10: average(values.DGS10), DGS30: average(values.DGS30)
    }));
    if (history.length < 8) throw new Error('분기 데이터 부족 (' + history.length + '개). ' + errors.join('; '));
    const result = {
      ok: true, latest, history, count: history.length, observationCount: all.length,
      firstObservation: all[0].date, lastObservation: all[all.length - 1].date,
      updatedAt: new Date().toISOString(),
      source: 'U.S. Treasury Daily Treasury Par Yield Curve Rates',
      sourceUrl: BASE_URL,
      partial: errors.length > 0,
      warnings: errors
    };
    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false, error: error instanceof Error ? error.message : 'U.S. Treasury request failed',
      latest: {}, history: [], count: 0, observationCount: 0, updatedAt: new Date().toISOString(),
      source: 'U.S. Treasury Daily Treasury Par Yield Curve Rates'
    }), { status: 502, headers });
  }
}
