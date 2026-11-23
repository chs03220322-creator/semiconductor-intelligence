import { useMemo, useState } from 'react';
import {
  Activity, BarChart3, CalendarDays, ChevronRight, ExternalLink,
  Factory, Gauge, Layers3, Menu, Search, Server, ShieldCheck,
  TrendingUp, Wallet, X, Info
} from 'lucide-react';

type Section = 'overview'|'pricing'|'demand'|'capex'|'supply'|'companies'|'cycles'|'insights'|'method';
type Period = '3Y'|'5Y'|'10Y'|'MAX';

const menu:{id:Section;no:string;label:string;sub:string;icon:any}[]=[
  {id:'overview',no:'01',label:'산업 사이클',sub:'시장 흐름과 업황 점수',icon:Activity},
  {id:'pricing',no:'02',label:'제품별 가격',sub:'DRAM·NAND·DDR 가격',icon:Layers3},
  {id:'demand',no:'03',label:'AI 수요 & 데이터센터',sub:'AI 투자와 전력 수요',icon:Server},
  {id:'capex',no:'04',label:'빅테크 투자',sub:'주요 기업 설비투자',icon:Wallet},
  {id:'supply',no:'05',label:'공급 & 재고',sub:'생산능력과 재고',icon:Factory},
  {id:'companies',no:'06',label:'기업 실적',sub:'반도체 주요 기업',icon:BarChart3},
  {id:'cycles',no:'07',label:'장기 사이클',sub:'과거 흐름과 전망',icon:TrendingUp},
  {id:'insights',no:'08',label:'투자 시나리오',sub:'업황별 투자 관점',icon:Gauge},
  {id:'method',no:'09',label:'데이터 출처 & 방법론',sub:'무료 공개자료와 산식',icon:ShieldCheck},
];

const sources=[
  {name:'SIA · 2026년 3분기 글로벌 반도체 매출',date:'2026-11-03',url:'https://www.semiconductors.org/global-semiconductor-sales-increase-24-1-from-q2-2026-to-q3-2026/',desc:'3Q26 $517.7B, 9월 3개월 이동평균 $172.6B'},
  {name:'SIA · 2026년 1분기 글로벌 반도체 매출',date:'2026-05-04',url:'https://www.semiconductors.org/global-semiconductor-sales-increase-25-from-q4-2025-to-q1-2026/',desc:'1Q26 $298.5B'},
  {name:'SIA · 2026년 2분기 글로벌 반도체 매출',date:'2026-08-06',url:'https://www.semiconductors.org/global-semiconductor-sales-increase-35-1-from-q1-2026-to-q2-2026/',desc:'2Q26 $403.3B'},
  {name:'SIA · 2025년 연간 글로벌 반도체 매출',date:'2026-02-06',url:'https://www.semiconductors.org/global-annual-semiconductor-sales-increase-25-6-to-791-7-billion-in-2025/',desc:'2020~2025 연간 매출 시계열 기준'},
  {name:'Gartner · 2026년 반도체 시장 공개 전망',date:'2026-08-24',url:'https://www.gartner.com/en/newsroom/press-releases/2026-08-24-gartner-forecasts-worldwide-semiconductor-revenue-to-reach-1-trillion-dollars-in-2026',desc:'2025 estimate, 2026~2027 forecast; 무료 보도자료 수치만 사용'},
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
const iea=[{year:'2024',value:415,status:'Actual'},{year:'2025',value:485,status:'Estimate'},{year:'2030',value:950,status:'Forecast'}];
const capexAnnual=[
  {company:'Microsoft',period:'FY',values:[{year:'FY2024',value:44.477},{year:'FY2025',value:64.551},{year:'FY2026',value:115.948}],definition:'Additions to property and equipment'},
  {company:'Alphabet',period:'CY',values:[{year:'2024',value:52.5},{year:'2025',value:91.4}],definition:'PPE purchases; 2026 YTD 별도'},
  {company:'Amazon',period:'CY',values:[{year:'2024',value:77.658},{year:'2025',value:128.320}],definition:'Gross PPE purchases; 2026 YTD 별도'},
  {company:'Meta',period:'CY',values:[{year:'2024',value:37.256},{year:'2025',value:69.691}],definition:'PPE purchases; finance lease principal excluded in annual cash flow series'}
];
const capexCurrent=[
  {company:'Amazon',period:'3Q26',quarter:'$77.259B',ytd:'$175.670B',definition:'Gross PPE purchases; 2026 1~3Q 누계'},
  {company:'Alphabet',period:'3Q26',quarter:'$51.4B',ytd:'$132.0B',definition:'PPE purchases; 2026 1~3Q 누계'},
  {company:'Microsoft',period:'FY27 Q1',quarter:'$45.2B',ytd:'$45.2B',definition:'CAPEX; cash PPE $39.4B, finance leases $7.4B 포함'},
  {company:'Meta',period:'3Q26',quarter:'$34.91B',ytd:'$85.82B',definition:'CAPEX; finance lease principal 포함, 2026 1~3Q 누계'}
];
const supplierCapex=[
  {company:'Samsung Electronics',period:'3Q26',quarter:'₩29.0T',ytd:'₩56.9T',definition:'전사 CAPEX; DS 3Q ₩27.2T, 1~3Q ₩52.8T'},
  {company:'Micron',period:'FY2026 Q4',quarter:'$10.77B',ytd:'$27.37B',definition:'Net CAPEX; FY2026 누계'}
];
const FX_USDKRW=1345; // 2026-11-23 spot mid-market reference
const usdBnToKrwT=(v:number)=>v*FX_USDKRW/1000;
const wonT=(v:number)=>'₩'+v.toFixed(1)+'조';
const earningsForecast=[
 {company:'삼성전자',period:'2026 4Q',revenue:'200~215조',op:'105~125조',status:'모델 추정'},
 {company:'삼성전자',period:'2027',revenue:'900~1,000조',op:'470~560조',status:'시나리오 전망'},
 {company:'삼성전자',period:'2028',revenue:'900~1,050조',op:'420~560조',status:'시나리오 전망'},
 {company:'SK하이닉스',period:'2026 4Q',revenue:'115~125조',op:'90~102조',status:'모델 추정'},
 {company:'SK하이닉스',period:'2027',revenue:'480~550조',op:'330~420조',status:'시나리오 전망'},
 {company:'SK하이닉스',period:'2028',revenue:'500~590조',op:'300~420조',status:'시나리오 전망'},
 {company:'마이크론',period:'FY2027 Q1',revenue:'80.7~84.8조',op:'66~70조',status:'회사 가이던스 기반 계산'},
 {company:'마이크론',period:'FY2027',revenue:'363~404조',op:'256~303조',status:'시나리오 전망'},
 {company:'마이크론',period:'FY2028',revenue:'377~444조',op:'229~303조',status:'시나리오 전망'}
];
const memorySignals=[
  {id:'server',name:'Server DDR5',baseWeight:25,score:93,direction:'상승 · 강한 수요',basis:'SK hynix 3Q26는 server DDR5 판매가 크게 늘었다고 공시했고, 삼성은 서버 수요가 전 응용처 가격을 끌어올렸다고 설명. 정부 공개 범용 DRAM 16Gb 기준가격은 Jun $40.0 → Sep $48.0, DRAM 8Gb는 Jul $24.0 → Oct $27.5(+5.8% MoM). 이 가격은 서버 전용 ASP가 아닌 범용 proxy.'},
  {id:'pc',name:'PC DDR5',baseWeight:10,score:null,direction:'정량 미확보',basis:'PC 전용 DDR5 계약 ASP·출하량의 무료 공개 시계열 미확보. 범용 DRAM 기준가격을 PC DDR5 가격으로 대체하지 않음.'},
  {id:'ddr4',name:'DDR4',baseWeight:5,score:null,direction:'정량 미확보',basis:'DDR4 전용 무료 고정거래가격·계약 ASP 시계열 미확보. DRAM 8Gb/16Gb 범용 지표를 DDR4 가격으로 간주하지 않음.'},
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
function krwText(value:any){if(typeof value!=='string')return value;return value.replace(/\$([\d,]+(?:\.\d+)?)(\s*(?:B|bn|billion))?/gi,(_m,n,suffix)=>{const v=Number(n.replace(/,/g,''));return suffix?'₩'+(v*FX_USDKRW/1000).toFixed(1)+'조':'₩'+Math.round(v*FX_USDKRW).toLocaleString('ko-KR')+'원'}).replace(/USD\s*\/\s*chip/gi,'원/칩').replace(/USD\s*bn/gi,'조 원').replace(/USD/gi,'KRW')}
function visibleUnit(value:string){return value.replace(/USD\s*\/\s*chip/gi,'원/칩').replace(/USD\s*bn/gi,'조 원').replace(/USD/gi,'KRW')}
function Stat({label,value,sub}:{label:string;value:string;sub:string}){return <div className="stat"><span>{krwText(label)}</span><strong>{krwText(value)}</strong><small>{krwText(sub)}</small></div>}
function Table({headers,rows}:{headers:string[];rows:(string|number|null)[][]}){return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{visibleUnit(h)}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c===null?'미확보':krwText(c)}</td>)}</tr>)}</tbody></table></div>}
function LineChart({data,keyName,label,height=220}:{data:any[];keyName:string;label:string;height?:number}){
 const [selected,setSelected]=useState<number|null>(null);
 const isUsd=/USD/i.test(label);const perChip=/chip/i.test(label);const factor=isUsd?(perChip?FX_USDKRW:FX_USDKRW/1000):1;const vals=data.map(d=>Number(d[keyName])*factor);const min=Math.min(...vals),max=Math.max(...vals),range=max-min||1;const visibleLabel=visibleUnit(label);
 const points=vals.map((v,i)=>[i/(Math.max(1,vals.length-1))*100,88-(v-min)/range*72]);
 const path=points.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(' ');
 const chosen=selected===null?null:data[selected];
 const fmt=(v:number)=>perChip?'₩'+Math.round(v).toLocaleString('ko-KR'):isUsd?'₩'+v.toFixed(1)+'조':Number.isInteger(v)?v.toLocaleString():v.toLocaleString(undefined,{maximumFractionDigits:3});
 return <div className="line-chart" style={{height}}>
  <div className="chart-value-callout" aria-live="polite">{chosen?<><b>{chosen.year||chosen.period||chosen.month}</b><strong>{fmt(Number(chosen[keyName]))}</strong><span>{visibleLabel}</span></>:<span>그래프의 점을 누르면 해당 연도와 Y축 값이 표시됩니다</span>}</div>
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
function TrendPanel({title,series,quarterHeaders,quarterRows,note,source}:{title:string;series:{name:string;unit:string;data:{year:string;value:number}[]}[];quarterHeaders?:string[];quarterRows?:(string|number|null)[][];note?:string;source?:string[]}){
 return <div className="panel">
  <div className="panel-head"><div><h3>{title} · 연도별/기간별 추이</h3><p className="muted">실적·추정·전망을 구분하고 단위가 다른 지표는 별도로 표시합니다</p></div><Pill tone="blue">무료 공개자료</Pill></div>
  {series.map(s=><div key={s.name}><p className="muted"><b>{s.name}</b> · {visibleUnit(s.unit)}</p><LineChart data={s.data} keyName="value" label={s.name+' · '+s.unit} height={185}/></div>)}
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
 <Title eyebrow="02 / PRODUCT PRICING" title="무료 공개 메모리 가격 & 수급" desc="정부가 공개한 범용 DRAM·NAND 기준가격과 수출만 반영합니다. 이 수치는 Server DDR5·PC DDR5·DDR4·HBM의 개별 계약 ASP가 아닙니다. 공개되지 않은 제품별 가격은 추정하지 않습니다."/>
 <div className="stats-grid"><Stat label="DRAM 8Gb · Oct 2026" value="$27.5" sub="전월 대비 +5.8% · USD/chip"/><Stat label="NAND 128Gb · Oct 2026" value="$30.6" sub="전월 대비 0.0% · USD/chip"/></div>
 <TrendPanel title="2026년 정부 공개 메모리 고정가격" series={[{name:'DRAM 16Gb 공개 기준가격',unit:'USD / chip',data:pricesDram16},{name:'DDR5 16Gb 고정가격 (별도 계열)',unit:'USD / chip',data:pricesDdr5_16},{name:'DRAM 8Gb 공개 기준가격',unit:'USD / chip',data:pricesDram8},{name:'NAND 128Gb 공개 기준가격',unit:'USD / chip',data:pricesNand}]} quarterHeaders={['월','DRAM 16Gb','DDR5 16Gb','DRAM 8Gb','NAND 128Gb','상태']} quarterRows={[
  ['Jun 26','$40.0','$40.0',null,'$28.8','Actual'],['Jul 26','$45.0','$45.0','$24.0','$30.1','Actual'],['Aug 26','$46.5','$46.5','$25.0','$30.5','Actual'],['Sep 26','$48.0','$48.0','$26.0','$30.6','Actual'],['Oct 26',null,'$50.0','$27.5','$30.6','Actual']
 ]} note="DRAM 16Gb 범용 기준가격과 DDR5 16Gb 고정가격은 서로 다른 공개 계열이므로 분리했습니다. DDR5 16Gb는 10월 $50.0까지 공개되어 있습니다. 어느 series도 Server DDR5 RDIMM·PC DDR5 모듈 ASP와 동일하지 않습니다." source={['산업부 · 2026년 9월 ICT 수출입 동향','산업부 · 2026년 10월 ICT 수출입 동향','산업부 · 2026년 10월 수출입 동향']}/>
 <div className="panel"><h3>2025년 공개 DRAM 8Gb·NAND 128Gb 기준가격</h3><p className="muted">2025년 7~10월 관측치 · USD/chip · 2026년 series와 연도·시장 환경을 구분</p><LineChart data={prices2025Dram8} keyName="value" label="DRAM 8Gb reference · USD/chip" height={180}/><LineChart data={prices2025Nand} keyName="value" label="NAND 128Gb reference · USD/chip" height={180}/><Table headers={['월','DRAM 8Gb','NAND 128Gb','상태']} rows={prices2025Dram8.map((x,i)=>[x.year,'$'+x.value.toFixed(1),'$'+prices2025Nand[i].value.toFixed(1),'공식 월간 보고서'])}/><Sources items={['산업부 · 2025년 10월 ICT 수출입 동향']}/></div>
 <TrendPanel title="메모리 시장 규모 대리지표" series={[{name:'Memory semiconductor revenue',unit:'USD bn · 시장규모, ASP 아님',data:memoryForecast}]} quarterHeaders={['연도','메모리 시장 규모','상태','출처 기준']} quarterRows={memoryForecast.map(x=>[x.year,'$'+x.value.toFixed(1)+'B',x.status,'Gartner Aug 2026 public release'])} note="메모리 시장규모는 연간 매출 estimate/forecast이며 제품 단가·ASP가 아닙니다. 2025 estimate, 2026~2027 forecast를 actual과 분리했습니다." source={['Gartner · 2026년 반도체 시장 공개 전망']}/>
 <div className="panel"><h3>제품별 무료 데이터 범위</h3><Table headers={['제품군','무료로 확인 가능한 항목','미확보 항목']} rows={[
  ['Server DDR5','기업 IR의 서버 DDR5 수요·제품 믹스 코멘트, 범용 DRAM 8Gb·16Gb 기준가격','Server RDIMM 계약 ASP·제품별 출하 bit'],['PC DDR5','글로벌 시장·기업 실적의 간접 신호','PC 전용 DDR5 계약 ASP·출하량'],['DDR4','기업 코멘트 및 범용 DRAM 시장 지표 일부','DDR4 단독 고정가격·계약 ASP'],['HBM','삼성·SK hynix의 HBM4 출하·사업 코멘트','고객별 HBM3E/HBM4 계약가격·ASP'],['NAND','NAND 128Gb 기준가격·SSD 수출','Enterprise SSD 제품별 계약 ASP'],['삼성·SK ASP','분기 매출·이익 및 가격 방향 코멘트','회사별·제품별 ASP 증감률']
 ]}/></div>
 </>}
function Demand(){return <>
 <Title eyebrow="03 / COMPUTE DEMAND" title="AI 수요 & 데이터센터" desc="IEA의 공개 전망과 NVIDIA·TSMC의 연간·분기 공식 실적으로 AI 인프라 수요를 추적합니다. 연간 actual·estimate·forecast와 기업별 회계연도를 분리합니다."/>
 <div className="stats-grid"><Stat label="2025 데이터센터 전력" value="485 TWh" sub="IEA estimate · 2026 report"/><Stat label="2030 전력 전망" value="950 TWh" sub="IEA forecast · 2026 report"/><Stat label="NVIDIA 3Q FY2027 매출" value="$115.8B" sub="YoY +103% · Nov 17 release"/><Stat label="NVIDIA 데이터센터 매출" value="$107.6B" sub="3Q FY2027 · YoY +110%"/></div>
 <TrendPanel title="데이터센터 전력 및 AI 공급망 매출 추이" series={[{name:'IEA data centre electricity',unit:'TWh / year · 2024 actual, 2025 estimate, 2030 forecast',data:iea},{name:'TSMC annual revenue · CY',unit:'USD bn · annual actual',data:tsmcAnnual},{name:'NVIDIA annual revenue · FY',unit:'USD bn · annual actual',data:nvidiaAnnual}]} quarterHeaders={['기간','기업·지표','값','상태']} quarterRows={[
  ['2024','전 세계 데이터센터 전력','415 TWh','Actual'],['2025','전 세계 데이터센터 전력','485 TWh','Estimate'],['2030','전 세계 데이터센터 전력','950 TWh','Forecast'],
  ['1Q26','TSMC 매출','$35.9B','Actual · CY'],['2Q26','TSMC 매출','$44.6B','Actual · CY'],['3Q26','TSMC 매출','$46.72B','Actual · CY'],
  ['1Q FY27','NVIDIA 매출 / Data Center','$81.615B / $75.2B','Actual · FY'],['2Q FY27','NVIDIA 매출 / Data Center','$96.221B / $89.0B','Actual · FY'],['3Q FY27','NVIDIA 매출 / Data Center','$115.8B / $107.6B','Actual · FY']
 ]} note="IEA 2026 report 기준: 2025년 데이터센터 전력 485 TWh는 estimate, 2030년 950 TWh는 forecast입니다. 2024년 415 TWh actual은 IEA 2025 Energy and AI report 기준입니다. TSMC는 달력연도(CY), NVIDIA는 1월 말 종료 회계연도(FY)이며 매출은 전력수요와 합산하지 않는 별도 series입니다. IEA는 HBM 공급 부족이 적어도 2027년 말까지 이어질 수 있다고 평가했습니다." source={['IEA · Energy and AI','IEA · Key Questions on Energy and AI','TSMC · 3Q26 실적','TSMC · 2025 Annual Report','NVIDIA · 1Q FY2027 results','NVIDIA · 2Q FY2027 results','NVIDIA · 3Q FY2027 실적']}/>
 <div className="panel"><h3>AI 수요 → 메모리 수요 전달 경로</h3><div className="bridge">{[['AI 학습·추론량','모델·agent·영상·reasoning 사용량 증가'],['GPU·ASIC 설치','가속기·서버·네트워크 출하'],['메모리 탑재량','HBM·DDR5·CXL·eSSD 구성'],['bit 수요·매출','가격·공급·제품 믹스']].map((x,i)=><div className="bridge-item" key={i}><span>0{i+1}</span><b>{x[0]}</b><small>{x[1]}</small>{i<3&&<ChevronRight/>}</div>)}</div><Notice>IEA는 단순 텍스트 질의의 단위 전력 효율이 개선되는 동시에 video generation·reasoning·agentic workloads 같은 고전력 AI 사용 사례가 확대되고 있다고 지적합니다. 데이터센터 전력 수요를 AI token 수요와 동일시하지 않습니다.</Notice></div>
 </>}
function Capex(){return <>
 <Title eyebrow="04 / HYPERSCALER INVESTMENT" title="빅테크 CAPEX" desc="연간 actual과 2026년 분기 actual·YTD를 구분합니다. FY/CY, PPE 구매·PPE additions·finance lease 포함 여부가 달라 회사 간 CAPEX를 단순 합산하지 않습니다."/>
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
 <TrendPanel title="연도별 CAPEX 추이" series={capexAnnual.map(x=>({name:x.company+' ('+x.period+')',unit:'USD bn',data:x.values}))} quarterHeaders={['기업','최근 분기','분기 CAPEX','2026 YTD','정의']} quarterRows={capexCurrent.map(x=>[x.company,x.period,x.quarter,x.ytd,x.definition])} note="Microsoft FY26 연간 actual은 6월 종료 회계연도. Alphabet·Amazon·Meta의 2026 YTD는 9월 종료 9개월 누계. Amazon은 gross PPE purchases, Meta는 finance lease principal 포함 CAPEX로 정의가 다릅니다." source={['Microsoft · FY2027 Q1 실적발표 콜','Alphabet · 3Q26 실적발표 콜','Amazon · 3Q26 실적','Meta · 3Q26 SEC 10-Q']}/>
 <div className="panel"><h3>반도체 공급업체 투자 참고</h3><Table headers={['기업','기간','분기 CAPEX','누계','정의']} rows={supplierCapex.map(x=>[x.company,x.period,x.quarter,x.ytd,x.definition])}/><Sources items={['Samsung Electronics · 3Q26 실적','Micron · FY2026 Q4 및 연간 실적']}/></div>
 <div className="panel"><h3>CAPEX 해석 시 주의사항</h3><Table headers={['기업','기간·정의','비교 주의']} rows={[
  ['Microsoft','FY 종료 6월 · additions to PPE','FY 기준; FY27 Q1 CAPEX에는 finance leases 포함'],
  ['Alphabet','CY · PPE purchases','2026 9개월 누계 $132.0B, Q3 $51.4B'],
  ['Amazon','CY · gross PPE purchases','Q3 $77.259B, 9개월 $175.670B; net proceeds와 구분'],
  ['Meta','CY · CAPEX incl. finance lease principal','Q3 $34.91B, 9개월 $85.82B'],
  ['Samsung / Micron','공급업체 설비투자','하이퍼스케일러 CAPEX와 합산하지 않음']
 ]}/></div>
 </>}

function Supply(){return <>
 <Title eyebrow="05 / SUPPLY & INVENTORY" title="공급능력 & 재고" desc="메모리 공급사의 설비투자·증설 계획과 업체별 재고 공시를 확인합니다. 제품별 재고일수·DRAM/NAND bit supply가 동일 기준으로 공개되지 않으면 미확보로 둡니다."/>
 <div className="stats-grid"><Stat label="삼성전자 DS CAPEX · 1~3Q26" value="₩52.8T" sub="기업 공시 · 실제 누계"/><Stat label="Micron Net CAPEX · FY2026" value="$27.37B" sub="회계연도 actual"/><Stat label="공급사 재고일수" value="미확보" sub="동일 기준 무료 시계열 없음"/></div>
 <div className="panel"><h3>공급능력 확대 및 투자 신호</h3><Table headers={['기업','공개 투자·증설 신호','사이클 해석']} rows={[
  ['삼성전자','DS CAPEX 1~3Q26 ₩52.8T','선단·메모리 투자 지속 여부와 실제 bit 공급 전환 시차 확인'],
  ['SK하이닉스','용인 Y2·청주 M17 투자 계획; 2027~2028 생산능력 50% 이상 장기계약 확보','증설 발표와 양산·고객 인증·실제 출하 시점을 분리'],
  ['Micron','FY2026 Net CAPEX $27.37B','투자액보다 DRAM/HBM bit 공급 증가율과 제품 믹스가 중요']
 ]}/><Sources items={['Samsung Electronics · 3Q26 실적','Micron · FY2026 Q4 및 연간 실적','SK hynix · Yongin Y2 / Cheongju M17 투자']}/></div>
 <div className="panel"><h3>재고·공급 데이터 가용성</h3><Table headers={['지표','최신 공개 상태','앱 처리 원칙']} rows={[
  ['삼성·SK·Micron 총 재고','분기 재무제표 잔액은 공개','제품별 재고일수와 직접 비교하지 않음'],
  ['DRAM/NAND supplier inventory days','미확보','점수에서 제외'],
  ['CSP/OEM memory inventory','동일 기준 미확보','중립점·0점으로 대체하지 않음'],
  ['DRAM/NAND bit supply','동일 기준 미확보','업체별 웨이퍼 투입량으로 추정하지 않음'],
  ['전체 wafer shipments','2026 Q3 actual 3,756 MSI','메모리 전용 공급량이 아닌 산업 proxy']
 ]}/><Notice>재고 항목은 업황 판단에 중요하지만, 제품별·업체별·고객별 기준이 다른 재고 잔액을 섞으면 왜곡됩니다. 동일 기준 inventory days가 공개되기 전까지 점수화하지 않습니다.</Notice></div>
 </>}

type MemoryFinancialPoint={year:string;revenue:number;op:number;periodLabel?:string;revenueLow?:number;revenueHigh?:number;opLow?:number;opHigh?:number};
type MemoryFinancialSeries={name:string;data:MemoryFinancialPoint[];color:string;currency:'KRW'|'USD'};
function MemoryComparePanel({title,subtitle,series,forecast=false}:{title:string;subtitle:string;series:MemoryFinancialSeries[];forecast?:boolean}){
 const [metric,setMetric]=useState<'revenue'|'op'>('revenue');
 const [selected,setSelected]=useState<{company:string;index:number}|null>(null);
 const maxZoom=series[0].data.length;
 const [zoom,setZoom]=useState(Math.min(maxZoom,forecast?6:11));
 const shown=series.map(s=>({...s,data:s.data.slice(-zoom),offset:s.data.length-Math.min(zoom,s.data.length)}));
 const values=shown.flatMap(s=>s.data.map(d=>(metric==='revenue'?d.revenue:d.op)*(s.currency==='USD'?FX_USDKRW/1000:1)));
 const min=Math.min(0,...values),max=Math.max(...values),range=max-min||1;
 const chartWidth=Math.max(730,110+(zoom-1)*66);
 const x=(i:number)=>58+i*((chartWidth-105)/Math.max(1,zoom-1));
 const y=(v:number)=>218-(v-min)/range*178;
 const selectedSeries=selected?shown.find(s=>s.name===selected.company):null;
 const selectedPoint=selectedSeries&&selected?selectedSeries.data[selected.index]:null;
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
    {shown.map(s=>{const vals=s.data.map(d=>(metric==='revenue'?d.revenue:d.op)*(s.currency==='USD'?FX_USDKRW/1000:1));const lows=s.data.map(d=>(metric==='revenue'?d.revenueLow:d.opLow));const highs=s.data.map(d=>(metric==='revenue'?d.revenueHigh:d.opHigh));const bandIdx=s.data.map((d,i)=>({i,lo:lows[i],hi:highs[i]})).filter(v=>v.lo!==undefined&&v.hi!==undefined);const bandPath=bandIdx.length>1?[...bandIdx.map(v=>x(v.i)+','+y((v.hi as number)*(s.currency==='USD'?FX_USDKRW/1000:1))),...bandIdx.slice().reverse().map(v=>x(v.i)+','+y((v.lo as number)*(s.currency==='USD'?FX_USDKRW/1000:1)))].join(' '):'';const path=vals.map((v,i)=>(i?'L':'M')+x(i)+','+y(v)).join(' ');return <g key={s.name}>{bandPath&&<polygon points={bandPath} fill={s.color} opacity=".16" stroke="none"><title>{s.name} 증권사 추정 범위</title></polygon>}<path d={path} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round"/>{vals.map((v,i)=><g key={i} onClick={()=>setSelected({company:s.name,index:i})} style={{cursor:'pointer'}}><circle cx={x(i)} cy={y(v)} r={selected?.company===s.name&&selected.index===i?7:4.5} fill={s.color} stroke="white" strokeWidth="1.5"/><circle cx={x(i)} cy={y(v)} r="11" fill="transparent"/><title>{s.name} {label(s.data[i])}: {format(metric==='revenue'?s.data[i].revenue:s.data[i].op,s.currency)}{lows[i]!==undefined&&highs[i]!==undefined?' · 범위 '+format(lows[i] as number,s.currency)+'~'+format(highs[i] as number,s.currency):''}</title></g>)}</g>})}
    {Array.from({length:zoom},(_,i)=><text key={i} x={x(i)} y="245" textAnchor="middle" fontSize="10" fill="currentColor">{label(shown[0].data[i])}</text>)}
   </svg>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,margin:'8px 0 4px'}}>
   {series.map(s=>{const latest=s.data[s.data.length-1];const value=metric==='revenue'?latest.revenue:latest.op;return <div key={s.name} style={{background:'#14212c',border:'1px solid #304454',borderRadius:7,padding:'9px 10px',minWidth:0}}><div style={{fontSize:10,color:s.color,fontWeight:700}}>{s.name} · {label(latest)}</div><div style={{fontSize:17,fontWeight:750,color:'#eef4f8',marginTop:3,whiteSpace:'nowrap'}}>{format(value,s.currency)}</div><div style={{fontSize:10,color:'#91a2b1',marginTop:2}}>{forecast?'기준 시나리오 전망':metric==='revenue'?'최근 누계 매출':'최근 누계 영업이익'}</div></div>})}
  </div>
  <div className="chart-unit">단위: 조 원 · Micron은 USD 공시/모델 수치를 USD/KRW {FX_USDKRW.toLocaleString()}원으로 환산했습니다.</div>
  {selectedPoint&&selectedSeries&&selected&&<div className="selected-point"><b>{selectedSeries.name} · {label(selectedPoint)}</b><div>매출 {format(selectedPoint.revenue,selectedSeries.currency)} · 영업이익 {format(selectedPoint.op,selectedSeries.currency)}</div><small>영업이익률 {(selectedPoint.op/selectedPoint.revenue*100).toFixed(1)}% · {forecast?'모델 추정치':selectedSeries.name==='Micron'?'US GAAP':'K-IFRS 연결'} · {forecast?'실제 실적·기업 가이던스가 아닌 기준 시나리오':''}</small></div>}
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
 const mid=(a:number,b:number)=>(a+b)/2;
 const extend=(rows:MemoryFinancialPoint[],currency:'KRW'|'USD',color:string)=>{
  let rev=rows[rows.length-1].revenue,op=rows[rows.length-1].op;
  const out=[...rows];
  const growth=[.06,.05,.04],margin=[.48,.45,.42];
  growth.forEach((g,i)=>{rev*=1+g;op=rev*margin[i];out.push({year:String(2029+i)+'E',periodLabel:String(2029+i)+'E · 장기 시나리오(범위 미공개)',revenue:rev,op})});
  return {name:'',data:out,color,currency};
 };
 const samsung:MemoryFinancialPoint[]=[
  {year:'2026E*',periodLabel:'2026E* · 최신 YTD 연환산',revenue:annualized(samsungQuarterly).revenue,op:annualized(samsungQuarterly).op},
  {year:'2027E',revenue:mid(928.268,1193.508),op:mid(532.028,624),revenueLow:928.268,revenueHigh:1193.508,opLow:532.028,opHigh:624},
  {year:'2028E',revenue:mid(1019.684,1144.46),op:mid(590.302,623.391),revenueLow:1019.684,revenueHigh:1144.46,opLow:590.302,opHigh:623.391}
 ];
 const sk:MemoryFinancialPoint[]=[
  {year:'2026E*',periodLabel:'2026E* · 최신 YTD 연환산',revenue:annualized(skQuarterly).revenue,op:annualized(skQuarterly).op},
  {year:'2027E',revenue:mid(568,614.979),op:mid(396,489.261),revenueLow:568,revenueHigh:614.979,opLow:396,opHigh:489.261},
  {year:'2028E',revenue:648.249,op:502.177}
 ];
 const mu:MemoryFinancialPoint[]=[
  {year:'FY2026',periodLabel:'FY2026 · actual',revenue:micronAnnual[micronAnnual.length-1].revenue,op:micronAnnual[micronAnnual.length-1].op},
  {year:'FY2027E',revenue:276,op:0,revenueLow:212.4,revenueHigh:314},
  {year:'FY2028E',revenue:320.83,op:0,revenueLow:224.16,revenueHigh:396.62}
 ];
 const series:MemoryFinancialSeries[]=[
  extend(samsung,'KRW','#2563eb'),
  extend(sk,'KRW','#0f9f6e'),
  extend(mu,'USD','#d97706')
 ];
 series[0].name='삼성전자';series[1].name='SK하이닉스';series[2].name='Micron';
 return <><MemoryComparePanel title="메모리 3사 향후 5년 실적 전망 · 증권사 범위" subtitle="증권사·시장 추정치의 최소~최대 음영 · 매출/영업이익 전환 · X축 줌 · 2029~31은 장기 시나리오(추정 범위 미공개)" series={series} forecast/><div className="chart-hint">음영은 공개된 증권사 또는 시장 컨센서스의 최저~최고 추정 범위입니다. 음영이 없는 연도는 비교 가능한 공개 범위 자료가 확인되지 않은 구간이며, 선은 장기 시나리오입니다. Micron의 영업이익 추정 범위는 동일 기준으로 확인되지 않아 음영을 표시하지 않습니다.</div></>;
}
function Companies(){return <>
 <Title eyebrow="06 / COMPANY FINANCIALS" title="주요 반도체 기업 실적" desc="메모리 3사의 2016~2025 연간 실적에 각 사의 최신 공시 분기까지 누적한 실적을 추가해 비교합니다. 매출·영업이익 전환 및 타점별 수치 확인이 가능합니다."/>
 <MemoryThreeChart/>
 <MemoryThreeForecastChart/>
 <div className="panel"><h3>향후 5년 전망 산정 기준</h3><Table headers={['기업','2026E 기준값','매출 성장률 가정(2027~31)','영업이익률 가정(2027→31)']} rows={[
  ['삼성전자','2026년 1Q~3Q 누계 × 4/3','+10% → +5%로 단계 둔화','55% → 40%'],
  ['SK하이닉스','2026년 1Q~3Q 누계 × 4/3','+15% → +5%로 단계 둔화','60% → 42%'],
  ['Micron','FY2026 FQ1~FQ4 연간 actual','+15% → +5%로 단계 둔화','55% → 40%']
]}/>
 <Notice>이 그래프는 회사 공식 가이던스나 증권사 컨센서스가 아니라, 최신 실적을 출발점으로 성장률·영업이익률 가정을 적용한 자체 기준 시나리오입니다. 2026E 삼성전자·SK하이닉스 값은 9개월 실적 단순 연환산이므로 계절성·분기 변동을 반영하지 않습니다. Micron은 FY2026 실제 연간값을 사용하며 회계연도 차이가 있습니다. 실제 투자 판단 전 각 분기 실적과 가정을 다시 검증해야 합니다.</Notice></div>
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
 <TrendPanel title="메모리 반도체 시장 매출 전망" series={[{name:'Memory market revenue',unit:'USD bn · estimate/forecast',data:memoryForecast}]} quarterHeaders={['연도','시장 규모','상태']} quarterRows={memoryForecast.map(x=>[x.year,'$'+x.value.toFixed(1)+'B',x.status])} note="연간 시장 규모는 ASP가 아니라 시장 매출 추정·전망치입니다. 2026년 분기 메모리 시장 매출 actual은 동일한 무료 시계열로 확보되지 않아 미확보입니다." source={['Gartner · 2026년 반도체 시장 공개 전망']}/>
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

function Method(){return <>
 <Title eyebrow="09 / DATA GOVERNANCE" title="무료 데이터 출처 & 방법론" desc="유료 API·유료 구독·유료 데이터베이스·유료 리서치 링크는 사용하지 않습니다. 공개 원문, 발표일, 단위, 기간, 데이터 상태와 결측 한계를 누적합니다."/>
 <div className="stats-grid"><Stat label="공개 원문 레지스트리" value={sources.length.toString()} sub="정부·기업 IR·SEC·협회·IEA"/><Stat label="연도별 시장 actual" value="2020~2025" sub="SIA 글로벌 매출"/><Stat label="최신 기업 실적" value="2026 Q3" sub="발표 완료 분기까지"/><Stat label="유료 데이터 사용" value="0" sub="유료 전용 페이지·수치 제외"/></div>
 <div className="panel"><h3>페이지별 연도·분기·월별 커버리지</h3><Table headers={['페이지','연도별 추이','2026 최신 actual','미확보·한계']} rows={[
  ['산업 사이클','2020~2025 SIA actual, 2025 estimate·2026~27 forecast 별도','SIA Q1~Q3 분기 actual','SIA Q3 QoQ 비교기준 개정 여부 미확인'],

  ['제품별 가격','2025 DRAM 8Gb·NAND 128Gb 일부 월, 2026 DRAM 16Gb Jun~Sep / DDR5 16Gb Jun~Oct / DRAM 8Gb Jul~Oct / NAND 128Gb Jun~Oct','2026년 10월까지 공개 월별 가격','Server/PC DDR5·DDR4·HBM 계약 ASP 미확보'],

  ['AI 수요','IEA 2024 actual, 2025 estimate, 2030 forecast; TSMC CY2023~25; NVIDIA FY2024~26','NVIDIA FY27 Q1~Q3, TSMC CY26 Q1~Q3','전력 분기 실측치 미확보; 기업 FY/CY 구분'],

  ['빅테크 CAPEX','2024~2025 CY/FY actual, Microsoft FY26 actual','Alphabet·Amazon·Meta 1~3Q YTD, Microsoft FY27 Q1','회사별 CAPEX 정의·회계기간 차이'],
  ['공급·재고','공급사 투자·증설 계획','삼성·SK하이닉스·Micron 최신 공시','제품별 재고일수·bit supply 미확보'],

  ['기업 실적','삼성·SK 2023~25, Micron FY2023~26','삼성·SK 1Q~3Q26, Micron FY26 FQ1~FQ4','회계기간·통화·회계기준 차이'],
  ['장기 사이클','SIA actual 및 Gartner estimate/forecast 별도','SIA Q1~Q3','메모리 분기 매출 무료 actual series 미확보'],

  ['투자 시나리오','연도별 actual·forecast 분리','최신 기업 가이던스·분기 실적','투자 판단은 분석이며 예측 보장 아님']
 ]}/></div>
 <div className="panel"><h3>메모리 점수 모델 · 공개지표 커버리지</h3><Table headers={['지표','기본 가중치','점수','산식 반영 가중치','결측 처리']} rows={memorySignals.map(x=>[x.name,x.baseWeight+'%',x.score===null?'미산정':x.score+'점',x.score===null?'0%':normalizedWeight(x.baseWeight)+'%',x.score===null?'제외·재배분':'공개 proxy'])}/><div className="formula">Cycle Score = Σ(score × base weight) ÷ scored base weight = {cycleScore}점</div><Notice>현재 점수는 7개 항목 중 3개만 점수화한 무료 공개자료 proxy입니다. Server DDR5와 HBM은 기업의 정성적 수요·제품 코멘트, NAND는 정부 고정가격·SSD 수출을 반영합니다. PC DDR5·DDR4·재고·회사별 ASP는 미확보라 제외하고 가중치를 재배분했습니다. 점수는 투자수익률 예측이 아닙니다.</Notice></div>
 <div className="panel"><h3>출처 레지스트리 · 무료 공개 원문</h3><Table headers={['출처','발표일/상태','활용 데이터','접근']} rows={sources.map(s=>[s.name,s.date,s.desc,'Free public'])}/><div className="source-list">{sources.map(s=><a href={s.url} target="_blank" rel="noreferrer" key={s.name}><ExternalLink size={12}/><span>{s.name}<small style={{display:'block',opacity:.7,marginTop:3}}>{s.date} · {s.desc}</small></span></a>)}</div></div>
 <div className="panel"><h3>데이터 품질 원칙</h3><div className="quality-list"><div><ShieldCheck size={16}/> 유료 API·유료 구독·유료 데이터베이스 미사용</div><div><ShieldCheck size={16}/> 실제·추정·전망·잠정치 구분</div><div><ShieldCheck size={16}/> FY·CY·통화·단위 구분</div><div><ShieldCheck size={16}/> 결측치를 0점·중립점으로 대체하지 않음</div><div><ShieldCheck size={16}/> 신규 수치는 기존 연도·분기 시계열 뒤에 누적</div><div><ShieldCheck size={16}/> 직접 ASP가 없으면 매출·수출을 ASP로 표시하지 않음</div></div></div>
 </>}

function App(){
 const [active,setActive]=useState<Section>(()=>{const tab=new URLSearchParams(window.location.search).get('tab');return menu.some(m=>m.id===tab)?tab as Section:'overview'});
 const [period,setPeriod]=useState<Period>('3Y');
 const [mobileOpen,setMobileOpen]=useState(false);
 const [query,setQuery]=useState('');
 const filtered=useMemo(()=>menu.filter(m=>(m.label+m.sub).toLowerCase().includes(query.toLowerCase())),[query]);
 const current=menu.find(m=>m.id===active)!;
 const render=()=>{switch(active){
  case'overview':return <Overview period={period} setPeriod={setPeriod}/>;
  case'pricing':return <Pricing/>;
  case'demand':return <Demand/>;
  case'capex':return <Capex/>;
  case'supply':return <Supply/>;
  case'companies':return <Companies/>;
  case'cycles':return <Cycles/>;
  case'insights':return <Insights/>;
  case'method':return <Method/>;
 }};
 return <div className="app-shell">
  <aside className={'sidebar '+(mobileOpen?'open':'')}>
   <div className="brand"><div className="brand-mark">SI<span>.</span></div><div><b>SEMICONDUCTOR</b><small>INTELLIGENCE</small></div><button className="mobile-close" onClick={()=>setMobileOpen(false)}><X size={18}/></button></div>
   <div className="workspace"><span className="live-dot"/><span>무료 공개 데이터</span><Pill tone="green">유료 API 미사용</Pill></div>
   <div className="nav-label">대시보드 메뉴</div>
   <div className="nav-search"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="메뉴 검색"/></div>
   <nav>{filtered.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(active===item.id?'selected':'')} onClick={()=>{setActive(item.id);setMobileOpen(false);}}><Icon size={17}/><span><b>{item.label}</b><small>{item.sub}</small></span><em>{item.no}</em></button>})}</nav>
   <div className="sidebar-bottom"><div className="source-status"><ShieldCheck size={16}/><div><b>무료 공개 출처만 사용</b><small>기업 공시·정부·협회 원문 기준</small></div></div><div className="version">반도체 산업 분석 <span>v1.1</span></div></div>
  </aside>
  {mobileOpen&&<div className="scrim" onClick={()=>setMobileOpen(false)}/>}
  <main className="main">
   <header className="topbar"><div className="top-left"><button className="menu-button" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><span>대시보드 / <b>{current.label}</b></span></div><div className="top-actions"><div className="date-label"><CalendarDays size={15}/> 데이터 기준 · 2026.11.23 · USD/KRW 1,345원</div><button className="share-button" onClick={()=>navigator.clipboard?.writeText(window.location.href)}><ExternalLink size={15}/> 링크 공유</button></div></header>
   <div className="content">{render()}<footer><div><b>SI · Semiconductor Intelligence</b><span>공개자료 기반 반도체 산업 분석 대시보드</span></div><span>실적 / 추정 / 전망 / 미확보 · v1.1</span></footer></div>
  </main>
 </div>;
}
export default App;
