import { useMemo, useState } from 'react';
import {
  Activity, BarChart3, CalendarDays, ChevronRight, ExternalLink,
  Gauge, Layers3, Menu, Search, Server, ShieldCheck,
  TrendingUp, Wallet, X, Info
} from 'lucide-react';

type Section = 'overview'|'pricing'|'demand'|'capex'|'companies'|'cycles'|'insights'|'method';
type Period = '3Y'|'5Y'|'10Y'|'MAX';

const menu:{id:Section;no:string;label:string;sub:string;icon:any}[]=[
  {id:'overview',no:'01',label:'산업 사이클',sub:'시장 흐름과 업황 점수',icon:Activity},
  {id:'pricing',no:'02',label:'제품별 가격',sub:'DRAM·NAND·DDR 가격',icon:Layers3},
  {id:'demand',no:'03',label:'AI 수요 & 데이터센터',sub:'AI 투자와 전력 수요',icon:Server},
  {id:'capex',no:'04',label:'빅테크 투자',sub:'주요 기업 설비투자',icon:Wallet},
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
const iea=[{year:'2024',value:415,status:'Actual'},{year:'2025',value:485,status:'Estimate'},{year:'2030',value:950,status:'Forecast'}];
const ieaAnnual=[{year:'2023',value:360},{year:'2024',value:416},{year:'2025',value:485},{year:'2026E',value:560},{year:'2027E',value:645},{year:'2028E',value:740},{year:'2029E',value:840},{year:'2030F',value:950}];
const aiPowerAnnual=[{year:'2025E',value:150},{year:'2026E',value:190},{year:'2027E',value:245},{year:'2028E',value:310},{year:'2029E',value:380},{year:'2030F',value:450}];
// Token forecast is a transparent scenario model, not an official global census. Anchor: JPMorgan AI Tracker estimated about 360T tokens/day in Jul-2026.
const tokenHistory=[{year:'Jan 2024',value:1},{year:'Jul 2024',value:3},{year:'Jan 2025',value:15},{year:'Jul 2025',value:70},{year:'Jan 2026',value:200},{year:'Jul 2026',value:360}];
const tokenBase=[...tokenHistory,{year:'2026E',value:400},{year:'2027E',value:600},{year:'2028E',value:900},{year:'2029E',value:1350},{year:'2030F',value:2000}];
const tokenLow=[{year:'2026E',value:400},{year:'2027E',value:500},{year:'2028E',value:625},{year:'2029E',value:780},{year:'2030F',value:975}];
const tokenHigh=[{year:'2026E',value:400},{year:'2027E',value:800},{year:'2028E',value:1600},{year:'2029E',value:3200},{year:'2030F',value:6400}];
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

 // SK하이닉스: DS투자증권(11/10), 하나증권(11/23), LS증권(11/16).
 const sk:MemoryFinancialPoint[]=[
  {year:'2026E*',periodLabel:'2026E* · 1Q~3Q 누계 연환산',revenue:annualized(skQuarterly).revenue,op:annualized(skQuarterly).op},
  {year:'2027E',revenue:mid(569.898,643.076),op:mid(443.8,528.138),revenueLow:569.898,revenueHigh:643.076,opLow:443.8,opHigh:528.138},
  {year:'2028E',periodLabel:'2028E · LS증권 단일 추정',revenue:739.36,op:611.405},
  {year:'2029E',periodLabel:'2029E · DS투자증권 단일 추정(영업이익)',revenue:undefined as unknown as number,op:290.3}
 ];
 // Micron: S&P Global Market Intelligence / Visible Alpha FY27~FY28 consensus (2026-10~11); 회계연도(FY).
 // FY27~FY28 매출 평균·범위는 Yahoo Finance의 S&P Global 기반 컨센서스(2026-11-22).
 // 영업이익은 Visible Alpha 총이익률·영업비용으로 산출한 근사치이며, 직접 공표된 영업이익 컨센서스가 아님.
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
