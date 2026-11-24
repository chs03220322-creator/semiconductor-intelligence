import { useEffect, useMemo, useState } from 'react';
import {
  Activity, BarChart3, CalendarDays, ChevronRight, ExternalLink,
  Gauge, Layers3, Menu, Server, ShieldCheck,
  TrendingUp, Wallet, X, Info
} from 'lucide-react';

type Section = 'overview'|'pricing'|'demand'|'capex'|'companies'|'cycles'|'insights'|'market';
type Period = '3Y'|'5Y'|'10Y'|'MAX';

const menu:{id:Section;no:string;label:string;sub:string;icon:any}[]=[
  {id:'overview',no:'01',label:'산업 사이클',sub:'시장 흐름과 업황 점수',icon:Activity},
  {id:'pricing',no:'02',label:'제품별 가격',sub:'DRAM·NAND·DDR 가격',icon:Layers3},
  {id:'demand',no:'03',label:'AI 수요 & 데이터센터',sub:'AI 투자와 전력 수요',icon:Server},
  {id:'capex',no:'04',label:'빅테크 투자',sub:'주요 기업 설비투자',icon:Wallet},
  {id:'companies',no:'06',label:'기업 실적',sub:'반도체 주요 기업',icon:BarChart3},
  {id:'cycles',no:'07',label:'장기 사이클',sub:'과거 흐름과 전망',icon:TrendingUp},
  {id:'insights',no:'08',label:'투자 시나리오',sub:'업황별 투자 관점',icon:Gauge},
  {id:'market',no:'10',label:'글로벌 금융시장',sub:'미국 증시·산업별 강세 지도',icon:TrendingUp},
];

const sources=[
  {name:'SIA · 2026년 3분기 글로벌 반도체 매출',date:'2026-11-03',url:'https://www.semiconductors.org/global-semiconductor-sales-increase-24-1-from-q2-2026-to-q3-2026/',desc:'3Q26 $517.7B, 9월 3개월 이동평균 $172.6B'},
  {name:'SIA · 2026년 1분기 글로벌 반도체 매출',date:'2026-05-04',url:'https://www.semiconductors.org/global-semiconductor-sales-increase-25-from-q4-2025-to-q1-2026/',desc:'1Q26 $298.5B'},
  {name:'SIA · 2026년 2분기 글로벌 반도체 매출',date:'2026-08-06',url:'https://www.semiconductors.org/global-semiconductor-sales-increase-35-1-from-q1-2026-to-q2-2026/',desc:'2Q26 $403.3B'},
  {name:'SIA · 2025년 연간 글로벌 반도체 매출',date:'2026-02-06',url:'https://www.semiconductors.org/global-annual-semiconductor-sales-increase-25-6-to-791-7-billion-in-2025/',desc:'2020~2025 연간 매출 시계열 기준'},
  {name:'Gartner · 2026년 반도체 시장 공개 전망',date:'2026-08-24',url:'https://www.gartner.com/en/newsroom/press-releases/2026-08-24-gartner-forecasts-worldwide-semiconductor-revenue-to-reach-1-trillion-dollars-in-2026',desc:'2025 estimate, 2026~2027 forecast; 보도자료 공개 수치 활용'},
  {name:'산업부 · 2026년 10월 ICT 수출입 동향',date:'2026-11-16',url:'https://www.motir.go.kr/kor/article/ATCL3f49a5a8c/172408/view',desc:'DRAM 8Gb·NAND 128Gb 공개 기준가격'},
  {name:'산업부 · 2026년 10월 수출입 동향',date:'2026-11-16',url:'https://www.motir.go.kr/kor/article/ATCL03465409b/171817/view',desc:'DDR5 16Gb 고정가격 10월 $50.0 공개치'},
  {name:'산업부 · 2026년 9월 ICT 수출입 동향',date:'2026-10-14',url:'https://www.motir.go.kr/kor/article/ATCL3f49a5a8c/172289/view',desc:'DRAM 16Gb·NAND 128Gb 기준가격'},
  {name:'산업부 · 2025년 10월 ICT 수출입 동향',date:'2025-11-14',url:'https://www.motir.go.kr/kor/article/ATCL3f49a5a8c/171187/view',desc:'2025년 DRAM 8Gb 및 NAND 128Gb 공개 가격 일부'},
  {name:'IEA · Energy and AI',date:'2025-04-10',url:'https://www.iea.org/reports/energy-and-ai/executive-summary',desc:'2024 데이터센터 전력 actual 기준 시계열'},
  {name:'IEA · Key Questions on Energy and AI',date:'2026-04-16',url:'https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary',desc:'2025 데이터센터 전력 485 TWh estimate, 2030 950 TWh forecast, HBM 부족 전망'},
  {name:'Samsung Electronics · 3Q26 실적',date:'2026-10-29',url:'https://news.samsungsemiconductor.com/global/samsung-electronics-announces-third-quarter-2026-results/',desc:'전사·DS·메모리 사업 실적 및 2027 수요 전망'},
  {name:'Samsung Electronics · 2Q26 실적',date:'2026-07-30',url:'https://news.samsungsemiconductor.com/global/samsung-electronics-announces-second-quarter-2026-results/',desc:'전사·DS·메모리 사업 실적'},
  {name:'Samsung Electronics · 1Q26 실적',date:'2026-04-30',url:'https://news.samsungsemiconductor.com/global/samsung-electronics-announces-first-quarter-2026-results/',desc:'전사·DS·메모리 사업 실적'},
  {name:'Samsung Electronics · Facts & Figures',date:'상시 공개 페이지',url:'https://www.samsung.com/global/sustainability/digital-library/facts-figures/',desc:'연간 연결 재무 시계열'},
  {name:'Samsung Electronics · Sustainability Report 2019',date:'2019-06-01',url:'https://www.samsung.com/global/sustainability/media/pdf/SustainabilityReport2019v2-en.pdf',desc:'2016~2018 연결 매출·영업이익 actual'},
  {name:'SK hynix · FY2025 실적발표',date:'2026-01-29',url:'https://news.skhynix.com/en/sk-hynix-announces-fy25-financial-results/',desc:'2016~2025 연간 재무 추이 및 FY2025 actual'},
  {name:'Micron · SEC filings',date:'FY2016~FY2025',url:'https://www.sec.gov/edgar/browse/?CIK=723125&owner=exclude',desc:'FY2016~FY2025 10-K 매출·영업이익 actual'},
  {name:'SK hynix · 3Q26 실적',date:'2026-10-28',url:'https://news.skhynix.com/en/q3-2026-business-results/',desc:'HBM4·Server DDR5·장기공급계약 및 2030 공급 전망'},
  {name:'SK hynix · 2Q26 실적',date:'2026-07-23',url:'https://news.skhynix.com/en/q2-2026-business-results/',desc:'분기 매출·영업이익'},
  {name:'SK hynix · 1Q26 실적',date:'2026-04-23',url:'https://news.skhynix.com/en/q1-2026-business-results/',desc:'분기 매출·영업이익'},
  {name:'SK hynix · FY2025 실적',date:'2026-01-28',url:'https://news.skhynix.com/en/sk-hynix-announces-fy25-financial-results/',desc:'연간 매출·영업이익'},
  {name:'Micron · FY2026 Q4 및 연간 실적',date:'2026-09-30',url:'https://investors.micron.com/news/press-release/2026/Micron-Technology-Inc--Reports-Record-Fiscal-Fourth-Quarter-and-Full-Year-2026-Results/',desc:'FY26 GAAP 분기·연간 실적, 순 CAPEX'},
  {name:'S&P Global Market Intelligence / Visible Alpha · Micron Q4 2026 estimates',date:'2026-10-27',url:'https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/10/behind-the-earnings-call-micron-technology-inc-q4-2026',desc:'FY2027~FY2028 매출·매출총이익률·영업비용 컨센서스'},
  {name:'Yahoo Finance · Micron analyst estimates',date:'2026-11-22',url:'https://finance.yahoo.com/quote/MU/analysis/',desc:'FY2027~FY2028 매출 컨센서스 평균·최저·최고; S&P Global Market Intelligence 집계'},
  {name:'Micron · FY2026 Q2 실적',date:'2026-03-18',url:'https://investors.micron.com/news/press-release/2026/Micron-Technology-Inc--Reports-Results-for-the-Second-Quarter-of-Fiscal-2026-03-18-2026/default.aspx',desc:'FY26 FQ1·FQ2 GAAP 분기 실적'},
  {name:'Micron · FY2026 Q1 실적',date:'2025-12-17',url:'https://investors.micron.com/news/press-release/2025/Micron-Technology-Inc--Reports-Results-for-the-First-Quarter-of-Fiscal-2026-12-17-2025/default.aspx',desc:'FY26 FQ1 GAAP 실적'},
  {name:'TSMC · 3Q26 실적',date:'2026-10-15',url:'https://investor.tsmc.com/english/quarterly-results/2026/q3',desc:'3Q26 매출·마진·4Q 가이던스'},
  {name:'TSMC · 2025 Annual Report',date:'2026-04-17',url:'https://investor.tsmc.com/static/annualReports/2025/english/index.html',desc:'CY2023~CY2025 연간 actual 매출·마진'},
  {name:'NVIDIA · FY2026 full-year results',date:'2026-02-25',url:'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Fourth-Quarter-and-Fiscal-2026/default.aspx',desc:'FY2024~FY2026 annual actual revenue · US GAAP'},
  {name:'NVIDIA · 1Q FY2027 results',date:'2026-05-20',url:'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-First-Quarter-Fiscal-2027/',desc:'FY27 Q1 revenue $81.615B, Data Center $75.2B'},
  {name:'NVIDIA · 2Q FY2027 results',date:'2026-08-26',url:'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Second-Quarter-Fiscal-2027/default.aspx',desc:'FY27 Q2 revenue $96.221B, Data Center $89.0B'},
  {name:'NVIDIA · 3Q FY2027 실적',date:'2026-11-17',url:'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-Third-Quarter-Fiscal-2027/',desc:'매출 $115.8B, 데이터센터 $107.6B, 4Q 가이던스'},
  {name:'Alphabet · 3Q26 실적발표 콜',date:'2026-10-28',url:'https://abc.xyz/investor/events/event-details/2026/2026-Q3-Earnings-Call-2026-Ujou16CTw9/',desc:'Q3 CAPEX $51.4B, 9개월 누적 $132.0B, Cloud 성장'},
  {name:'Alphabet · 3Q26 SEC 10-Q',date:'2026-10-29',url:'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000084/goog-20260930.htm',desc:'PPE 구매액·CAPEX 9개월 누적 원문'},
  {name:'Amazon · 3Q26 실적',date:'2026-10-29',url:'https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Third-Quarter-Results/',desc:'AWS 성장 및 PPE 구매액 3개월·9개월 누적'},
  {name:'Meta · 3Q26 SEC 10-Q',date:'2026-10-22',url:'https://www.sec.gov/Archives/edgar/data/1326801/000162828026066773/meta-20260930.htm',desc:'CAPEX·PPE 구매액 및 9개월 누적'},
  {name:'Microsoft · FY2027 Q1 실적발표 콜',date:'2026-10-28',url:'https://www.microsoft.com/en-us/investor/events/fy-2027/earnings-fy-2027-q1',desc:'Q1 CAPEX $45.2B, 현금 PPE $39.4B'},
  {name:'Microsoft · FY2026 Annual Report',date:'2026-08-05',url:'https://www.microsoft.com/investor/reports/ar26/',desc:'FY24~FY26 additions to PPE 연간 actual'},
  {name:'SK hynix · Yongin Y2 / Cheongju M17 투자',date:'2026-08-07',url:'https://news.skhynix.com/en/fab-facility-investment-2026/',desc:'신규 팹 투자 계획·장기 공급능력'}
];

const market=[
  {year:'2020',value:440.4},{year:'2021',value:555.9},{year:'2022',value:574.1},
  {year:'2023',value:526.8},{year:'2024',value:630.5},{year:'2025',value:791.7}
];
const marketForecast=[
  {year:'2025',value:809.0,status:'Estimate'},{year:'2026',value:1555.2,status:'Forecast'},
  {year:'2027',value:1939.9,status:'Forecast'}
];
const memoryForecast=[
  {year:'2025',value:220.1,status:'Estimate'},{year:'2026',value:837.3,status:'Forecast'},
  {year:'2027',value:1075.5,status:'Forecast'}
];
const globalQuarterly=[
  {year:'1Q26',value:298.5,status:'Actual',note:'SIA 발표 2026-05-04'},
  {year:'2Q26',value:403.3,status:'Actual',note:'SIA 발표 2026-08-06'},
  {year:'3Q26',value:517.7,status:'Actual',note:'SIA 발표 2026-11-03'}
];
const samsungAnnual=[
 {year:'2016',revenue:201.867,op:29.241},{year:'2017',revenue:239.575,op:53.645},{year:'2018',revenue:243.771,op:58.887},{year:'2019',revenue:230.401,op:27.769},{year:'2020',revenue:236.807,op:35.994},{year:'2021',revenue:279.605,op:51.634},{year:'2022',revenue:302.231,op:43.377},{year:'2023',revenue:258.935,op:6.567},{year:'2024',revenue:300.871,op:32.726},{year:'2025',revenue:333.606,op:43.601}
];
const skAnnual=[
 {year:'2016',revenue:17.198,op:3.276},{year:'2017',revenue:30.109,op:13.721},{year:'2018',revenue:40.445,op:20.844},{year:'2019',revenue:26.991,op:2.719},{year:'2020',revenue:31.900,op:5.013},{year:'2021',revenue:42.998,op:12.410},{year:'2022',revenue:44.622,op:6.809},{year:'2023',revenue:32.766,op:-7.730},{year:'2024',revenue:66.193,op:23.467},{year:'2025',revenue:97.147,op:47.206}
];
const micronAnnual=[
 {year:'2016',revenue:12.399,op:0.168},{year:'2017',revenue:20.322,op:5.870},{year:'2018',revenue:30.391,op:14.990},{year:'2019',revenue:23.406,op:7.384},{year:'2020',revenue:21.435,op:3.000},{year:'2021',revenue:27.705,op:6.276},{year:'2022',revenue:30.758,op:9.703},{year:'2023',revenue:15.540,op:-5.745},{year:'2024',revenue:25.111,op:1.304},{year:'2025',revenue:37.378,op:9.770}
];
const samsungQuarterly=[
  {period:'1Q26',revenue:133.9,op:57.2,margin:42.8},
  {period:'2Q26',revenue:171.5,op:89.5,margin:52.2},
  {period:'3Q26',revenue:195.3,op:107.4,margin:55.0}
];
const skQuarterly=[
  {period:'1Q26',revenue:52.5763,op:37.6103,margin:71.5},
  {period:'2Q26',revenue:79.3187,op:60.5426,margin:76.3},
  {period:'3Q26',revenue:104.6155,op:83.3338,margin:79.7}
];
const micronQuarterly=[
  {period:'FQ1-26',revenue:13.643,op:6.136,margin:45.0},
  {period:'FQ2-26',revenue:23.860,op:16.135,margin:67.6},
  {period:'FQ3-26',revenue:41.456,op:33.318,margin:80.4},
  {period:'FQ4-26',revenue:54.229,op:43.751,margin:80.7}
];
const tsmcAnnual=[{year:'2023',value:69.30},{year:'2024',value:90.08},{year:'2025',value:122.42}];
const nvidiaAnnual=[{year:'FY2024',value:60.922},{year:'FY2025',value:130.497},{year:'FY2026',value:215.938}];
const nvidiaQuarterly=[{year:'1Q FY27',value:81.615},{year:'2Q FY27',value:96.221},{year:'3Q FY27',value:115.8}];
const pricesDram16=[{year:'Jun 26',value:40.0},{year:'Jul 26',value:45.0},{year:'Aug 26',value:46.5},{year:'Sep 26',value:48.0}];
const pricesDdr5_16=[{year:'Jun 26',value:40.0},{year:'Jul 26',value:45.0},{year:'Aug 26',value:46.5},{year:'Sep 26',value:48.0},{year:'Oct 26',value:50.0}];
const pricesDram8=[{year:'Jul 26',value:24.0},{year:'Aug 26',value:25.0},{year:'Sep 26',value:26.0},{year:'Oct 26',value:27.5}];
const pricesNand=[
  {year:'Jun 26',value:28.8},{year:'Jul 26',value:30.1},{year:'Aug 26',value:30.5},
  {year:'Sep 26',value:30.6},{year:'Oct 26',value:30.6}
];
const prices2025Dram8=[
  {year:'Jul 25',value:3.9},{year:'Aug 25',value:5.7},{year:'Sep 25',value:6.3},{year:'Oct 25',value:7.0}
];
const prices2025Nand=[
  {year:'Jul 25',value:3.4},{year:'Aug 25',value:3.4},{year:'Sep 25',value:3.8},{year:'Oct 25',value:4.4}
];
const ieaAnnual=[{year:'2023',value:360},{year:'2024',value:416},{year:'2025',value:485},{year:'2026E',value:560},{year:'2027E',value:645},{year:'2028E',value:740},{year:'2029E',value:840},{year:'2030F',value:950}];
const aiPowerAnnual=[{year:'2025E',value:150},{year:'2026E',value:190},{year:'2027E',value:245},{year:'2028E',value:310},{year:'2029E',value:380},{year:'2030F',value:450}];
// Token forecast is a transparent scenario model, not an official global census. Anchor: JPMorgan AI Tracker estimated about 360T tokens/day in Jul-2026.
const tokenHistory=[{year:'Jan 2024',value:1},{year:'Jul 2024',value:3},{year:'Jan 2025',value:15},{year:'Jul 2025',value:70},{year:'Jan 2026',value:200},{year:'Jul 2026',value:360}];
const tokenBase=[...tokenHistory,{year:'2026E',value:400},{year:'2027E',value:600},{year:'2028E',value:900},{year:'2029E',value:1350},{year:'2030F',value:2000}];
const supplierCapex=[
  {company:'Samsung Electronics',period:'3Q26',quarter:'₩29.0T',ytd:'₩56.9T',definition:'전사 CAPEX; DS 3Q ₩27.2T, 1~3Q ₩52.8T'},
  {company:'Micron',period:'FY2026 Q4',quarter:'$10.77B',ytd:'$27.37B',definition:'Net CAPEX; FY2026 누계'}
];
const FX_USDKRW=1345; // 2026-11-23 spot mid-market reference
const memorySignals=[
  {id:'server',name:'Server DDR5',baseWeight:25,score:93,direction:'상승 · 강한 수요',basis:'SK hynix 3Q26는 server DDR5 판매가 크게 늘었다고 공시했고, 삼성은 서버 수요가 전 응용처 가격을 끌어올렸다고 설명. 정부 공개 범용 DRAM 16Gb 기준가격은 Jun $40.0 → Sep $48.0, DRAM 8Gb는 Jul $24.0 → Oct $27.5(+5.8% MoM). 이 가격은 서버 전용 ASP가 아닌 범용 proxy.'},
  {id:'pc',name:'PC DDR5',baseWeight:10,score:null,direction:'정량 미확보',basis:'PC 전용 DDR5 계약 ASP·출하량의 공개 시계열 미확보. 범용 DRAM 기준가격을 PC DDR5 가격으로 대체하지 않음.'},
  {id:'ddr4',name:'DDR4',baseWeight:5,score:null,direction:'정량 미확보',basis:'DDR4 전용 고정거래가격·계약 ASP 시계열 미확보. DRAM 8Gb/16Gb 범용 지표를 DDR4 가격으로 간주하지 않음.'},
  {id:'hbm',name:'HBM',baseWeight:25,score:98,direction:'초강세',basis:'SK hynix 3Q26 HBM4 출하 본격화, 4Q26 HBM4가 HBM3E를 출하량·매출에서 넘어 주력 제품이 될 전망, 2027~2028 생산능력의 50% 이상 장기계약 확보. IEA는 HBM 부족이 적어도 2027년 말까지 지속될 수 있다고 평가.'},
  {id:'nand',name:'NAND',baseWeight:15,score:80,direction:'가격 보합',basis:'NAND 128Gb 정부 공개 기준가격은 Sep~Oct $30.6으로 보합. 가격 흐름과 기업의 NAND 사업·수요 관련 공식 코멘트만 참고하며 수출액은 점수 산정에서 제외.'},
  {id:'inventory',name:'재고',baseWeight:10,score:null,direction:'재고일수 미확보',basis:'업체별 총 재고 잔액은 재무제표에 공개되나 DRAM/NAND 제품별·고객별 동일 기준 재고일수 시계열은 미확보. 점수에서 제외.'},
  {id:'asp',name:'삼성·하이닉스 ASP',baseWeight:10,score:null,direction:'정성적 상승 신호 · 수치 미공개',basis:'삼성·SK의 제품별·회사별 ASP 증감률은 미공개. 분기 매출에는 가격·bit 출하·제품 믹스가 함께 반영되므로 ASP를 매출에서 역산하지 않음.'}
];
const scoreable=memorySignals.filter(x=>x.score!==null);
const scoredBaseWeight=scoreable.reduce((s,x)=>s+x.baseWeight,0);
const cycleScore=Math.round(scoreable.reduce((s,x)=>s+(x.score as number)*x.baseWeight,0)/scoredBaseWeight);
const normalizedWeight=(base:number)=>Math.round(base/scoredBaseWeight*1000)/10;

function Pill({children,tone='muted'}:{children:any;tone?:'muted'|'green'|'amber'|'blue'}){return <span className={'pill '+tone}>{children}</span>}
function Title({eyebrow,title,desc}:{eyebrow:string;title:string;desc:string}){return <div className="section-title"><div className="eyebrow">{eyebrow.replace('01 / CYCLE MONITOR','01 / 산업 사이클').replace('02 / PRODUCT PRICING','02 / 제품별 가격').replace('03 / COMPUTE DEMAND','03 / AI 수요').replace('04 / HYPERSCALER INVESTMENT','04 / 빅테크 투자').replace('05 / SUPPLY & INVENTORY','05 / 공급과 재고').replace('06 / COMPANY FINANCIALS','06 / 기업 실적').replace('07 / LONG-TERM CYCLES','07 / 장기 사이클').replace('08 / INVESTMENT SCENARIOS','08 / 투자 시나리오').replace('09 / DATA & METHODOLOGY','09 / 데이터 방법론')}</div><h1>{title}</h1><p>{desc}</p></div>}
function krwText(value:any){if(typeof value!=='string')return value;return value.replace(/\$([\d,]+(?:\.\d+)?)(\s*(?:B|bn|billion))?/gi,(_m,n,suffix)=>{const v=Number(n.replace(/,/g,''));return suffix?'₩'+(v*FX_USDKRW/1000).toFixed(1)+'조':'₩'+Math.round(v*FX_USDKRW).toLocaleString('ko-KR')+'원'}).replace(/USD\s*\/\s*chip/gi,'원/칩').replace(/USD\s*bn/gi,'조 원').replace(/USD/gi,'KRW')}function visibleUnit(value:string){return value.replace(/USD\s*\/\s*chip/gi,'원/칩').replace(/USD\s*bn/gi,'조 원').replace(/USD/gi,'KRW')}
function Stat({label,value,sub}:{label:string;value:string;sub:string}){return <div className="stat"><span>{krwText(label)}</span><strong>{krwText(value)}</strong><small>{krwText(sub)}</small></div>}
function Table({headers,rows}:{headers:string[];rows:any[][]}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{visibleUnit(h)}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c===null?'미확보':krwText(c)}</td>)}</tr>)}</tbody></table></div>}
function pointPeriodKey(point:any):{kind:string;period:string;year:number}|null{
 const raw=String(point?.year||point?.period||point?.month||'').trim();
 let m=raw.match(/^(\d)Q\s*FY(\d{2,4})$/i);
 if(m)return {kind:'quarter',period:'Q'+m[1],year:Number(m[2].length===2?'20'+m[2]:m[2])};
 m=raw.match(/^FQ(\d)[- ](\d{2,4})$/i);
 if(m)return {kind:'quarter',period:'Q'+m[1],year:Number(m[2].length===2?'20'+m[2]:m[2])};
 m=raw.match(/^(\d)Q(\d{2,4})$/i);
 if(m)return {kind:'quarter',period:'Q'+m[1],year:Number(m[2].length===2?'20'+m[2]:m[2])};
 m=raw.match(/^FY(\d{2,4})$/i);
 if(m)return {kind:'annual',period:'annual',year:Number(m[1].length===2?'20'+m[1]:m[1])};
 m=raw.match(/^([A-Za-z]{3})\s+(\d{2,4})$/);
 if(m)return {kind:'month',period:m[1].toLowerCase(),year:Number(m[2].length===2?'20'+m[2]:m[2])};
 m=raw.match(/^(\d{4})(?:\s+(YTD))?$/i);
 if(m)return {kind:'year',period:m[2]?'YTD':'annual',year:Number(m[1])};
 m=raw.match(/^(\d{4})[EF](?:\*)?$/i);
 if(m)return {kind:'year',period:'annual',year:Number(m[1])};
 m=raw.match(/^FY(\d{2,4})[EF]$/i);
 if(m)return {kind:'annual',period:'annual',year:Number(m[1].length===2?'20'+m[1]:m[1])};
 return null;
}
function findPreviousPeriodPoint(data:any[],point:any){
 const key=pointPeriodKey(point);if(!key)return null;
 return data.find(candidate=>{const other=pointPeriodKey(candidate);return other&&other.kind===key.kind&&other.period===key.period&&other.year===key.year-1})||null;
}
function yoyChange(current:number|undefined,previous:number|undefined){
 return typeof current==='number'&&Number.isFinite(current)&&typeof previous==='number'&&Number.isFinite(previous)&&previous!==0?(current/previous-1)*100:null;
}
function priceChangeCell(data:{year:string;value:number}[],period:string,kind:'delta'|'rate'){
 const index=data.findIndex(point=>point.year===period);
 const current=data[index],previous=index>0?data[index-1]:null;
 if(!current||!previous||!Number.isFinite(current.value)||!Number.isFinite(previous.value)||previous.value===0)return <span className="price-change-na">—</span>;
 const delta=current.value-previous.value;
 const rate=delta/previous.value*100;
 const tone=delta>0?'up':delta<0?'down':'flat';
 const sign=delta>0?'+':delta<0?'−':'';
 const label=kind==='delta'?sign+'₩'+Math.round(Math.abs(delta)*FX_USDKRW).toLocaleString('ko-KR'):(rate>0?'+':'')+rate.toFixed(1)+'%';
 return <span className={'price-change '+tone}>{label}</span>;
}

function LineChart({data,keyName,label,height=220,comparisonData}:{data:any[];keyName:string;label:string;height?:number;comparisonData?:any[]}){
 const [selected,setSelected]=useState<number|null>(null);
 const isUsd=/USD/i.test(label);const perChip=/chip/i.test(label);
 const vals=data.map(d=>Number(d[keyName])*(isUsd?(perChip?FX_USDKRW:FX_USDKRW/1000):1));
 const min=Math.min(...vals),max=Math.max(...vals),range=max-min||1;
 const points=vals.map((v,i)=>[i/(Math.max(1,vals.length-1))*100,88-(v-min)/range*72]);
 const path=points.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(' ');
 const chosen=selected===null?null:data[selected];
 const chosenPrevious=chosen?findPreviousPeriodPoint(comparisonData||data,chosen):null;
 const chosenYoy=chosen?yoyChange(Number(chosen[keyName]),chosenPrevious?Number(chosenPrevious[keyName]):undefined):null;
 const chosenMonthPrevious=chosen&&perChip&&selected!==null&&selected>0?data[selected-1]:null;
 const chosenMom=chosenMonthPrevious?yoyChange(Number(chosen[keyName]),Number(chosenMonthPrevious[keyName])):null;
 const fmt=(v:number)=>perChip?'₩'+Math.round(v).toLocaleString('ko-KR'):isUsd?'₩'+v.toFixed(1)+'조':Number.isInteger(v)?v.toLocaleString('ko-KR'):v.toLocaleString('ko-KR',{maximumFractionDigits:2});
 const unitValue=(v:number)=>{
  if(/trillion tokens/i.test(label)) return v.toLocaleString('ko-KR',{maximumFractionDigits:1})+'조 개/일';
  if(/TWh/i.test(label)) return v.toLocaleString('ko-KR',{maximumFractionDigits:1})+' TWh/년';
   if(/USD bn/i.test(label)) return isUsd?fmt(v):'$'+v.toLocaleString('en-US',{maximumFractionDigits:1})+'B';
  if(perChip) return fmt(v)+' /개';
  if(isUsd) return fmt(v);
  const unit=label.split('·').slice(1).join('·').trim().split(/[·(]/)[0].trim();
  return fmt(v)+(unit?' '+unit:'');
 };
 const visibleLabel=label.split('·').slice(0,1).join('').trim();
 return <div className="line-chart" style={{height}}>
  <div className="chart-value-callout" aria-live="polite">{chosen?<><b>{chosen.year||chosen.period||chosen.month}</b><strong>{unitValue(Number(chosen[keyName])*(isUsd?(perChip?FX_USDKRW:FX_USDKRW/1000):1))}</strong><small style={{display:'block',marginTop:4,color:chosenMom===null?'var(--muted,#9aa9b7)':chosenMom>=0?'#55bf98':'#e0a06b',fontWeight:700}}>{perChip?(chosenMom===null?'전월 대비: 비교 데이터 없음':`전월 대비 ${chosenMom>=0?'+':''}${chosenMom.toFixed(1)}% · 전월 가격 ${unitValue(Number(chosenMonthPrevious[keyName])*(isUsd?(perChip?FX_USDKRW:FX_USDKRW/1000):1))}`):'전월 대비: 월별 데이터에만 표시'}</small><small style={{display:'block',marginTop:3,color:chosenYoy===null?'var(--muted,#9aa9b7)':chosenYoy>=0?'#55bf98':'#e0a06b',fontWeight:700}}>{chosenYoy===null?'전년 동기 대비: 비교 데이터 없음':`전년 동기 대비 ${chosenYoy>=0?'+':''}${chosenYoy.toFixed(1)}% · 전년 값 ${unitValue(Number(chosenPrevious[keyName])*(isUsd?(perChip?FX_USDKRW:FX_USDKRW/1000):1))}`}</small></>:<span>그래프의 점을 누르면 연도와 단위, 전년 동기 대비 증감률이 표시됩니다</span>}</div>
  <div className="line-plot"><div className="line-y-axis"><span>{fmt(max)}</span><span>{fmt((max+min)/2)}</span><span>{fmt(min)}</span></div>
   <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={label}>
    <path d={path} fill="none" stroke="#68c5d4" strokeWidth="2.1" vectorEffect="non-scaling-stroke"/>
    {selected!==null&&<line x1="0" y1={points[selected][1]} x2="100" y2={points[selected][1]} stroke="#f0c779" strokeWidth="1.2" strokeDasharray="3 2" vectorEffect="non-scaling-stroke"/>}
    {points.map((p,i)=><g key={i} onClick={()=>setSelected(i)} style={{cursor:'pointer'}}><circle cx={p[0]} cy={p[1]} r="4.2" fill="transparent"/><circle cx={p[0]} cy={p[1]} r={selected===i?2.5:1.7} fill={selected===i?'#f0c779':'#9cdae1'} stroke={selected===i?'#fff0c7':'#101a23'} strokeWidth=".7" vectorEffect="non-scaling-stroke"/></g>)}
   </svg>
  </div>
  <div className="line-labels">{data.map((d,i)=><button type="button" className={selected===i?'chosen':''} key={i} onClick={()=>setSelected(i)}>{d.year||d.period||d.month}</button>)}</div>
  <small>{visibleLabel} · {fmt(min)}–{fmt(max)}</small>
 </div>
}
function Sources({items}:{items:string[]}){return <div className="source-list">{items.map(name=>{const x=sources.find(v=>v.name===name);return <a href={x?.url||'#'} target="_blank" rel="noreferrer" key={name}><ExternalLink size={12}/>{name}</a>})}</div>}
function Notice({children}:{children:any}){return <div className="notice"><Info size={16}/><span>{krwText(children)}</span></div>}
function TrendPanel({title,series,quarterHeaders,quarterRows,note,source}:{title:string;series:{name:string;unit:string;data:{year:string;value:number}[];comparisonData?:{year:string;value:number}[]}[];quarterHeaders?:string[];quarterRows?:any[][];note?:string;source?:string[]}){
 return <div className="panel">
  <div className="panel-head"><div><h3>{title} · 연도별/기간별 추이</h3><p className="muted">실적·추정·전망을 구분하고 단위가 다른 지표는 별도로 표시합니다</p></div><Pill tone="blue">공개자료</Pill></div>
  {series.map(s=><div key={s.name}><p className="muted"><b>{s.name}</b> · {visibleUnit(s.unit)}</p><LineChart data={s.data} comparisonData={s.comparisonData} keyName="value" label={s.name+' · '+s.unit} height={185}/></div>)}
  {quarterRows&&<><h3>최근 공개 분기·월별 데이터</h3><Table headers={quarterHeaders||['기간','값','상태']} rows={quarterRows}/></>}  {note&&<Notice>{note}</Notice>}
  {source&&<Sources items={source}/>}
 </div>
}

function Overview({period,setPeriod}:{period:Period;setPeriod:(p:Period)=>void}){
 const data=period==='3Y'?market.slice(-3):period==='5Y'?market.slice(-5):market;
 return <>
  <Title eyebrow="01 / CYCLE MONITOR" title="반도체 사이클 한눈에 보기" desc="사이클 판단에 직접 영향을 주는 가격·AI 수요·기업 실적·공급 신호만 요약합니다. 세부 재무와 출처는 각 메뉴에서 확인할 수 있습니다."/>
  <div className="hero-score"><div className="score-main"><div className="score-label"><span className="live-dot"/> 가용 공개지표 정성평가 <Pill tone="green">참고용 proxy</Pill></div><div className="score-number">{cycleScore}<small>/ 100</small></div><p>강한 호황·상승 국면 · 평가 가능 지표 3/7</p><div className="score-foot"><span>HBM·서버 DRAM 강세</span><span>NAND 가격 보합</span><span>재고일수 미확보</span></div></div><div className="score-gauge"><div className="gauge-ring"><div><strong>{cycleScore}</strong><span>가용 지표 기준</span></div></div><small>전체 업황의 확정 점수 아님</small></div></div>
  <div className="stats-grid three">
   <Stat label="DRAM 8Gb · 2026년 10월" value="$27.5" sub="전월 대비 +5.8% · 공개 기준가격"/>
   <Stat label="NAND 128Gb · 2026년 10월" value="$30.6" sub="전월 대비 보합 · 공개 기준가격"/>
   <Stat label="SK하이닉스 영업이익 · 3Q26" value="₩83.33T" sub="K-IFRS actual · 전분기 대비 +38%"/>
  </div>
  <div className="panel"><div className="panel-head"><div><h3>사이클 판단에 필요한 핵심 신호</h3><p>중복되는 기업별 수치·세부 가중치 표는 이 화면에서 제외했습니다.</p></div><Pill tone="blue">핵심 3개 지표</Pill></div>
   <Table headers={['핵심 신호','현재 판단','해석']} rows={[
    ['HBM·서버 DRAM 수요','강세','삼성·SK하이닉스의 AI 메모리 및 서버 제품 판매 확대'],
    ['범용 DRAM 가격','상승','정부 공개 기준가격 상승. 단, 서버 DDR5 계약 ASP와 동일한 수치가 아님'],
    ['NAND 가격','보합','NAND 128Gb 공개 기준가격은 9~10월 $30.6으로 횡보'],
    ['공급·재고','주의 관찰','증설 계획은 확인되나 제품별 재고일수·bit 공급량은 동일 기준 미확보']
   ]}/>
   <Notice>92점은 Server DDR5·HBM·NAND에 부여한 정성 점수를 가중 평균한 참고값입니다. 전체 7개 지표 중 4개가 미확보이므로 점수 하나만으로 사이클 정점이나 하락 시점을 판단하지 않습니다.</Notice>
  </div>
  <div className="panel"><div className="panel-head"><div><h3>현재 사이클 해석</h3><p>이번 주 핵심 판단만 읽도록 요약</p></div><Pill tone="green">강한 확장 국면</Pill></div>
   <Table headers={['구분','판단']} rows={[
    ['현재 위치','호황·강한 확장 국면'],
    ['방향','상승 지속. 다만 NAND는 DRAM보다 가격 모멘텀이 약함'],
    ['상승 동력','AI 데이터센터 투자, HBM4 및 서버 DRAM 수요, 메모리 가격 상승'],
    ['가장 큰 위험','신규 공급 증가가 수요를 앞서거나, 메모리 가격 상승이 PC·모바일 수요를 위축시키는 경우'],
    ['판단 신뢰도','중간 이하: 재고일수·제품별 ASP·bit 공급 데이터 부족']
   ]}/>
  </div>
  <div className="period-bar"><div><b>글로벌 반도체 시장 규모</b><span>장기 사이클 확인용 · SIA 연간 actual</span></div><div className="segmented">{(['3Y','5Y','10Y','MAX'] as Period[]).map(p=><button className={period===p?'active':''} onClick={()=>setPeriod(p)} key={p}>{p==='MAX'?'전체':p}</button>)}</div></div>
  <div className="panel"><LineChart data={data} keyName="value" label="Global semiconductor sales · USD bn" height={190}/><Table headers={['연도','시장 매출','전년 대비']} rows={market.map((x,i)=>[x.year,'$'+x.value.toFixed(1)+'B',i===0?'—':((x.value/market[i-1].value-1)*100).toFixed(1)+'%'])}/><Sources items={['SIA · 2025년 연간 글로벌 반도체 매출']}/></div>
 </>;
}
function Pricing(){return <>
 <Title eyebrow="02 / PRODUCT PRICING" title="메모리 가격 & 수급" desc="정부가 공개한 범용 DRAM·NAND 기준가격과 DDR5 고정가격을 반영합니다. 제품별 전월 가격 증감액과 증감률을 함께 표시하며, 공개되지 않은 개별 계약 ASP는 추정하지 않습니다."/>
 <div className="stats-grid"><Stat label="DRAM 8Gb · Oct 2026" value="$27.5" sub="전월 대비 +5.8% · 공개 기준가격"/><Stat label="NAND 128Gb · Oct 2026" value="$30.6" sub="전월 대비 0.0% · 공개 기준가격"/></div>
 <TrendPanel title="2026년 정부 공개 메모리 고정가격" series={[{name:'DRAM 16Gb 공개 기준가격',unit:'USD / chip',data:pricesDram16},{name:'DDR5 16Gb 고정가격 (별도 계열)',unit:'USD / chip',data:pricesDdr5_16},{name:'DRAM 8Gb 공개 기준가격',unit:'USD / chip',data:pricesDram8,comparisonData:prices2025Dram8},{name:'NAND 128Gb 공개 기준가격',unit:'USD / chip',data:pricesNand,comparisonData:prices2025Nand}]} quarterHeaders={['월','DRAM 16Gb','증감액(원)','증감률','DDR5 16Gb','증감액(원)','증감률','DRAM 8Gb','증감액(원)','증감률','NAND 128Gb','증감액(원)','증감률','상태']} quarterRows={[
  ['Jun 26','$40.0',priceChangeCell(pricesDram16,'Jun 26','delta'),priceChangeCell(pricesDram16,'Jun 26','rate'),'$40.0',priceChangeCell(pricesDdr5_16,'Jun 26','delta'),priceChangeCell(pricesDdr5_16,'Jun 26','rate'),'—',priceChangeCell(pricesDram8,'Jun 26','delta'),priceChangeCell(pricesDram8,'Jun 26','rate'),'$28.8',priceChangeCell(pricesNand,'Jun 26','delta'),priceChangeCell(pricesNand,'Jun 26','rate'),'Actual'],
  ['Jul 26','$45.0',priceChangeCell(pricesDram16,'Jul 26','delta'),priceChangeCell(pricesDram16,'Jul 26','rate'),'$45.0',priceChangeCell(pricesDdr5_16,'Jul 26','delta'),priceChangeCell(pricesDdr5_16,'Jul 26','rate'),'$24.0',priceChangeCell(pricesDram8,'Jul 26','delta'),priceChangeCell(pricesDram8,'Jul 26','rate'),'$30.1',priceChangeCell(pricesNand,'Jul 26','delta'),priceChangeCell(pricesNand,'Jul 26','rate'),'Actual'],
  ['Aug 26','$46.5',priceChangeCell(pricesDram16,'Aug 26','delta'),priceChangeCell(pricesDram16,'Aug 26','rate'),'$46.5',priceChangeCell(pricesDdr5_16,'Aug 26','delta'),priceChangeCell(pricesDdr5_16,'Aug 26','rate'),'$25.0',priceChangeCell(pricesDram8,'Aug 26','delta'),priceChangeCell(pricesDram8,'Aug 26','rate'),'$30.5',priceChangeCell(pricesNand,'Aug 26','delta'),priceChangeCell(pricesNand,'Aug 26','rate'),'Actual'],
  ['Sep 26','$48.0',priceChangeCell(pricesDram16,'Sep 26','delta'),priceChangeCell(pricesDram16,'Sep 26','rate'),'$48.0',priceChangeCell(pricesDdr5_16,'Sep 26','delta'),priceChangeCell(pricesDdr5_16,'Sep 26','rate'),'$26.0',priceChangeCell(pricesDram8,'Sep 26','delta'),priceChangeCell(pricesDram8,'Sep 26','rate'),'$30.6',priceChangeCell(pricesNand,'Sep 26','delta'),priceChangeCell(pricesNand,'Sep 26','rate'),'Actual'],
  ['Oct 26','—',priceChangeCell(pricesDram16,'Oct 26','delta'),priceChangeCell(pricesDram16,'Oct 26','rate'),'$50.0',priceChangeCell(pricesDdr5_16,'Oct 26','delta'),priceChangeCell(pricesDdr5_16,'Oct 26','rate'),'$27.5',priceChangeCell(pricesDram8,'Oct 26','delta'),priceChangeCell(pricesDram8,'Oct 26','rate'),'$30.6',priceChangeCell(pricesNand,'Oct 26','delta'),priceChangeCell(pricesNand,'Oct 26','rate'),'Actual']
 ]} note="DRAM 16Gb 범용 기준가격과 DDR5 16Gb 고정가격은 서로 다른 공개 계열이므로 분리했습니다. 증감액은 기준가격의 USD/chip 차이를 기준 환율 1,345원으로 환산한 원/chip입니다. DDR5 16Gb는 10월 $50.0까지 공개되어 있습니다. 어느 series도 Server DDR5 RDIMM·PC DDR5 모듈 ASP와 동일하지 않습니다." source={['산업부 · 2026년 9월 ICT 수출입 동향','산업부 · 2026년 10월 ICT 수출입 동향','산업부 · 2026년 10월 수출입 동향']}/>
 <div className="panel"><h3>2025년 공개 DRAM 8Gb·NAND 128Gb 기준가격</h3><p className="muted">2025년 7~10월 관측치 · USD/chip · 2026년 series와 연도·시장 환경을 구분</p><LineChart data={prices2025Dram8} keyName="value" label="DRAM 8Gb reference · USD/chip" height={180}/><LineChart data={prices2025Nand} keyName="value" label="NAND 128Gb reference · USD/chip" height={180}/><Table headers={['월','DRAM 8Gb','증감액(원)','증감률','NAND 128Gb','증감액(원)','증감률']} rows={prices2025Dram8.map(x=>[x.year,'$'+x.value.toFixed(2),priceChangeCell(prices2025Dram8,x.year,'delta'),priceChangeCell(prices2025Dram8,x.year,'rate'),'$'+(prices2025Nand.find(n=>n.year===x.year)?.value??0).toFixed(2),priceChangeCell(prices2025Nand,x.year,'delta'),priceChangeCell(prices2025Nand,x.year,'rate')])}/><Sources items={['산업부 · 2025년 10월 ICT 수출입 동향']}/></div>
 <TrendPanel title="메모리 시장 규모 대리지표" series={[{name:'Memory semiconductor revenue',unit:'USD bn · 시장규모, ASP 아님',data:memoryForecast}]} quarterHeaders={['연도','메모리 시장 규모','상태','출처 기준']} quarterRows={memoryForecast.map(x=>[x.year,'$'+x.value.toFixed(1)+'B',x.status,'Gartner Aug 2026 public release'])} note="메모리 시장규모는 연간 매출 estimate/forecast이며 제품 단가·ASP가 아닙니다. 2025 estimate, 2026~2027 forecast를 actual과 분리했습니다." source={['Gartner · 2026년 반도체 시장 공개 전망']}/>
 <div className="panel"><h3>제품별 데이터 범위</h3><Table headers={['제품군','확인 가능한 항목','미확보 항목']} rows={[
  ['Server DDR5','기업 IR의 서버 DDR5 수요·제품 믹스 코멘트, 범용 DRAM 8Gb·16Gb 기준가격','Server RDIMM 계약 ASP·제품별 출하 bit'],['PC DDR5','글로벌 시장·기업 실적의 간접 신호','PC 전용 DDR5 계약 ASP·출하량'],['DDR4','기업 코멘트 및 범용 DRAM 시장 지표 일부','DDR4 단독 고정가격·계약 ASP'],['HBM','삼성·SK hynix의 HBM4 출하·사업 코멘트','고객별 HBM3E/HBM4 계약가격·ASP'],['NAND','NAND 128Gb 기준가격·SSD 수출','Enterprise SSD 제품별 계약 ASP'],['삼성·SK ASP','분기 매출·이익 및 가격 방향 코멘트','회사별·제품별 ASP 증감률']
 ]}/></div>
 </>;
}
function Demand(){return <>
 <Title eyebrow="03 / COMPUTE DEMAND" title="AI 수요 & 데이터센터" desc="전력·AI 토큰·AI 전용 데이터센터·빅테크 투자 등 서로 다른 수요 신호를 연도별로 추적합니다. 공개 실적과 기관 전망, 자체 시나리오를 명확히 구분합니다."/>
 <div className="stats-grid"><Stat label="2025 데이터센터 전력" value="485 TWh" sub="IEA estimate · 2026 update"/><Stat label="2030 데이터센터 전력" value="950 TWh" sub="IEA base case"/><Stat label="2026년 7월 글로벌 AI 토큰" value="약 360조/일" sub="JPMorgan AI Tracker 추정"/><Stat label="2030 AI 전력(추정)" value="약 450 TWh" sub="IEA AI-focused 약 3배 증가 적용"/></div>
 <TrendPanel title="글로벌 데이터센터 전체 전력 수요" series={[{name:"전력 소비량",unit:"TWh/year · 2024 actual, 2025 estimate, 2026~2030 interpolated model path",data:ieaAnnual}]} note="2023년 360 TWh, 2024년 416 TWh actual, 2025년 485 TWh estimate, 2030년 950 TWh forecast는 IEA 공개치입니다. 2026~2029 값은 IEA의 2025→2030 전망을 연결한 연도별 보간 경로이며 IEA가 개별 연도별로 발표한 공식 수치가 아닙니다." source={["IEA · Key Questions on Energy and AI (2026)"]}/>
 <TrendPanel title="AI 전용 데이터센터 전력 수요" series={[{name:"AI-focused data centres",unit:"TWh/year · indicative annual path",data:aiPowerAnnual}]} note="IEA는 AI 중심 데이터센터 전력 소비가 2025~2030년 약 3배 증가한다고 제시합니다. 2025년 약 150 TWh를 기준점으로 둔 연도별 값은 추세를 보기 위한 모델 경로이며, 중간 연도 값은 공식 발표치가 아닙니다." source={["IEA · Key Questions on Energy and AI (2026)"]}/>
 <TrendPanel title="글로벌 AI 토큰 사용량 · 일평균 run-rate" series={[{name:"Median · 중앙값 기준",unit:"Trillion tokens/day · median scenario, not official forecast",data:tokenBase}]} note="JPMorgan AI Tracker의 반기별 차트 값을 과거 구간에 추가했습니다(2024년 1월 약 1조/일, 2024년 7월 3조, 2025년 1월 15조, 2025년 7월 70조, 2026년 1월 200조, 2026년 7월 360조). 그래프의 과거 값은 차트 판독 기반 근사치입니다. 2026년 말~2030년 전망은 중앙값(Median) 기준 단일 경로이며, 공식 기관 전망이 아닌 자체 모델 추정치입니다. 토큰 집계 범위·중복·모델별 공개 수준이 통일되지 않아 실측 총량이 아닌 참고용 추정치입니다." source={["J.P. Morgan Asset Management · Eye on the Market: AI Tracker (2026)"]}/>
 <TrendPanel title="글로벌 빅테크 CAPEX" series={[{name:"Microsoft·Alphabet·Amazon·Meta",unit:"USD bn/year · four hyperscalers historical, 2026 broad-tech estimate",data:[{year:"2023",value:140},{year:"2024",value:217},{year:"2025",value:358},{year:"2026E",value:700}]}]} note="Microsoft·Alphabet·Amazon·Meta 4사의 CAPEX 합계 추이입니다. 2023~2025년은 과거 집계값, 2026년은 주요 기술기업 투자 증가 전망을 참고한 광의의 추정치로 개별 기업 공시 합계와 범위가 완전히 같지 않습니다." source={["IEA · Key Questions on Energy and AI (2026)"]}/>
 <div className="panel"><h3>연도별 수요 전망 한눈에 보기</h3><Table headers={["연도","데이터센터 전력","AI 전용 전력","AI 토큰/일 Median","구분"]} rows={[["2025","485 TWh","약 150 TWh","—","전력 estimate"],["2026","약 560 TWh","약 190 TWh","400조","전력 보간·토큰 시나리오"],["2027","약 645 TWh","약 245 TWh","600조","모델 경로"],["2028","약 740 TWh","약 310 TWh","900조","모델 경로"],["2029","약 840 TWh","약 380 TWh","1,350조","모델 경로"],["2030","950 TWh","약 450 TWh","2,000조","전력 IEA forecast·토큰 시나리오"]]}/><Notice>전력(TWh), 토큰(조/일), CAPEX(USD)는 서로 더하거나 하나의 지수로 합산하지 않습니다. 토큰 증가는 추론 workload 증가를 보여주지만, 모델 효율·토큰당 연산량·하드웨어 전성비에 따라 전력 및 메모리 수요로 전달되는 강도는 달라집니다.</Notice></div>
 <div className="panel"><h3>전력 인프라 병목·설비 밀도 지표</h3><Table headers={["지표","공개 전망","의미"]} rows={[["AI 서버 랙 전력밀도","2020~2025년 11배 상승, 2027년까지 추가 4배 수준","랙당 전력·냉각·전력반도체 수요 확대"],["AI 데이터센터 배터리 저장","2030년 약 20~25 GW 설치 가능성","전력망 변동 대응 및 UPS·ESS 투자"],["AI 데이터센터 전력 비중","2025~2030년 소비량 약 3배","전체 데이터센터 전력 증가보다 빠른 AI workload 확대"]]}/><Notice>랙 전력밀도와 배터리 저장 전망은 전력 수요량(TWh)과 다른 물리적 인프라 지표입니다. GPU 공급, 변압기·전력전자·냉각장비 리드타임을 함께 보면 실제 데이터센터 증설 속도를 판단하는 데 도움이 됩니다.</Notice><Sources items={["IEA · Key Questions on Energy and AI (2026)"]}/></div>
 <div className="panel"><h3>AI 수요 → 반도체 수요 전달 경로</h3><div className="bridge">{[["AI 학습·추론량","토큰·영상·reasoning·agent 사용량"],["가속기 설치량","GPU·ASIC 출하 및 서버 랙 증설"],["메모리 탑재량","HBM 용량·대역폭, DDR5, eSSD"],["메모리 bit 수요","출하량 × 시스템당 탑재 용량"]].map((x,i)=><div className="bridge-item" key={i}><span>0{i+1}</span><b>{x[0]}</b><small>{x[1]}</small>{i<3&&<ChevronRight/>}</div>)}</div><Notice>전력은 데이터센터 전체의 물리적 수요, 토큰은 AI 서비스 이용량, CAPEX는 투자 의지, GPU·ASIC 출하는 실제 설치 기반을 나타냅니다. 이 네 축이 함께 증가하는지 확인해야 AI 메모리 수요의 지속성을 더 정확히 판단할 수 있습니다.</Notice></div>
 </>}
function NasdaqTop10Panel(){ const [selected,setSelected]=useState('전체');
 // Quarter-end market capitalization snapshots, USD billions. Values are included only where the cited public quarterly ranking reports them.
 const periods=['23 Q1','23 Q2','23 Q3','23 Q4','24 Q1','24 Q2','24 Q3','24 Q4','25 Q1','25 Q2','25 Q3','25 Q4','26 Q1','26 Q2'];
 const series=[
  {company:'Apple',ticker:'AAPL',color:'#68c5d4',values:[2609,3050,2677,2994,2648,3322,3198,3785,3337,3060,3794,4057,3730,4249]},
  {company:'Microsoft',ticker:'MSFT',color:'#e6a85c',values:[2146,2532,2346,2795,3126,3230,3543,3134,2791,3700,3850,3625,2751,2770]},
  {company:'Alphabet',ticker:'GOOGL',color:'#9b8bea',values:[1332,1530,1662,1764,1893,2267,2058,2331,1895,2150,2975,3802,3470,4311]},
  {company:'NVIDIA',ticker:'NVDA',color:'#62bd8b',values:[686.09,1044,1074,1223,2259,3182,2979,3289,2644,3850,4542,4638,4238,4846]},
  {company:'Amazon',ticker:'AMZN',color:'#e58c9b',values:[1058,1337,1312,1570,1874,2011,1956,2307,2016,2330,2341,2485,2235,2563]},
  {company:'Meta',ticker:'META',color:'#7fa8e8',values:[549.48,735.45,772.49,909,1238,1279,1448,1478,1460,1860,1845,1671,1447,1429]},
  {company:'Broadcom',ticker:'AVGO',color:'#d1a1e8',values:[null,null,null,null,null,747.36,805.67,1087,787.247,1300,1589,1669,1467,1797]},
  {company:'Tesla',ticker:'TSLA',color:'#d5b66c',values:[656.42,829.67,794.2,789.93, null, null,835.81,1296,833.529,1020,1478,1580,1394,1579]}
 ];
 const active=series.filter(s=>selected==='전체'||s.company===selected);
 const chartW=980,chartH=370,left=88,right=24,top=30,bottom=58;
 const all=active.flatMap(s=>s.values.filter((v):v is number=>v!==null));
 const max=Math.max(...all,1)*1.08;
 const x=(i:number)=>left+i*(chartW-left-right)/(periods.length-1);
 const y=(v:number)=>top+(max-v)/max*(chartH-top-bottom);
 const fmt=(v:number)=>'$'+(v>=1000?(v/1000).toFixed(2)+'T':v.toFixed(0)+'B');
 return <div className="panel" style={{marginBottom:18}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><div><h3 style={{marginBottom:4}}>빅테크 시가총액 분기별 추이</h3><p className="muted" style={{margin:0}}>2023 Q1~2026 Q2 · 분기 말 기준 · USD · 확인 가능한 공시/시장 스냅샷</p></div><Pill tone="blue">분기별 꺾은선</Pill></div>
  <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',margin:'16px 0 10px'}}>
   <label className="muted" style={{fontSize:12}}>기업 선택</label>
   <select value={selected} onChange={e=>setSelected(e.target.value)} style={{background:'var(--panel-2)',color:'var(--text)',border:'1px solid var(--line)',borderRadius:8,padding:'7px 10px'}}><option value="전체">전체 기업</option>{series.map(s=><option key={s.company} value={s.company}>{s.company} ({s.ticker})</option>)}</select>
  </div>
  <div style={{width:'100%',overflowX:'auto'}}>
   <svg viewBox={`0 0 ${chartW} ${chartH}`} role="img" aria-label="빅테크 기업별 분기 말 시가총액 꺾은선 그래프" style={{width:'100%',minWidth:760,height:370,display:'block'}}>
    {[0,.25,.5,.75,1].map((t,i)=>{const v=max*t;return <g key={i}><line x1={left} x2={chartW-right} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".14" strokeDasharray="4 4"/><text x={left-9} y={y(v)+4} textAnchor="end" fontSize="11" fill="currentColor">{fmt(v)}</text></g>})}
    {periods.map((p,i)=><text key={p} x={x(i)} y={chartH-22} textAnchor="middle" fontSize="10" fill="currentColor">{p}</text>)}
    {active.map(s=>{const chunks:{i:number,v:number}[][]=[];let chunk:{i:number,v:number}[]=[];s.values.forEach((v,i)=>{if(v===null){if(chunk.length)chunks.push(chunk);chunk=[]}else chunk.push({i,v})});if(chunk.length)chunks.push(chunk);return <g key={s.company}>{chunks.map((pts,j)=><g key={j}><path d={pts.map((p,i)=>(i?'L':'M')+x(p.i)+','+y(p.v)).join(' ')} fill="none" stroke={s.color} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/>{pts.map(p=><g key={p.i}><circle cx={x(p.i)} cy={y(p.v)} r="4" fill={s.color} stroke="var(--panel)" strokeWidth="1.5"/><title>{s.company} ({s.ticker}) · {periods[p.i]} · {fmt(p.v)}</title></g>)}</g>)}</g>})}
   </svg>
  </div>
  <div className="legend-row">{active.map(s=><span key={s.company}><i style={{background:s.color}}/>{s.company}</span>)}</div>
  <div className="chart-hint">세로축 단위: USD. T=조 달러, B=십억 달러. 각 점은 해당 분기 말 시가총액(USD 십억)이며, 연결선은 확인된 분기 사이에만 표시합니다. 과거 분기 상위 시가총액 표에 값이 수록되지 않은 기간은 공란으로 두었습니다. 이 자료는 분기별 전체 종목 시계열 원자료가 아니라 분기 말 공개 스냅샷을 취합한 것이므로, 누락 구간을 0 또는 추정치로 해석하면 안 됩니다.</div>
 </div>
}
function Capex(){return <>
 <Title eyebrow="04 / HYPERSCALER INVESTMENT" title="빅테크 CAPEX" desc="나스닥 시가총액 상위 기업의 규모와 빅테크 설비투자를 함께 살펴봅니다. 회사별 FY/CY와 CAPEX 정의 차이를 구분합니다."/><NasdaqTop10Panel/>
 <div className="panel"><h3>최근 분기 CAPEX 순위 · 높은 순</h3><p className="muted">2026년 7~9월에 해당하는 최신 공개 분기 기준. Microsoft FY27 Q1은 2026년 7~9월이며, 나머지는 CY26 Q3입니다. 회사별 공시 정의는 표 하단 주석을 확인하세요.</p><Table headers={['순위','기업','기간','분기 CAPEX','비교 기준']} rows={[
  ['1','Amazon','3Q26','$77.259B','Gross PPE purchases'],
  ['2','Alphabet','3Q26','$51.4B','PPE purchases'],
  ['3','Microsoft','FY27 Q1','$45.2B','CAPEX incl. finance leases'],
  ['4','Meta','3Q26','$34.91B','CAPEX incl. finance lease principal']
 ]}/><Sources items={['Amazon · 3Q26 실적','Alphabet · 3Q26 실적발표 콜','Microsoft · FY2027 Q1 실적발표 콜','Meta · 3Q26 SEC 10-Q']}/></div>
 <div className="panel"><h3>최근 연간 CAPEX · 2025년 공시 기준</h3><Table headers={['순위','기업','회계기간','CAPEX','정의']} rows={[
  ['1','Amazon','CY2025','$128.32B','Gross PPE purchases'],
  ['2','Alphabet','CY2025','$91.4B','PPE purchases'],
  ['3','Meta','CY2025','$69.69B','PPE purchases; finance lease principal 별도'],
  ['4','Microsoft','FY2025','$64.55B','Additions to PPE']
 ]}/><Sources items={['Microsoft · FY2026 Annual Report','Alphabet · 3Q26 SEC 10-Q','Amazon · 3Q26 실적','Meta · 3Q26 SEC 10-Q']}/></div>
 <div className="panel"><h3>반도체 공급업체 투자 참고</h3><Table headers={['기업','기간','분기 CAPEX','누계','정의']} rows={supplierCapex.map(x=>[x.company,x.period,x.quarter,x.ytd,x.definition])}/><Sources items={['Samsung Electronics · 3Q26 실적','Micron · FY2026 Q4 및 연간 실적']}/></div>
 <div className="panel"><h3>CAPEX 해석 시 주의사항</h3><Table headers={['기업','기간·정의','비교 주의']} rows={[
  ['Microsoft','FY 종료 6월 · additions to PPE','FY 기준; FY27 Q1 CAPEX에는 finance leases 포함'],
  ['Alphabet','CY · PPE purchases','2026 9개월 누계 $132.0B, Q3 $51.4B'],
  ['Amazon','CY · gross PPE purchases','Q3 $77.259B, 9개월 $175.670B; net proceeds와 구분'],
  ['Meta','CY · CAPEX incl. finance lease principal','Q3 $34.91B, 9개월 $85.82B'],
  ['Samsung / Micron','공급업체 설비투자','하이퍼스케일러 CAPEX와 합산하지 않음']
 ]}/></div>
 </>}


type MemoryFinancialPoint={year:string;revenue:number;op?:number;periodLabel?:string;revenueLow?:number;revenueHigh?:number;opLow?:number;opHigh?:number};
type MemoryFinancialSeries={name:string;data:MemoryFinancialPoint[];color:string;currency:'KRW'|'USD'};
function MemoryComparePanel({title,subtitle,series,forecast=false}:{title:string;subtitle:string;series:MemoryFinancialSeries[];forecast?:boolean}){
 const [metric,setMetric]=useState<'revenue'|'op'>('revenue');
 const [selected,setSelected]=useState<{company:string;index:number}|null>(null);
 const maxZoom=series[0].data.length;
 const [zoom,setZoom]=useState(Math.min(maxZoom,forecast?6:11));
 const shown=series.map(s=>({...s,data:s.data.slice(-zoom),offset:s.data.length-Math.min(zoom,s.data.length)}));
 const values=shown.flatMap(s=>s.data.flatMap(d=>{const v=metric==='revenue'?d.revenue:d.op;const lo=metric==='revenue'?d.revenueLow:d.opLow;const hi=metric==='revenue'?d.revenueHigh:d.opHigh;return [v,lo,hi].filter((n):n is number=>typeof n==='number'&&Number.isFinite(n)).map(n=>n*(s.currency==='USD'?FX_USDKRW/1000:1))}));
 const min=Math.min(0,...values),max=Math.max(...values),range=max-min||1;
 const chartWidth=Math.max(730,110+(zoom-1)*66);
 const x=(i:number)=>58+i*((chartWidth-105)/Math.max(1,zoom-1));
 const y=(v:number)=>218-(v-min)/range*178;
 const selectedSeries=selected?shown.find(s=>s.name===selected.company):null;
 const selectedPoint=selectedSeries&&selected?selectedSeries.data[selected.index]:null;
 const selectedYear=selectedPoint?.year.replace(/^FY/,'').replace('*','');
  const selectedFullSeries=selected?series.find(s=>s.name===selected.company):null;
  const selectedPrevious=selectedPoint&&selectedFullSeries?findPreviousPeriodPoint(selectedFullSeries.data,selectedPoint):null;
  const selectedValue=selectedPoint?(metric==='revenue'?selectedPoint.revenue:selectedPoint.op):undefined;
  const selectedPreviousValue=selectedPrevious?(metric==='revenue'?selectedPrevious.revenue:selectedPrevious.op):undefined;
  const selectedYoy=yoyChange(selectedValue,selectedPreviousValue);
 const selectedRows=selectedYear?series.map(s=>({series:s,point:s.data.find(p=>p.year.replace(/^FY/,'').replace('*','')===selectedYear)})):[];
 const format=(v:number,currency:string)=>currency==='USD'?'₩'+(v*FX_USDKRW/1000).toFixed(2)+'조':'₩'+v.toFixed(2)+'조';
 const label=(p:MemoryFinancialPoint)=>p.periodLabel||p.year;
 return <div className="panel">
  <div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div><div className="segmented"><button className={metric==='revenue'?'active':''} onClick={()=>{setMetric('revenue');setSelected(null)}}>매출</button><button className={metric==='op'?'active':''} onClick={()=>{setMetric('op');setSelected(null)}}>영업이익</button></div></div>
  <div className="legend-row">{series.map(s=><span key={s.name}><i style={{background:s.color}}/>{s.name}</span>)}</div>
  <div style={{display:'flex',alignItems:'center',gap:10,margin:'8px 0 4px',flexWrap:'wrap'}}>
   <label htmlFor={forecast?'forecast-zoom':'history-zoom'} style={{fontSize:12,color:'var(--muted,#9aa9b7)',whiteSpace:'nowrap'}}>X축 표시 기간</label>
   <input id={forecast?'forecast-zoom':'history-zoom'} type="range" min="3" max={maxZoom} step="1" value={zoom} onChange={e=>{setZoom(Number(e.target.value));setSelected(null)}} style={{flex:'1 1 180px',accentColor:'#68c5d4'}}/>
   <b style={{fontSize:12,minWidth:66,textAlign:'right'}}>{zoom}개 시점</b>
  </div>
  <div style={{width:'100%',overflowX:'auto',overflowY:'hidden'}}>
   <svg viewBox={`0 0 ${chartWidth} 260`} role="img" aria-label={title} style={{width:'100%',minWidth:Math.min(chartWidth,520)+'px',height:'260px',display:'block',overflow:'visible'}}>
    {[0,1,2,3,4].map(i=>{const v=min+(max-min)*i/4;return <g key={i}><line x1="52" x2={chartWidth-18} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".12" strokeDasharray="3 4"/><text x="46" y={y(v)-4} textAnchor="end" fontSize="10" fill="currentColor">{v.toFixed(0)}</text></g>})}
    {shown.map(s=>{const vals=s.data.map(d=>{const v=metric==='revenue'?d.revenue:d.op;return typeof v==='number'?v*(s.currency==='USD'?FX_USDKRW/1000:1):undefined});const lows=s.data.map(d=>(metric==='revenue'?d.revenueLow:d.opLow));const highs=s.data.map(d=>(metric==='revenue'?d.revenueHigh:d.opHigh));const bandIdx=s.data.map((_,i)=>({i,lo:lows[i],hi:highs[i]})).filter(v=>typeof v.lo==='number'&&Number.isFinite(v.lo)&&typeof v.hi==='number'&&Number.isFinite(v.hi));const scale=s.currency==='USD'?FX_USDKRW/1000:1;const bandPath=bandIdx.length>1?[...bandIdx.map(v=>x(v.i)+','+y((v.hi as number)*scale)),...bandIdx.slice().reverse().map(v=>x(v.i)+','+y((v.lo as number)*scale))].join(' '):'';const path=vals.map((v,i)=>v===undefined?'':(i?'L':'M')+x(i)+','+y(v)).filter(Boolean).join(' ');return <g key={s.name}>{bandPath&&<polygon points={bandPath} fill={s.color} fillOpacity=".28" stroke={s.color} strokeOpacity=".75" strokeWidth="1.2" strokeLinejoin="round"><title>{s.name} 증권사 추정 최소~최대 범위</title></polygon>}{bandIdx.map(v=>{const yHigh=y((v.hi as number)*scale),yLow=y((v.lo as number)*scale),cx=x(v.i);return <g key={'band-'+v.i}><rect x={cx-17} y={Math.min(yHigh,yLow)} width="34" height={Math.max(3,Math.abs(yLow-yHigh))} rx="4" fill={s.color} fillOpacity=".32" stroke={s.color} strokeOpacity=".9" strokeWidth="1"/><line x1={cx-8} x2={cx+8} y1={yHigh} y2={yHigh} stroke={s.color} strokeWidth="2.2"/><line x1={cx-8} x2={cx+8} y1={yLow} y2={yLow} stroke={s.color} strokeWidth="2.2"/><title>{s.name} {label(s.data[v.i])} 최소 {format(v.lo as number,s.currency)} · 최대 {format(v.hi as number,s.currency)}</title></g>})}<path d={path} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round"/>{vals.map((v,i)=>v===undefined?null:<g key={i} onClick={()=>setSelected({company:s.name,index:i})} style={{cursor:'pointer'}}><circle cx={x(i)} cy={y(v)} r={selected?.company===s.name&&selected.index===i?7:4.5} fill={s.color} stroke="white" strokeWidth="1.5"/><circle cx={x(i)} cy={y(v)} r="11" fill="transparent"/><title>{s.name} {label(s.data[i])}: {format(metric==='revenue'?s.data[i].revenue:s.data[i].op as number,s.currency)}{lows[i]!==undefined&&highs[i]!==undefined?' · 범위 '+format(lows[i] as number,s.currency)+'~'+format(highs[i] as number,s.currency):''}</title></g>)}</g>})}
    {Array.from({length:zoom},(_,i)=><text key={i} x={x(i)} y="245" textAnchor="middle" fontSize="10" fill="currentColor">{label(shown[0].data[i])}</text>)}
   </svg>
  </div>
  {selectedPoint&&<div className="chart-value-callout" style={{marginTop:8,borderLeft:'3px solid '+(selectedFullSeries?.color||'#68c5d4')}}><b>{selectedFullSeries?.name} · {label(selectedPoint)} · {metric==='revenue'?'매출':'영업이익'}</b><strong>{typeof selectedValue==='number'?format(selectedValue,selectedFullSeries?.currency||'KRW'):'자료 미확보'}</strong><small style={{display:'block',marginTop:4,color:selectedYoy===null?'var(--muted,#9aa9b7)':selectedYoy>=0?'#55bf98':'#e0a06b',fontWeight:700}}>{selectedYoy===null?'전년 동기 대비: 비교 가능한 전년 데이터 없음':`전년 동기 대비 ${selectedYoy>=0?'+':''}${selectedYoy.toFixed(1)}% · 전년 값 ${format(selectedPreviousValue as number,selectedFullSeries?.currency||'KRW')}`}</small></div>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,margin:'8px 0 4px'}}>
   {series.map(s=>{const p=selected?selectedRows.find(r=>r.series.name===s.name)?.point:s.data[s.data.length-1];const value=p?(metric==='revenue'?p.revenue:p.op):undefined;const previous=p?findPreviousPeriodPoint(s.data,p):null;const previousValue=previous?(metric==='revenue'?previous.revenue:previous.op):undefined;const yoy=yoyChange(value,previousValue);return <div key={s.name} onClick={()=>p&&setSelected({company:s.name,index:shown.find(z=>z.name===s.name)?.data.findIndex(d=>d.year===p.year)??0})} style={{background:'#14212c',border:'1px solid '+s.color,borderRadius:7,padding:'9px 10px',minWidth:0,cursor:p?'pointer':'default'}}><div style={{fontSize:10,color:s.color,fontWeight:700}}>{s.name} · {p?label(p):(selected?selectedPoint?.year+' 자료 없음':label(s.data[s.data.length-1]))}</div><div style={{fontSize:17,fontWeight:750,color:'#eef4f8',marginTop:3,whiteSpace:'nowrap'}}>{typeof value==='number'&&Number.isFinite(value)?format(value,s.currency):'자료 미확보'}</div><div style={{fontSize:10,color:yoy===null?'#91a2b1':yoy>=0?'#55bf98':'#e0a06b',fontWeight:700,marginTop:3}}>{yoy===null?'전년 동기 대비 자료 없음':`YoY ${yoy>=0?'+':''}${yoy.toFixed(1)}% · 전년 ${format(previousValue as number,s.currency)}`}</div><div style={{fontSize:10,color:'#91a2b1',marginTop:2}}>{selected?'선택한 연도':'최신 시점'} · {metric==='revenue'?'매출':'영업이익'}</div></div>})}
  </div>
  <div className="chart-unit">단위: 조 원 · Micron은 USD 공시/모델 수치를 USD/KRW {FX_USDKRW.toLocaleString()}원으로 환산했습니다.</div>
  {!selectedPoint&&<div className="chart-hint">그래프의 원형 타점을 누르면 해당 연도/전망 연도의 매출·영업이익을 확인할 수 있습니다.</div>}
 </div>;
}
function MemoryThreeChart(){
 const sum=(rows:{revenue:number;op:number}[],key:'revenue'|'op')=>rows.reduce((v,row)=>v+row[key],0);
 const samsungSeries=[...samsungAnnual,{year:'2026 YTD',revenue:sum(samsungQuarterly,'revenue'),op:sum(samsungQuarterly,'op'),periodLabel:'2026 YTD · 1Q~3Q'}];
 const skSeries=[...skAnnual,{year:'2026 YTD',revenue:sum(skQuarterly,'revenue'),op:sum(skQuarterly,'op'),periodLabel:'2026 YTD · 1Q~3Q'}];
 const micronSeries=[...micronAnnual,{year:'FY2026',revenue:sum(micronQuarterly,'revenue'),op:sum(micronQuarterly,'op'),periodLabel:'FY2026 · FQ1~FQ4'}];
 const series:MemoryFinancialSeries[]=[{name:'삼성전자',data:samsungSeries,color:'#2563eb',currency:'KRW'},{name:'SK하이닉스',data:skSeries,color:'#0f9f6e',currency:'KRW'},{name:'Micron',data:micronSeries,color:'#d97706',currency:'USD'}];
 return <MemoryComparePanel title="메모리 3사 10년 실적 비교 · 최신 누계 포함" subtitle="2016~2025 연간 actual과 최신 공시 분기 누계 · X축 줌 슬라이더 · 매출/영업이익 전환 · 타점 선택" series={series}/>;
}
function MemoryThreeForecastChart(){
 const sum=(rows:{revenue:number;op:number}[],key:'revenue'|'op')=>rows.reduce((v,row)=>v+row[key],0);
 const annualized=(rows:{revenue:number;op:number}[])=>({revenue:sum(rows,'revenue')*4/rows.length,op:sum(rows,'op')*4/rows.length});
 const mid=(a:number,b:number)=>(a+b)/2;
 const extend=(rows:MemoryFinancialPoint[],color:string)=>{
  const out=[...rows];
  const lastValid=[...rows].reverse().find(p=>typeof p.revenue==='number'&&Number.isFinite(p.revenue));
  let rev=lastValid?.revenue;
  const growth=[.06,.05,.04],margin=[.48,.45,.42];
  for(let year=2029;year<=2031;year++){
   if(out.some(p=>p.year===String(year)+'E')) continue;
   if(typeof rev!=='number'||!Number.isFinite(rev)) continue;
   rev*=1+growth[year-2029];
   const op=rev*margin[year-2029];
   out.push({year:String(year)+'E',periodLabel:String(year)+'E · 장기 시나리오(증권사 범위 미확보)',revenue:rev,op});
  }
  return {name:'',data:out,color,currency:'KRW' as const};
 };
 // 삼성전자: 삼성증권(2026-10-08), 미래에셋(2026-10-30), 하나증권(2026-10-30/11-23), 삼성증권 주간전략(2026-11-13).
 const samsung:MemoryFinancialPoint[]=[
  {year:'2026E*',periodLabel:'2026E* · 1Q~3Q 누계 연환산',revenue:annualized(samsungQuarterly).revenue,op:annualized(samsungQuarterly).op},
  {year:'2027E',revenue:mid(928.268,1193.508),op:mid(532.028,624),revenueLow:928.268,revenueHigh:1193.508,opLow:532.028,opHigh:624},
  {year:'2028E',periodLabel:'2028E · 삼성증권 단일 추정',revenue:1019.684,op:590.302}
 ];
 // SK하이닉스: DS투자증권(11/10), 하나증권(11/23), LS증권(11/16).
 const sk:MemoryFinancialPoint[]=[
  {year:'2026E*',periodLabel:'2026E* · 1Q~3Q 누계 연환산',revenue:annualized(skQuarterly).revenue,op:annualized(skQuarterly).op},
  {year:'2027E',revenue:mid(569.898,643.076),op:mid(443.8,528.138),revenueLow:569.898,revenueHigh:643.076,opLow:443.8,opHigh:528.138},
  {year:'2028E',periodLabel:'2028E · LS증권 단일 추정',revenue:739.36,op:611.405},
  {year:'2029E',periodLabel:'2029E · DS투자증권 단일 추정(영업이익)',revenue:undefined as unknown as number,op:290.3}
 ];
 // Micron: S&P Global Market Intelligence / Visible Alpha FY27~FY28 consensus (2026-10~11); 회계연도(FY).
 // FY27~FY28 매출 평균·범위는 Yahoo Finance의 S&P Global 기반 컨센서스(2026-11-22). // 영업이익은 Visible Alpha 총이익률·영업비용으로 산출한 근사치이며, 직접 공표된 영업이익 컨센서스가 아님.
 const mu:MemoryFinancialPoint[]=[
  {year:'FY2026',periodLabel:'FY2026 · actual',revenue:micronQuarterly.reduce((v,p)=>v+p.revenue,0),op:micronQuarterly.reduce((v,p)=>v+p.op,0)},
  {year:'FY2027E',periodLabel:'FY2027E · S&P Global consensus; 영업이익은 gross margin×매출−opex 추정',revenue:276.02,op:231.3,revenueLow:212.42,revenueHigh:313.96},
  {year:'FY2028E',periodLabel:'FY2028E · S&P Global consensus; 영업이익은 gross margin×매출−opex 추정',revenue:320.83,op:264.65,revenueLow:224.16,revenueHigh:411.27}
 ];
 const series:MemoryFinancialSeries[]=[
  extend(samsung,'#2563eb'),
  extend(sk,'#0f9f6e'),
  {name:'Micron',data:mu,color:'#d97706',currency:'USD'}
 ];
 series[0].name='삼성전자';series[1].name='SK하이닉스';
 return <><MemoryComparePanel title="메모리 3사 향후 5년 실적 전망 · 증권사 추정 범위" subtitle="2027~2029 공개 리포트·컨센서스 수치 · 음영은 복수 추정치의 최소~최대 · 2030~2031은 장기 시나리오(범위 미공개)" series={series} forecast/><div className="chart-hint">음영은 동일 회계연도·동일 지표의 공개 추정치 최저~최고입니다. 삼성전자 2027년 매출·영업이익은 공개 리포트 간 범위, 2028년은 삼성증권 단일 추정치입니다. SK하이닉스 2027년은 DS투자증권·하나증권·LS증권 추정치 범위, 2028년은 LS증권 단일 추정치이며 2029년 영업이익은 DS투자증권 단일 추정치입니다. Micron은 FY2027~FY2028 매출에 S&P Global Market Intelligence 기반 애널리스트 최저~최고 범위를 반영했습니다. 영업이익은 Visible Alpha의 매출총이익률과 영업비용을 이용한 산출 근사치이며 직접 컨센서스가 아닙니다. 자료가 없는 지표는 임의 보간하지 않습니다. 2030~2031은 증권사 전망 범위를 확인하지 못해 장기 시나리오로 별도 표시합니다.</div><div className="source-list"><b>전망 출처</b><ul><li>삼성전자: 삼성증권(2026.10.08), 미래에셋증권(2026.10.30), 하나증권(2026.10.30·11.23), 삼성증권(2026.11.13)</li><li>SK하이닉스: DS투자증권(2026.11.10), LS증권(2026.11.16), 하나증권(2026.11.23)</li><li>Micron: S&P Global Market Intelligence 애널리스트 추정치(2026.11.18, Stock Analysis 공개 집계)</li></ul></div></>;
}
function Companies(){return <>
 <Title eyebrow="06 / COMPANY FINANCIALS" title="주요 반도체 기업 실적" desc="메모리 3사의 2016~2025 연간 실적에 각 사의 최신 공시 분기까지 누적한 실적을 추가해 비교합니다. 매출·영업이익 전환 및 타점별 수치 확인이 가능합니다."/>
 <MemoryThreeChart/>
 <MemoryThreeForecastChart/>
 <div className="panel"><h3>향후 5년 전망 산정 기준</h3><Table headers={['기업','공개 추정 범위의 출처','범위가 확인된 기간','미확보 구간']} rows={[
  ['삼성전자','미래에셋·삼성증권 등 공개 리포트의 추정치 최저~최고','2027~2028 매출·영업이익','2029~2031'],
  ['SK하이닉스','미래에셋 등 공개 리포트의 추정치 최저~최고','2027 매출·영업이익; 2028 단일 추정치','2029~2031'],
  ['Micron','S&P Global Market Intelligence 기반 공개 애널리스트 추정 범위','FY2027~FY2028 매출','영업이익 범위 및 FY2029~FY2031']
]}/>
 <Notice>음영은 공개 리포트·시장 데이터에 실제 기재된 최소~최대 범위이며, 여러 기관의 추정치가 존재하는 연도만 표시합니다. 2029~2031은 공신력 있는 비교 가능 범위를 확인하지 못해 기존 장기 시나리오 선만 표시하고 음영은 넣지 않았습니다. Micron FY2027~FY2028 매출은 S&P Global 기반 컨센서스 범위로 음영 표시합니다. 영업이익은 Visible Alpha의 매출총이익률·영업비용으로 산출한 근사치이며 영업이익 범위는 공개 확인되지 않아 음영을 표시하지 않습니다. 삼성전자·SK하이닉스·Micron의 회계연도와 추정 기준은 서로 다를 수 있습니다.</Notice>
 <Sources items={['Mirae Asset Securities · Samsung Electronics · 2026-10-30','Samsung Securities · Samsung Electronics · 2026-10-08','Mirae Asset Securities · SK hynix · 2026-11','S&P Global Market Intelligence · Micron consensus estimates · 2026-11-18']}/></div>
 <div className="panel"><h3>최근 분기 실적 · 2026년</h3><Table headers={['기업','기간','매출','영업이익','기준']} rows={[
  ...samsungQuarterly.map(x=>['삼성전자',x.period,'₩'+x.revenue.toFixed(1)+'조','₩'+x.op.toFixed(1)+'조','K-IFRS Actual']),
  ...skQuarterly.map(x=>['SK하이닉스',x.period,'₩'+x.revenue.toFixed(2)+'조','₩'+x.op.toFixed(2)+'조','K-IFRS Actual']),
  ...micronQuarterly.map(x=>['Micron',x.period,'$'+x.revenue.toFixed(3)+'B','$'+x.op.toFixed(3)+'B','US GAAP Actual'])
 ]}/><Sources items={['Samsung Electronics · 1Q26 실적','Samsung Electronics · 2Q26 실적','Samsung Electronics · 3Q26 실적','SK hynix · 1Q26 실적','SK hynix · 2Q26 실적','SK hynix · 3Q26 실적','Micron · FY2026 Q1 실적','Micron · FY2026 Q2 실적','Micron · FY2026 Q4 및 연간 실적']}/></div>
 <TrendPanel title="AI 공급망 선행지표 · 연간 및 최신 분기 actual" series={[
  {name:'TSMC annual revenue · CY',unit:'USD bn',data:tsmcAnnual},
  {name:'TSMC quarterly revenue · CY26',unit:'USD bn / quarter',data:[{year:'1Q26',value:35.9},{year:'2Q26',value:44.6},{year:'3Q26',value:46.72}]},
  {name:'NVIDIA annual revenue · FY',unit:'USD bn',data:nvidiaAnnual},
  {name:'NVIDIA quarterly revenue · FY27',unit:'USD bn / quarter',data:nvidiaQuarterly}
 ]} quarterHeaders={['기업','기간','매출','추가 지표','상태']} quarterRows={[
  ['TSMC','2023 CY','$69.30B','Annual actual · USD','Actual'],['TSMC','2024 CY','$90.08B','Annual actual · USD','Actual'],['TSMC','2025 CY','$122.42B','Annual actual · USD','Actual'],['TSMC','1Q~3Q26','$127.22B','YTD actual · CY · 1Q $35.9B / 2Q $44.6B / 3Q $46.72B','Actual'],
  ['NVIDIA','FY2024','$60.922B','Annual actual · USD · GAAP','Actual'],['NVIDIA','FY2025','$130.497B','Annual actual · USD · GAAP','Actual'],['NVIDIA','FY2026','$215.938B','Annual actual · USD · GAAP','Actual'],
  ['NVIDIA','1Q FY27','$81.615B','Data Center $75.2B','Actual'],['NVIDIA','2Q FY27','$96.221B','Data Center $89.0B','Actual'],['NVIDIA','3Q FY27','$115.8B','Data Center $107.6B','Actual']
 ]} note="TSMC 연간은 CY, NVIDIA 연간은 FY(1월 말 종료)입니다. TSMC 2026 YTD는 1~3Q 합계, NVIDIA FY27 YTD는 Q1~Q3 합계 $293.636B입니다. GAAP 기준 actual이며 TSMC는 TIFRS 연결 기준, NVIDIA는 US GAAP 기준입니다. 통화·회계기간이 다른 기업의 수치를 합산해 순위를 만들지 않습니다." source={['TSMC · 2025 Annual Report','TSMC · 3Q26 실적','NVIDIA · FY2026 full-year results','NVIDIA · 1Q FY2027 results','NVIDIA · 2Q FY2027 results','NVIDIA · 3Q FY2027 실적']}/>
 </>}
function Cycles(){return <>
 <Title eyebrow="07 / LONG-TERM HISTORY" title="장기 반도체 사이클" desc="글로벌 반도체 시장과 메모리 시장의 연간 매출 추이를 실제·추정·전망으로 구분해 장기 사이클을 봅니다."/>
 <TrendPanel title="글로벌 반도체 시장 매출" series={[{name:'SIA annual actual',unit:'USD bn',data:market},{name:'Gartner estimate / forecast',unit:'USD bn',data:marketForecast}]} quarterHeaders={['기간','매출','상태','자료 기준']} quarterRows={[
  ...market.map(x=>[x.year,'$'+x.value.toFixed(1)+'B','Actual','SIA']),
  ...globalQuarterly.map(x=>[x.year,'$'+x.value.toFixed(1)+'B','Actual','SIA quarterly release'])
 ]} note="SIA 2025 actual $791.7B와 Gartner 2025 estimate $809.0B는 서로 다른 출처·시점의 수치입니다. 같은 연도라도 하나로 덮어쓰지 않고 구분해 유지합니다. SIA 2026 Q1~Q3 분기 actual의 단순 합은 $1,219.5B이나 Q2 비교기준 개정 여부를 확인할 때까지 잠정 합산으로만 취급합니다." source={['SIA · 2025년 연간 글로벌 반도체 매출','SIA · 2026년 3분기 글로벌 반도체 매출','Gartner · 2026년 반도체 시장 공개 전망']}/>
 <TrendPanel title="메모리 반도체 시장 매출 전망" series={[{name:'Memory market revenue',unit:'USD bn · estimate/forecast',data:memoryForecast}]} quarterHeaders={['연도','시장 규모','상태']} quarterRows={memoryForecast.map(x=>[x.year,'$'+x.value.toFixed(1)+'B',x.status])} note="연간 시장 규모는 ASP가 아니라 시장 매출 추정·전망치입니다. 2026년 분기 메모리 시장 매출 actual은 동일한 시계열로 확보되지 않아 미확보입니다." source={['Gartner · 2026년 반도체 시장 공개 전망']}/>
 </>}

function Insights(){return <>
 <Title eyebrow="08 / INVESTMENT FRAMEWORK" title="투자 시나리오 & 인사이트" desc="공식 분기 실적·기업 가이던스·공개 메모리 가격·공급투자 신호로 메모리 사이클의 지속성과 위험을 점검합니다. 주가 목표·유료 컨센서스는 사용하지 않습니다."/>
 <div className="grid-3"><div className="scenario bull"><Pill tone="green">BULL CASE</Pill><h3>AI 인프라 투자 지속</h3><p>HBM4 양산 확대, Server DDR5 수요, QLC/eSSD 수요가 공급 증가를 흡수. 삼성은 2027 AI 수요가 업계 공급을 크게 웃돌 것으로 전망.</p><strong>확인 변수: HBM4 출하·서버 DDR5·CAPEX</strong></div><div className="scenario base"><Pill tone="blue">BASE CASE</Pill><h3>성장률 정상화</h3><p>AI 서버 수요는 견조하지만 메모리 가격 부담으로 PC·모바일의 구매량과 교체 수요가 둔화. NAND 기준가격은 최근 보합.</p><strong>확인 변수: NAND 가격·PC OEM 수요·제품 믹스</strong></div><div className="scenario bear"><Pill tone="amber">BEAR CASE</Pill><h3>CAPEX ROI·공급 조정</h3><p>하이퍼스케일러 투자가 매출·현금흐름으로 충분히 회수되지 않거나, 신규 팹·공정전환 공급이 수요를 앞서면 가격과 ASP가 하락할 수 있음.</p><strong>확인 변수: FCF·재고·CAPEX 가이던스</strong></div></div>
 <div className="panel"><h3>현재 사이클 판정</h3><Table headers={['항목','판단','근거']} rows={[
  ['사이클 위치','호황·강한 확장 국면','SIA Q3 매출 증가, 한국 반도체 수출 급증, 삼성·SK·Micron 분기 실적 기록'],
  ['현재 방향','상승','범용 DRAM 8Gb 기준가격 10월 +5.8% MoM, Server DDR5·HBM 수요 확대'],
  ['NAND','가격은 횡보, eSSD 수요는 강세','NAND 128Gb 9~10월 $30.6 보합, SSD 수출 YoY +584.3%'],
  ['지속 가능성','2027년까지 타이트한 수급 가능성 우세, 확정 아님','IEA는 HBM 부족이 적어도 2027년 말까지 지속될 수 있다고 평가; SK hynix는 전체 메모리 수급 부족이 2030년까지 이어질 수 있다고 전망한 기업 시나리오'],
  ['가격·재고 과열 여부','일부 가격 부담 신호, 재고 정점은 판정 불가','PC·모바일 가격 민감도 및 동일 기준 재고일수 미확보']
 ]}/><Notice>사이클 판단은 공개자료에 기반한 분석입니다. 기업의 미래 전망은 실제 결과가 아니며, 재고일수·제품별 ASP가 미확보여서 정확한 피크 시점은 특정할 수 없습니다.</Notice></div>
 <div className="panel"><h3>주요 상승·하락 리스크</h3><Table headers={['구분','요인','투자 해석']} rows={[
  ['상승','AI 서버·agentic AI 인프라 확장','HBM·서버 DRAM·eSSD 수요를 지지'],
  ['상승','선단 공정·신규 팹의 긴 리드타임','공급 반응이 늦어 타이트한 수급 지속 가능'],
  ['상승','장기 공급계약 확대','출하 가시성·고부가 제품 믹스 개선'],
  ['하락','메모리 가격 상승에 따른 PC·스마트폰 수요 위축','비AI 최종수요에서 가격 탄력성 확대 가능'],
  ['하락','빅테크 CAPEX의 자금조달·ROI 부담','IEA는 데이터센터 투자가 자본시장 자금과 AI 투자수익률·금융여건에 더 민감해질 수 있다고 지적; Amazon TTM FCF -$42.4B'],
  ['하락','2027년 이후 신규 공급·공정전환 가속','수요 증가율보다 공급 증가율이 커지면 가격 전환 가능'],
  ['하락','제품별 재고·ASP 공개 부족','현재 호황의 후반부 여부를 확정하기 어려움']
 ]}/><Sources items={['Samsung Electronics · 3Q26 실적','SK hynix · 3Q26 실적','Alphabet · 3Q26 실적발표 콜','Amazon · 3Q26 실적']}/></div>
 <div className="panel"><h3>다음 업데이트에서 우선 확인할 항목</h3><Table headers={['우선순위','지표','확인할 변화']} rows={[
  ['1','DRAM 8Gb·NAND 128Gb 공개 기준가격','11월 가격 발표 시 상승 지속·보합·하락 여부; 서로 다른 DRAM/DDR5 가격 계열을 혼합하지 않음'],
  ['2','Server DDR5·HBM4','삼성·SK의 Q4 출하·제품 믹스 및 장기계약 코멘트'],
  ['3','PC·모바일 수요','가격 인상 이후 출하량·OEM 구매 조정 신호'],
  ['4','SSD 수출','11월 월간 수출과 1~10일 잠정치의 차이'],
  ['5','재고·CAPEX','기업 분기보고서의 재고·설비투자 및 현금흐름']
 ]}/></div>
 </>}


type MarketQuote={symbol:string;name:string;price:number;change:number;change5d:number|null;currency:string;time?:number};
const MARKET_GROUPS=[
 {name:'AI · 반도체',ticker:'SOXX',symbols:['NVDA','AVGO','AMD','MU'],desc:'AI 가속기·메모리·네트워크'},
 {name:'데이터센터 · 전력',ticker:'XLU',symbols:['VRT','ETN','CEG','GEV'],desc:'서버 인프라·전력망·발전'},
 {name:'경기방어 · 필수소비재',ticker:'XLP',symbols:['WMT','COST','PG','KO'],desc:'필수소비·유통·생활용품'},
 {name:'바이오 · 헬스케어',ticker:'XBI',symbols:['LLY','ABBV','REGN','ISRG'],desc:'제약·바이오·의료기기'},
 {name:'금융',ticker:'XLF',symbols:['JPM','GS','BAC','MS'],desc:'은행·투자은행·자본시장'},
 {name:'에너지',ticker:'XLE',symbols:['XOM','CVX','COP','SLB'],desc:'석유·가스·에너지 서비스'},
 {name:'산업재 · 방산',ticker:'XLI',symbols:['CAT','GE','RTX','HON'],desc:'산업 자동화·항공우주·방산'},
 {name:'커뮤니케이션 · 플랫폼',ticker:'XLC',symbols:['GOOGL','META','NFLX','T'],desc:'광고·플랫폼·통신'},
 {name:'경기민감 · 소비재',ticker:'XLY',symbols:['AMZN','TSLA','HD','MCD'],desc:'소매·자동차·외식·주택'},
 {name:'부동산',ticker:'XLRE',symbols:['PLD','AMT','EQIX','O'],desc:'리츠·물류·데이터센터 부동산'},
 {name:'소재',ticker:'XLB',symbols:['LIN','APD','SHW','FCX'],desc:'화학·산업소재·구리'}
];
const MARKET_NAMES:Record<string,string>={'^GSPC':'S&P 500','^IXIC':'NASDAQ Composite','^DJI':'Dow Jones','^RUT':'Russell 2000','^VIX':'VIX','NVDA':'NVIDIA','MSFT':'Microsoft','GOOGL':'Alphabet','AMZN':'Amazon','META':'Meta','AAPL':'Apple','AVGO':'Broadcom','TSLA':'Tesla'};
function Market(){
 const [quotes,setQuotes]=useState<Record<string,MarketQuote>>({});
 const [yields,setYields]=useState<Record<string,{value:number;date:string}>>({});
 const [loading,setLoading]=useState(false);
 const [updated,setUpdated]=useState('');
 const [error,setError]=useState('');
 const [expanded,setExpanded]=useState<string|null>(null);
 const symbols=useMemo(()=>Array.from(new Set(['^GSPC','^IXIC','^DJI','^RUT','^VIX','NVDA','MSFT','GOOGL','AMZN','META','AAPL','AVGO','TSLA',...MARKET_GROUPS.flatMap(g=>[g.ticker,...g.symbols])])),[]);
 const load=async()=>{
  setLoading(true);setError('');
  try{
   const batches=Array.from({length:Math.ceil(symbols.length/8)},(_,i)=>symbols.slice(i*8,(i+1)*8));
   const merged:Record<string,MarketQuote>={};
   const allErrors:string[]=[];
   let latestYields:Record<string,{value:number;date:string}>={};
   for(let i=0;i<batches.length;i+=3){
    const results=await Promise.all(batches.slice(i,i+3).map(async(batch,j)=>{
     const includeYields=i===0&&j===0;
     const response=await fetch('/api/market?symbols='+encodeURIComponent(batch.join(','))+(includeYields?'':'&includeYields=0'),{cache:'no-store'});
     const payload=await response.json();
     if(!response.ok)throw new Error(payload?.error||('HTTP '+response.status));
     return payload;
    }));
    for(const payload of results){Object.assign(merged,payload?.quotes||{});allErrors.push(...(payload?.errors||[]));if(payload?.yields)Object.assign(latestYields,payload.yields);}
   }
   setQuotes(merged);
   setYields(latestYields);
   if(Object.keys(merged).length<8||allErrors.length>0){
    setError('일부 시세를 불러오지 못했습니다. 잠시 후 다시 시도합니다.');
   }
  }catch(e){
   setError('시장 데이터 연결이 원활하지 않습니다. 잠시 후 다시 시도합니다.');
  }finally{
   setUpdated(new Date().toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}));
   setLoading(false);
  }
 };
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),300000);return()=>window.clearInterval(id);},[]);
 const fmt=(v:number)=>v.toLocaleString('en-US',{maximumFractionDigits:2});
 const pct=(v:number|null|undefined)=>v==null?'—':(v>0?'+':'')+v.toFixed(2)+'%';
 const tone=(v:number|null|undefined)=>v==null?'flat':v>=1?'strong':v>0?'up':v<=-1?'weak':v<0?'down':'flat';
 const sectorData=MARKET_GROUPS.map(g=>{const list=g.symbols.map(s=>quotes[s]).filter((q):q is MarketQuote=>Boolean(q));const avg=list.length?list.reduce((a,q)=>a+q.change,0)/list.length:null;const fiveList=list.filter(q=>q.change5d!=null);const avg5d=fiveList.length?fiveList.reduce((a,q)=>a+(q.change5d||0),0)/fiveList.length:null;const etf=quotes[g.ticker];return {...g,avg,avg5d,etf,coverage:list.length};}).sort((a,b)=>(b.avg??-999)-(a.avg??-999)); const up=sectorData.filter(g=>(g.avg??0)>0).length;
 const benchmark=quotes['^GSPC']?.change;
 return <><Title eyebrow="10 / GLOBAL MARKET PULSE" title="글로벌 금융시장 & 산업별 강세 지도" desc="미국 주요 지수·빅테크·산업별 대표 종목·국채 금리를 한 화면에서 확인합니다. 초록은 상승, 빨강은 하락이며 모든 주가 수치는 전일 종가 기준 등락률입니다."/>
 <div className="market-toolbar"><div><span className="market-live-dot"/><b>시장 데이터</b><small>{updated?'최근 확인 '+updated+' (한국시간)':'데이터 확인 중'}</small></div><button className="market-refresh" onClick={()=>void load()} disabled={loading}><Activity size={14}/>{loading?'업데이트 중':'새로고침'}</button></div>
 {error&&<div className="market-warning"><Info size={15}/>{error} · 시세 제공처의 접속 정책에 따라 일부 브라우저에서 제한될 수 있습니다.</div>}
 <div className="market-index-grid">{['^GSPC','^IXIC','^DJI','^RUT','^VIX'].map(s=>{const q=quotes[s];return <div className={'market-index '+(q?'tone-'+tone(s==='^VIX'?-q.change:q.change):'')} key={s}><span>{MARKET_NAMES[s]}</span><strong>{q?fmt(q.price):'—'}</strong><b>{q?pct(q.change):loading?'불러오는 중':'미확보'}</b><small>{s==='^VIX'?'변동성 지수 · 상승은 위험 신호':'전일 대비'}{q&&q.change5d!=null?' · 5일 '+pct(q.change5d):''}</small></div>})}</div>
 <section className="panel market-panel"><div className="panel-head"><div><h3>산업별 강세 지도</h3><p>구성 대표 종목의 단순 평균 수익률 기준 · 종목 수익률로 계산한 테마 지표</p></div><span className="pill blue">{up} / {sectorData.length}개 산업 상승</span></div>
 <div className="market-legend"><span><i className="heat-strong"/> 강한 상승 +1% 이상</span><span><i className="heat-up"/> 상승 0~+1%</span><span><i className="heat-flat"/> 보합</span><span><i className="heat-down"/> 하락 0~-1%</span><span><i className="heat-weak"/> 강한 하락 -1% 이하</span></div>
 <div className="market-heatmap">{sectorData.map(g=><button key={g.name} className={'heat-card tone-'+tone(g.avg)} onClick={()=>setExpanded(expanded===g.name?null:g.name)}><span>{g.name}</span><strong>{pct(g.avg)}</strong><small>5일 {pct(g.avg5d)} · {g.ticker} · {g.coverage}/{g.symbols.length}</small><em>{g.avg==null?'데이터 미확보':g.avg>=1?'강한 강세':g.avg>0?'강세':g.avg<=-1?'강한 약세':g.avg<0?'약세':'보합'}</em></button>)}</div>
 {expanded&&(()=>{const g=sectorData.find(x=>x.name===expanded);if(!g)return null;return <div className="market-detail"><div className="market-detail-head"><b>{g.name} 대표 종목</b><span>ETF {g.ticker} {g.etf?pct(g.etf.change):'—'}</span></div><div className="market-stock-list">{g.symbols.map(s=>{const q=quotes[s];return <div key={s}><b>{s}</b><span>{q?fmt(q.price):'—'}</span><strong className={'market-pct tone-'+tone(q?.change)}>{q?pct(q.change):'미확보'}</strong></div>})}</div><small>{g.desc} · 카드를 다시 누르면 접힙니다.</small></div>})()}
 </section>
 <section className="panel market-panel"><div className="panel-head"><div><h3>미국 빅테크 · AI 핵심 종목</h3><p>시가총액 상위 기술기업과 AI 인프라 대표 종목</p></div><span className="pill">USD · 전일 대비</span></div><div className="market-stock-grid">{['NVDA','MSFT','GOOGL','AMZN','META','AAPL','AVGO','TSLA'].map(s=>{const q=quotes[s];return <div className={'market-stock-card tone-'+tone(q?.change)} key={s}><b>{s}</b><span>{q?fmt(q.price):'—'}</span><strong>{q?pct(q.change):'미확보'}</strong></div>})}</div></section>
 <section className="panel market-panel"><div className="panel-head"><div><h3>미국 국채 금리</h3><p>미 재무부·연준 공개 통계 · 최신 발표 관측치</p></div><a className="market-source" href="https://fred.stlouisfed.org/series/DGS10" target="_blank" rel="noreferrer">FRED 원문 <ExternalLink size={12}/></a></div><div className="market-yield-grid">{[['DGS2','2년물'],['DGS10','10년물'],['DGS30','30년물']].map(([k,n])=><div key={k}><span>{n}</span><strong>{yields[k]?yields[k].value.toFixed(2)+'%':'—'}</strong><small>{yields[k]?.date||'최신 관측치 확인 중'}</small></div>)}</div><div className="market-spread"><span>10년-2년 장단기 금리차</span><b>{yields.DGS10&&yields.DGS2?(yields.DGS10.value-yields.DGS2.value>0?'+':'')+(yields.DGS10.value-yields.DGS2.value).toFixed(2)+'%p':'—'}</b></div></section>
 <section className="panel market-panel"><div className="panel-head"><div><h3>시장 해석 · 상대강도</h3><p>시장 전체 대비 산업별 당일 성과 차이</p></div></div><div className="market-readthrough"><div><span>S&P 500</span><b className={'tone-'+tone(benchmark)}>{pct(benchmark)}</b></div><div><span>상승 산업</span><b>{up} / {sectorData.length}</b></div><div><span>최강 산업</span><b>{sectorData[0]?.name||'—'}</b><small>{pct(sectorData[0]?.avg)}</small></div><div><span>최약 산업</span><b>{sectorData[sectorData.length-1]?.name||'—'}</b><small>{pct(sectorData[sectorData.length-1]?.avg)}</small></div></div>
 <div className="table-wrap"><table className="market-rank-table"><thead><tr><th>산업</th><th>1일</th><th>5일</th><th>S&P 대비</th><th>상태</th></tr></thead><tbody>{sectorData.map(g=><tr key={g.name}><td>{g.name}</td><td className={'tone-'+tone(g.avg)}>{pct(g.avg)}</td><td className={'tone-'+tone(g.avg5d)}>{pct(g.avg5d)}</td><td className={'tone-'+tone(g.avg!=null&&benchmark!=null?g.avg-benchmark:null)}>{g.avg!=null&&benchmark!=null?pct(g.avg-benchmark):'—'}</td><td><span className={'market-status tone-'+tone(g.avg)}>{g.avg==null?'미확보':g.avg>=1?'강세 ↑':g.avg<=-1?'약세 ↓':g.avg>0?'상승':g.avg<0?'하락':'중립'}</span></td></tr>)}</tbody></table></div></section>
 <div className="market-footnote"><b>데이터·해석 기준</b><p>주가: Yahoo Finance 공개 차트 데이터(전일 종가 대비). 산업별 평균: 표시된 대표 종목들의 단순 평균이며 공식 업종지수와 다릅니다. 산업별 ETF는 참고용입니다. 국채 금리: FRED DGS2·DGS10·DGS30 최신 관측치로, 주가와 발표 시점이 다를 수 있습니다. 5거래일 수익률은 각 종목의 최근 5개 거래일 데이터가 충분할 때만 표시합니다. 투자 추천이 아닌 시장 모니터링 자료입니다.</p><div className="market-source-links"><a href="https://finance.yahoo.com/" target="_blank" rel="noreferrer">Yahoo Finance <ExternalLink size={11}/></a><a href="https://fred.stlouisfed.org/" target="_blank" rel="noreferrer">FRED <ExternalLink size={11}/></a><a href="https://home.treasury.gov/resource-center/data-chart-center/interest-rates" target="_blank" rel="noreferrer">U.S. Treasury <ExternalLink size={11}/></a></div></div>
 </>;
}

function App(){
 const [active,setActive]=useState<Section>(()=>{const tab=new URLSearchParams(window.location.search).get('tab');return menu.some(m=>m.id===tab)?tab as Section:'overview'});
 const [period,setPeriod]=useState<Period>('3Y');
 const [mobileOpen,setMobileOpen]=useState(false);
 const current=menu.find(m=>m.id===active)!;
 const render=()=>{switch(active){
  case'overview':return <Overview period={period} setPeriod={setPeriod}/>;
  case'pricing':return <Pricing/>;
  case'demand':return <Demand/>;
  case'capex':return <Capex/>;
    case'companies':return <Companies/>;
  case'cycles':return <Cycles/>;
  case'insights':return <Insights/>;
  case'market':return <Market/>;
 }};
 return <div className="app-shell">
  <aside className={'sidebar '+(mobileOpen?'open':'')}>
   <div className="brand"><div className="brand-mark">SI<span>.</span></div><div><b>SEMICONDUCTOR</b><small>INTELLIGENCE</small></div><button className="mobile-close" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
   
   <div className="nav-label">대시보드 메뉴</div>
   <nav>{menu.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(active===item.id?'selected':'')} onClick={()=>{setActive(item.id);setMobileOpen(false);}}><Icon size={17}/><span><b>{item.label}</b><small>{item.sub}</small></span><em>{item.no}</em></button>})}</nav>
   <div className="sidebar-bottom"><div className="source-status"><ShieldCheck size={16}/><div><b>출처 원문 기준</b><small>기업 공시·정부·협회 원문 기준</small></div></div><div className="version">반도체 산업 분석 <span>v1.1</span></div></div>
  </aside>
  {mobileOpen&&<div className="scrim" onClick={()=>setMobileOpen(false)}/>}
  <main className="main">
   <header className="topbar"><div className="top-left"><button className="menu-button" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><span>대시보드 / <b>{current.label}</b></span></div><div className="top-actions"><div className="date-label"><CalendarDays size={15}/> 데이터 기준 · 2026.11.23 · USD/KRW 1,345원</div><button className="share-button" onClick={()=>navigator.clipboard?.writeText(window.location.href)}><ExternalLink size={15}/> 링크 공유</button></div></header>
   <div className="content">{render()}<footer><div><b>SI · Semiconductor Intelligence</b><span>공개자료 기반 반도체 산업 분석 대시보드</span></div><span>실적 / 추정 / 전망 / 미확보 · v1.1</span></footer></div>
  </main>
 </div>;
}
export default App;