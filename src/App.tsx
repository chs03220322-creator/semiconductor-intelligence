import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, BarChart3, CalendarDays, ExternalLink,
  Gauge, Layers3, Menu, Server, ShieldCheck,
  TrendingUp, Wallet, X, Info
} from 'lucide-react';

type Section = 'overview'|'pricing'|'demand'|'capex'|'companies'|'cycles'|'insights'|'market';
type Period = '3Y'|'5Y'|'6Y';

const menu:{id:Section;no:string;label:string;sub:string;icon:any}[]=[
  {id:'overview',no:'01',label:'산업 사이클',sub:'시장 흐름과 업황 점수',icon:Activity},
  {id:'pricing',no:'02',label:'제품별 가격',sub:'DRAM·NAND·DDR 가격',icon:Layers3},
  {id:'demand',no:'03',label:'AI 수요 & 데이터센터',sub:'토큰·GPU·메모리 수요',icon:Server},
  {id:'capex',no:'04',label:'빅테크 투자',sub:'주요 기업 설비투자',icon:Wallet},
  {id:'companies',no:'05',label:'기업 실적',sub:'반도체 주요 기업',icon:BarChart3},
  {id:'cycles',no:'06',label:'장기 사이클',sub:'과거 흐름과 전망',icon:TrendingUp},
  {id:'insights',no:'07',label:'투자 시나리오',sub:'업황별 투자 관점',icon:Gauge},
  {id:'market',no:'08',label:'글로벌 금융시장',sub:'미국 증시·산업별 강세 지도',icon:TrendingUp},
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
  {name:'Berkeley Lab · 2025 United States Data Center Energy Usage Report',date:'2025 공개',url:'https://escholarship.org/uc/item/33m6w3x0',desc:'가속기 출하·GPU/ASIC 구성·AI 서버 전력·훈련/추론 비중 및 전력수요 시나리오'},
  {name:'Microsoft Research · AI Data Center Lifecycle Compass',date:'2026 공개',url:'https://www.microsoft.com/en-us/research/wp-content/uploads/2026/03/AI-DC-Lifecycle-Compass.pdf',desc:'AI workload 유형별 모델 크기·사용자 부하·메모리·연산·인프라 요구량 분석'},
  {name:'McKinsey · The next big shifts in AI workloads and hyperscaler strategies',date:'2025 공개',url:'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-next-big-shifts-in-ai-workloads-and-hyperscaler-strategies',desc:'훈련과 추론의 데이터센터 수요·전력·입지 차이 및 추론 비중 전망'},
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
  {name:'SK hynix · Yongin Y2 / Cheongju M17 투자',date:'2026-08-07',url:'https://news.skhynix.com/en/fab-facility-investment-2026/',desc:'신규 팹 투자 계획·장기 공급능력'},
  {name:'미래에셋증권 · 반도체 NAND 수요 전망 (2026-04-13), 표 4',date:'2026-04-13',url:'https://securities.miraeasset.com/bbs/download/2143836.pdf?attachmentId=2143836',desc:'2020~2028년 글로벌 Total NAND 및 Enterprise SSD bit 수요 전망 · 표 4'},
  {name:'SUMCO · 4Q-2025 Results, pp.13-14 (2026-02-10)',date:'2026-02-10',url:'https://f.irbank.net/pdf/20260210/140120260209551618.pdf',desc:'AI 서버 DRAM/NAND wafer 수요 및 서버당 DRAM 탑재량 전망'},
  {name:'SUMCO · 4Q-2025 Results, p.13 (2026-02-10)',date:'2026-02-10',url:'https://f.irbank.net/pdf/20260210/140120260209551618.pdf',desc:'AI 서버 DRAM wafer 수요·서버당 DRAM 탑재량 전망'},
  {name:'SUMCO · 4Q-2025 Results, p.14 (2026-02-10)',date:'2026-02-10',url:'https://f.irbank.net/pdf/20260210/140120260209551618.pdf',desc:'AI 서버 NAND wafer 수요 전망'},
  {name:'미래에셋증권 · SK하이닉스 산업분석 (2026-10-06), 표 5',date:'2026-10-06',url:'https://securities.miraeasset.com/bbs/download/2147584.pdf?attachmentId=2147584',desc:'2026~2028년 글로벌 DRAM 및 Server DRAM bit 수요 전망'},
  {name:'TrendForce · 2026년 AI 서버 출하 전망 (2026-08-03)',date:'2026-08-03',url:'https://www.trendforce.com/presscenter/news/20260803-13161.html',desc:'2026년 AI 서버 출하량 약 31% 증가 전망 · 공개 보도자료'}
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
const supplierCapex=[
  {company:'Samsung Electronics',period:'3Q26',quarter:'₩29.0T',ytd:'₩56.9T',definition:'전사 CAPEX; DS 3Q ₩27.2T, 1~3Q ₩52.8T'},
  {company:'Micron',period:'FY2026 Q4',quarter:'$10.77B',ytd:'$27.37B',definition:'Net CAPEX; FY2026 누계'}
];
const FX_USDKRW=1344.23; // 2026-11-25 reference mid-market rate
// AI 메모리 사이클 점수: 공개 전망의 성장률과 실제 공개가격의 모멘텀을 분리해 계산
const clampScore=(v:number)=>Math.max(0,Math.min(100,v));
const growthPct=(start:number,end:number,years:number)=>(Math.pow(end/start,1/years)-1)*100;
const growthScore=(cagr:number)=>clampScore(50+cagr*1.1);
const priceMomentum=(values:number[])=>{
 const avgMonthly=(Math.pow(values[values.length-1]/values[0],1/(values.length-1))-1)*100;
 const latestMonthly=(values[values.length-1]/values[values.length-2]-1)*100;
 return {avgMonthly,latestMonthly,score:clampScore(50+(avgMonthly*0.6+latestMonthly*0.4)*5.5)};
};
// AI 수요 축: wafer 투입량(학습+추론), Server DRAM bit, AI 서버 출하 전망
const aiDramWaferCagr=growthPct(180+90,800+700,5);
const aiNandWaferCagr=growthPct(20+72,29+197,5);
const serverDramBitCagr=growthPct(164,269,2);
const aiServerShipmentGrowth=31;
const aiDemandScore=Math.round(
 growthScore(aiDramWaferCagr)*0.35+
 growthScore(aiNandWaferCagr)*0.15+
 growthScore(serverDramBitCagr)*0.30+
 growthScore(aiServerShipmentGrowth)*0.20
);
// 가격 축: DRAM 계열 80%, NAND 20%. 평균 월간 상승률 60% + 최신 월 상승률 40%
const ddr5Momentum=priceMomentum([40,45,46.5,48,50]);
const dram16Momentum=priceMomentum([40,45,46.5,48]);
const dram8Momentum=priceMomentum([24,25,26,27.5]);
const nandMomentum=priceMomentum([28.8,30.1,30.5,30.6,30.6]);
const dramPriceScore=ddr5Momentum.score*0.40+dram16Momentum.score*0.35+dram8Momentum.score*0.25;
const priceMomentumScore=Math.round(dramPriceScore*0.80+nandMomentum.score*0.20);
// 수요가 가격보다 선행한다는 점을 반영하되, 가격이 확인되지 않은 수요만으로 과대평가하지 않도록 60:40
const weightedCycleScore=(demandWeight:number)=>Math.round(aiDemandScore*(demandWeight/100)+priceMomentumScore*(1-demandWeight/100));

function Pill({children,tone='muted'}:{children:any;tone?:'muted'|'green'|'amber'|'blue'}){return <span className={'pill '+tone}>{children}</span>}
function Title({eyebrow,title,desc}:{eyebrow:string;title:string;desc:string}){return <div className="section-title"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div>}
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
function MultiLineChart({series,label,height=220}:{series:{name:string;unit:string;data:{year:string;value:number}[]}[];label:string;height?:number}){
 const [selected,setSelected]=useState<{series:number;point:number}|null>(null);
 const [activeSeriesIndex,setActiveSeriesIndex]=useState(0);
 const all=series.flatMap(s=>s.data.map(d=>d.value));
 const min=Math.min(0,...all),max=Math.max(...all),range=max-min||1;
 const top=10,bottom=76;
 const x=(i:number,n:number)=>n<=1?50:8+i*84/(n-1);
 const y=(v:number)=>top+(max-v)/range*(bottom-top);
 const colors=['#68c5d4','#e6a85c','#9b8bea','#62bd8b'];
 const chosenSeriesIndex=selected?.series??activeSeriesIndex;
 const chosenSeries=series[chosenSeriesIndex];
 const active=selected?series[selected.series].data[selected.point]:null;
 const activeSeries=selected?series[selected.series]:null;
 const previous=selected&&selected.point>0?series[selected.series].data[selected.point-1]:null;
 const delta=active&&previous?active.value-previous.value:null;
 const deltaPct=active&&previous&&previous.value!==0?(active.value/previous.value-1)*100:null;
 const signed=(v:number)=>v>0?'+':'';
 const fmt=(v:number)=>v.toLocaleString('ko-KR',{maximumFractionDigits:2});
 const selectPoint=(si:number,pi:number)=>{setActiveSeriesIndex(si);setSelected({series:si,point:pi})};
 return <div className="line-chart" style={{height:height+76}}>
  <div className="chart-value-callout" aria-live="polite">{selected&&active&&activeSeries?<><b>{activeSeries.name} · {active.year}</b><strong>{fmt(active.value)} {activeSeries.unit}</strong><small style={{display:'block',marginTop:5,color:deltaPct===null?'var(--muted,#9aa9b7)':deltaPct>=0?'#55bf98':'#e0a06b',fontWeight:700}}>{previous?(`직전 타점(${previous.year}) 대비 ${signed(deltaPct as number)}${(deltaPct as number).toFixed(1)}% · ${signed(delta as number)}${fmt(Math.abs(delta as number))} ${activeSeries.unit}`):'첫 번째 타점 · 이전 시점 비교 없음'}</small>{previous&&<small style={{display:'block',marginTop:3,color:'var(--muted,#9aa9b7)'}}>이전 값 {fmt(previous.value)} {activeSeries.unit}</small>}</>:<span>아래 연도 버튼 또는 그래프의 점을 선택하면 직전 시점 대비 증감률이 표시됩니다</span>}</div>
  <div className="line-plot"><div className="line-y-axis"><span>{fmt(max)}</span><span>{fmt((max+min)/2)}</span><span>{fmt(min)}</span></div>
   <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={label}>
    {series.map((s,si)=>{const pts=s.data.map((d,i)=>[x(i,s.data.length),y(d.value)] as [number,number]);const path=pts.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(' ');return <g key={s.name}><path d={path} fill="none" stroke={colors[si%colors.length]} strokeWidth="2.4" vectorEffect="non-scaling-stroke"/>{pts.map((p,pi)=><g key={pi} onClick={()=>selectPoint(si,pi)} style={{cursor:'pointer'}}><circle cx={p[0]} cy={p[1]} r="5" fill="transparent" pointerEvents="all"/><circle cx={p[0]} cy={p[1]} r={selected?.series===si&&selected.point===pi?2.8:1.8} fill={colors[si%colors.length]} stroke="#101a23" strokeWidth=".7" vectorEffect="non-scaling-stroke" pointerEvents="none"/></g>)}</g>})}
   </svg>
  </div>
  <div className="line-labels">{(chosenSeries?.data||[]).map((d,pi)=><button type="button" key={d.year} className={selected?.series===chosenSeriesIndex&&selected.point===pi?'chosen':''} onClick={()=>selectPoint(chosenSeriesIndex,pi)} aria-label={`${chosenSeries?.name} ${d.year} 선택`}>{d.year}</button>)}</div>
  <div className="legend-row">{series.map((s,i)=><button type="button" key={s.name} onClick={()=>{setActiveSeriesIndex(i);setSelected(null)}} aria-pressed={chosenSeriesIndex===i} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 7px',border:'1px solid '+(chosenSeriesIndex===i?'#66899a':'transparent'),borderRadius:5,background:chosenSeriesIndex===i?'#1b2b36':'transparent',color:'inherit',font:'inherit',cursor:'pointer'}}><i style={{background:colors[i%colors.length]}}/>{s.name}</button>)}</div>
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

function Overview({period,setPeriod,demandWeight}:{period:Period;setPeriod:(p:Period)=>void;demandWeight:number}){
 const priceWeight=100-demandWeight;
 const liveCycleScore=weightedCycleScore(demandWeight);
 const data=period==='3Y'?market.slice(-3):period==='5Y'?market.slice(-5):market;
 return <>
  <Title eyebrow="01 / CYCLE MONITOR" title="반도체 사이클 한눈에 보기" desc="AI 메모리 수요 성장과 실제 공개 메모리 가격 모멘텀을 분리 평가한 참고 지수입니다. 공급·재고·기업별 ASP는 공개 데이터가 부족해 별도 확정 점수에 넣지 않습니다."/>
  <div className="hero-score"><div className="score-main"><div className="score-label"><span className="live-dot"/> AI 메모리 수요·가격 종합지수 <Pill tone="green">공개자료 기반 proxy</Pill></div><div className="score-number">{liveCycleScore}<small>/ 100</small></div><p>AI 수요 {aiDemandScore}점 · 가격 모멘텀 {priceMomentumScore}점 · AI 수요 {demandWeight}% · 가격 {priceWeight}%</p><div className="score-foot"><span>AI 수요 성장 강세</span><span>DRAM 가격 상승</span><span>NAND 상승 둔화</span></div></div><div className="score-gauge"><div className="gauge-ring"><div><strong>{liveCycleScore}</strong><span>수요·가격 지수</span></div></div><small>전체 업황·정점 예측 점수 아님</small></div></div>
  <div className="stats-grid three">
   <Stat label="DDR5 16Gb · 2026년 10월" value="$50.0" sub="전월 대비 +4.2% · 공개 고정가격"/>
   <Stat label="DRAM 8Gb · 2026년 10월" value="$27.5" sub="전월 대비 +5.8% · 공개 기준가격"/>
   <Stat label="NAND 128Gb · 2026년 10월" value="$30.6" sub="전월 대비 0.0% · 공개 기준가격"/>
  </div>
  <div className="panel"><div className="panel-head"><div><h3>사이클 판단에 필요한 핵심 신호</h3><p>중복되는 기업별 수치·세부 가중치 표는 이 화면에서 제외했습니다.</p></div><Pill tone="blue">핵심 3개 지표</Pill></div>
   <Table headers={['핵심 신호','현재 판단','해석']} rows={[
    ['HBM·서버 DRAM 수요','강세','삼성·SK하이닉스의 AI 메모리 및 서버 제품 판매 확대'],
    ['범용 DRAM 가격','상승','정부 공개 기준가격 상승. 단, 서버 DDR5 계약 ASP와 동일한 수치가 아님'],
    ['NAND 가격','보합','NAND 128Gb 공개 기준가격은 9~10월 $30.6으로 횡보'],
    ['공급·재고','주의 관찰','증설 계획은 확인되나 제품별 재고일수·bit 공급량은 동일 기준 미확보']
   ]}/>
   <Notice>기존 92점은 Server DDR5·HBM·NAND의 제한된 지표를 가중 평균한 점수였습니다. 현재 종합지수는 AI 수요 {demandWeight}%(DRAM wafer CAGR 35%, NAND wafer CAGR 15%, Server DRAM bit CAGR 30%, AI 서버 출하 성장 20%)와 가격 {priceWeight}%(DRAM 80%, NAND 20%)로 계산합니다. 현재는 수요 {aiDemandScore}점, 가격 {priceMomentumScore}점, 종합 {liveCycleScore}점입니다. 슬라이더 조절은 이 가중치만 변경하며 각 세부 지표의 원점수는 바꾸지 않습니다. 공급·재고·회사별 ASP는 비교 가능한 공개 시계열이 없어 제외했으므로 전체 업황 확정 점수로 보지 않습니다.</Notice>
  </div>
  <div className="period-bar"><div><b>글로벌 반도체 시장 규모</b><span>장기 사이클 확인용 · SIA 연간 actual</span></div><div className="segmented">{(['3Y','5Y','6Y'] as Period[]).map(p=><button className={period===p?'active':''} onClick={()=>setPeriod(p)} key={p}>{p}</button>)}</div></div>
  <div className="panel"><LineChart data={data} keyName="value" label="Global semiconductor sales · USD bn" height={190}/><Table headers={['연도','시장 매출','전년 대비']} rows={data.map((x)=>{const i=market.findIndex(m=>m.year===x.year);const previous=i>0?market[i-1]:null;return [x.year,'$'+x.value.toFixed(1)+'B',previous?((x.value/previous.value-1)*100).toFixed(1)+'%':'—'];})}/><Sources items={['SIA · 2025년 연간 글로벌 반도체 매출']}/></div>
 </>;
}
function Pricing(){return <>
 <Title eyebrow="02 / PRODUCT PRICING" title="메모리 가격 & 수급" desc="정부가 공개한 범용 DRAM·NAND 기준가격과 DDR5 고정가격을 반영합니다. 제품별 전월 가격 증감액과 증감률을 함께 표시하며, 공개되지 않은 개별 계약 ASP는 추정하지 않습니다."/>
 <TrendPanel title="2026년 정부 공개 메모리 고정가격" series={[{name:'DRAM 16Gb 공개 기준가격',unit:'USD / chip',data:pricesDram16},{name:'DDR5 16Gb 고정가격 (별도 계열)',unit:'USD / chip',data:pricesDdr5_16},{name:'DRAM 8Gb 공개 기준가격',unit:'USD / chip',data:pricesDram8,comparisonData:prices2025Dram8},{name:'NAND 128Gb 공개 기준가격',unit:'USD / chip',data:pricesNand,comparisonData:prices2025Nand}]} quarterHeaders={['월','DRAM 16Gb','증감액(원)','증감률','DDR5 16Gb','증감액(원)','증감률','DRAM 8Gb','증감액(원)','증감률','NAND 128Gb','증감액(원)','증감률','상태']} quarterRows={[
  ['Jun 26','$40.0',priceChangeCell(pricesDram16,'Jun 26','delta'),priceChangeCell(pricesDram16,'Jun 26','rate'),'$40.0',priceChangeCell(pricesDdr5_16,'Jun 26','delta'),priceChangeCell(pricesDdr5_16,'Jun 26','rate'),'—',priceChangeCell(pricesDram8,'Jun 26','delta'),priceChangeCell(pricesDram8,'Jun 26','rate'),'$28.8',priceChangeCell(pricesNand,'Jun 26','delta'),priceChangeCell(pricesNand,'Jun 26','rate'),'Actual'],
  ['Jul 26','$45.0',priceChangeCell(pricesDram16,'Jul 26','delta'),priceChangeCell(pricesDram16,'Jul 26','rate'),'$45.0',priceChangeCell(pricesDdr5_16,'Jul 26','delta'),priceChangeCell(pricesDdr5_16,'Jul 26','rate'),'$24.0',priceChangeCell(pricesDram8,'Jul 26','delta'),priceChangeCell(pricesDram8,'Jul 26','rate'),'$30.1',priceChangeCell(pricesNand,'Jul 26','delta'),priceChangeCell(pricesNand,'Jul 26','rate'),'Actual'],
  ['Aug 26','$46.5',priceChangeCell(pricesDram16,'Aug 26','delta'),priceChangeCell(pricesDram16,'Aug 26','rate'),'$46.5',priceChangeCell(pricesDdr5_16,'Aug 26','delta'),priceChangeCell(pricesDdr5_16,'Aug 26','rate'),'$25.0',priceChangeCell(pricesDram8,'Aug 26','delta'),priceChangeCell(pricesDram8,'Aug 26','rate'),'$30.5',priceChangeCell(pricesNand,'Aug 26','delta'),priceChangeCell(pricesNand,'Aug 26','rate'),'Actual'],
  ['Sep 26','$48.0',priceChangeCell(pricesDram16,'Sep 26','delta'),priceChangeCell(pricesDram16,'Sep 26','rate'),'$48.0',priceChangeCell(pricesDdr5_16,'Sep 26','delta'),priceChangeCell(pricesDdr5_16,'Sep 26','rate'),'$26.0',priceChangeCell(pricesDram8,'Sep 26','delta'),priceChangeCell(pricesDram8,'Sep 26','rate'),'$30.6',priceChangeCell(pricesNand,'Sep 26','delta'),priceChangeCell(pricesNand,'Sep 26','rate'),'Actual'],
  ['Oct 26','—',priceChangeCell(pricesDram16,'Oct 26','delta'),priceChangeCell(pricesDram16,'Oct 26','rate'),'$50.0',priceChangeCell(pricesDdr5_16,'Oct 26','delta'),priceChangeCell(pricesDdr5_16,'Oct 26','rate'),'$27.5',priceChangeCell(pricesDram8,'Oct 26','delta'),priceChangeCell(pricesDram8,'Oct 26','rate'),'$30.6',priceChangeCell(pricesNand,'Oct 26','delta'),priceChangeCell(pricesNand,'Oct 26','rate'),'Actual']
 ]} note="DRAM 16Gb 범용 기준가격과 DDR5 16Gb 고정가격은 서로 다른 공개 계열이므로 분리했습니다. 증감액은 기준가격의 USD/chip 차이를 기준 환율 1,345원으로 환산한 원/chip입니다. DDR5 16Gb는 10월 $50.0까지 공개되어 있습니다. 어느 series도 Server DDR5 RDIMM·PC DDR5 모듈 ASP와 동일하지 않습니다." source={['산업부 · 2026년 9월 ICT 수출입 동향','산업부 · 2026년 10월 ICT 수출입 동향','산업부 · 2026년 10월 수출입 동향']}/>
 <div className="panel"><h3>2025년 공개 DRAM 8Gb·NAND 128Gb 기준가격</h3><p className="muted">2025년 7~10월 관측치 · USD/chip · 2026년 series와 연도·시장 환경을 구분</p><LineChart data={prices2025Dram8} keyName="value" label="DRAM 8Gb reference · USD/chip" height={180}/><LineChart data={prices2025Nand} keyName="value" label="NAND 128Gb reference · USD/chip" height={180}/><Table headers={['월','DRAM 8Gb','증감액(원)','증감률','NAND 128Gb','증감액(원)','증감률']} rows={prices2025Dram8.map(x=>[x.year,'$'+x.value.toFixed(2),priceChangeCell(prices2025Dram8,x.year,'delta'),priceChangeCell(prices2025Dram8,x.year,'rate'),'$'+(prices2025Nand.find(n=>n.year===x.year)?.value??0).toFixed(2),priceChangeCell(prices2025Nand,x.year,'delta'),priceChangeCell(prices2025Nand,x.year,'rate')])}/><Sources items={['산업부 · 2025년 10월 ICT 수출입 동향']}/></div>
 <div className="panel"><h3>제품별 데이터 범위</h3><Table headers={['제품군','확인 가능한 항목','미확보 항목']} rows={[
  ['Server DDR5','기업 IR의 서버 DDR5 수요·제품 믹스 코멘트, 범용 DRAM 8Gb·16Gb 기준가격','Server RDIMM 계약 ASP·제품별 출하 bit'],['PC DDR5','글로벌 시장·기업 실적의 간접 신호','PC 전용 DDR5 계약 ASP·출하량'],['DDR4','기업 코멘트 및 범용 DRAM 시장 지표 일부','DDR4 단독 고정가격·계약 ASP'],['HBM','삼성·SK hynix의 HBM4 출하·사업 코멘트','고객별 HBM3E/HBM4 계약가격·ASP'],['NAND','NAND 128Gb 기준가격·SSD 수출','Enterprise SSD 제품별 계약 ASP'],['삼성·SK ASP','분기 매출·이익 및 가격 방향 코멘트','회사별·제품별 ASP 증감률']
 ]}/></div>
 </>;
}
function Demand({demandWeight,setDemandWeight}:{demandWeight:number;setDemandWeight:(v:number)=>void}){
 const priceWeight=100-demandWeight;
 const liveCycleScore=weightedCycleScore(demandWeight);
 return <>
 <Title eyebrow="03 / COMPUTE DEMAND" title="AI 수요 & 데이터센터" desc="기관이 공개한 AI 서버·메모리 수요 전망과 가격 추세를 분리해 평가합니다. Actual·Estimate·Forecast를 구분하고 미확보 수치는 점수에 넣지 않습니다."/>
  <div className="weight-adjuster">
   <div className="weight-adjuster-head"><div><b>종합 점수 가중치 조절</b><small>슬라이더를 움직이면 AI 수요와 가격의 반영 비중 및 종합 점수가 즉시 바뀝니다.</small></div><strong>{demandWeight}% : {priceWeight}%</strong></div>
   <input aria-label="AI 수요 가중치 조절" type="range" min="0" max="100" step="5" value={demandWeight} onChange={e=>setDemandWeight(Number(e.target.value))}/>
   <div className="weight-adjuster-range"><span>가격 중심 0:100</span><span>균형 50:50</span><span>수요 중심 100:0</span></div>
   <div className="weight-adjuster-result"><span>AI 수요 {aiDemandScore}점 × {demandWeight}%</span><span>가격 {priceMomentumScore}점 × {priceWeight}%</span><b>현재 종합 {liveCycleScore}점</b></div>
  </div>

 <div className="stats-grid">
  <Stat label="2029년 AI 서버 DRAM wafer 수요" value="월 150만 장" sub="SUMCO 공개 전망 · 2024년 대비 약 5.6배"/>
  <Stat label="2029년 AI 서버 NAND wafer 수요" value="월 22.7만 장" sub="SUMCO 공개 전망 · 2024년 대비 약 2.5배"/>
  <Stat label="2027년 Server DRAM 수요" value="216bn Gb" sub="미래에셋증권 · 2026.10.06"/>
  <Stat label="2026년 AI 서버 출하 증가율" value="약 +31%" sub="TrendForce 공개 보도자료 · 2026.08.03 전망"/>
 </div>
 <div className="panel">
  <div className="panel-head"><div><h3>AI 수요·메모리 가격 정량 평가</h3><p>수요 전망과 실제 가격 흐름을 분리하고, 중복 집계는 피했습니다.</p></div><Pill tone="blue">산식 공개</Pill></div>
  <div className="stats-grid three">
   <Stat label="AI 수요 모멘텀" value={aiDemandScore+" / 100"} sub="DRAM·NAND wafer, Server DRAM bit, AI 서버 출하"/>
   <Stat label="가격 상승 모멘텀" value={priceMomentumScore+" / 100"} sub="DRAM 가격 80% · NAND 가격 20%"/>
   <Stat label="수요·가격 종합" value={liveCycleScore+" / 100"} sub={`AI 수요 ${demandWeight}% · 가격 ${priceWeight}%`}/>
  </div>
  <Table headers={["평가 항목","원자료 성장률","환산 점수","가중치"]} rows={[
   ["AI 서버 DRAM wafer 수요 CAGR · 2024~2029",aiDramWaferCagr.toFixed(1)+"%",growthScore(aiDramWaferCagr).toFixed(0), "35%"],
   ["AI 서버 NAND wafer 수요 CAGR · 2024~2029",aiNandWaferCagr.toFixed(1)+"%",growthScore(aiNandWaferCagr).toFixed(0), "15%"],
   ["Server DRAM bit 수요 CAGR · 2026~2028",serverDramBitCagr.toFixed(1)+"%",growthScore(serverDramBitCagr).toFixed(0), "30%"],
   ["AI 서버 출하 증가율 · 2026 전망",aiServerShipmentGrowth.toFixed(0)+"%",growthScore(aiServerShipmentGrowth).toFixed(0), "20%"]
  ]}/>
  <Table headers={["가격 지표","전체 구간 월평균","최근 월","가격 점수"]} rows={[
   ["DDR5 16Gb",ddr5Momentum.avgMonthly.toFixed(1)+"%",ddr5Momentum.latestMonthly.toFixed(1)+"%",ddr5Momentum.score.toFixed(0)],
   ["DRAM 16Gb",dram16Momentum.avgMonthly.toFixed(1)+"%",dram16Momentum.latestMonthly.toFixed(1)+"%",dram16Momentum.score.toFixed(0)],
   ["DRAM 8Gb",dram8Momentum.avgMonthly.toFixed(1)+"%",dram8Momentum.latestMonthly.toFixed(1)+"%",dram8Momentum.score.toFixed(0)],
   ["NAND 128Gb",nandMomentum.avgMonthly.toFixed(1)+"%",nandMomentum.latestMonthly.toFixed(1)+"%",nandMomentum.score.toFixed(0)]
  ]}/>
  <Notice>성장 점수는 0~100 범위에서 50점(중립) + CAGR×1.1로 환산합니다. 가격 점수는 평균 월간 상승률 60%와 최신 월 상승률 40%를 반영하고, 50점 + 월간 모멘텀×5.5로 환산합니다. 종합 점수는 사용자가 조절하는 AI 수요 {demandWeight}%·가격 {priceWeight}%를 적용합니다. 이 환산계수와 가중치는 공개된 관측치를 비교하기 위한 내부 분석 규칙이지 통계적으로 검증된 예측모형은 아닙니다. DRAM·NAND wafer와 bit 수요는 기관 전망치이며 실적이 아닙니다. 가격은 정부 공개 기준가격으로, 서버 전용 계약 ASP와 동일하지 않습니다.</Notice>
  <Sources items={["SUMCO · 4Q-2025 Results, pp.13-14 (2026-02-10)","미래에셋증권 · SK하이닉스 산업분석 (2026-10-06), 표 5","TrendForce · 2026년 AI 서버 출하 전망 (2026-08-03)","산업부 · 2026년 10월 ICT 수출입 동향 (2026-11-16)","산업부 · 2026년 10월 수출입 동향 (2026-11-16)"]}/>
 </div>
 <div className="panel"><h3>AI 서버용 DRAM wafer 수요 전망</h3><p className="muted">학습(Training)과 추론(Inference)의 월간 wafer 수요를 한 그래프에서 비교 · 단위: 천 장/월</p><MultiLineChart label="AI server DRAM wafer demand: Training and Inference" series={[{name:"Training (학습)",unit:"천 장/월",data:[{year:"2024",value:180},{year:"2025",value:360},{year:"2026",value:500},{year:"2027",value:620},{year:"2028",value:720},{year:"2029",value:800}]},{name:"Inference (추론)",unit:"천 장/월",data:[{year:"2024",value:90},{year:"2025",value:180},{year:"2026",value:280},{year:"2027",value:420},{year:"2028",value:570},{year:"2029",value:700}]}]}/><Notice>한 그래프 안에 학습과 추론을 서로 다른 색상의 선으로 표시합니다. SUMCO가 복수 조사기관 자료를 토대로 제시한 전망치이며 실적이 아닙니다.</Notice><Sources items={["SUMCO · 4Q-2025 Results, p.13 (2026-02-10)"]}/></div>
 <div className="panel"><h3>AI 서버용 NAND wafer 수요 전망</h3><p className="muted">학습(Training)과 추론(Inference)의 월간 wafer 수요를 한 그래프에서 비교 · 단위: 천 장/월</p><MultiLineChart label="AI server NAND wafer demand: Training and Inference" series={[{name:"Training (학습)",unit:"천 장/월",data:[{year:"2024",value:20},{year:"2025",value:25},{year:"2026",value:29},{year:"2027",value:30},{year:"2028",value:29},{year:"2029",value:29}]},{name:"Inference (추론)",unit:"천 장/월",data:[{year:"2024",value:72},{year:"2025",value:98},{year:"2026",value:128},{year:"2027",value:155},{year:"2028",value:176},{year:"2029",value:197}]}]}/><Notice>한 그래프 안에 학습과 추론을 서로 다른 색상의 선으로 표시합니다. SUMCO가 복수 조사기관 자료를 토대로 제시한 전망치이며 실적이 아닙니다.</Notice><Sources items={["SUMCO · 4Q-2025 Results, p.14 (2026-02-10)"]}/></div>
 <div className="panel"><h3>글로벌 DRAM bit 수요 전망</h3><p className="muted">증권사 산업 전망에 수록된 시장 전체 DRAM 수요 · 단위: 십억 Gb</p><MultiLineChart label="Global DRAM bit demand: Total and Server" series={[{name:"Total DRAM",unit:"십억 Gb",data:[{year:"2026E",value:391},{year:"2027E",value:489},{year:"2028E",value:614}]},{name:"Server DRAM",unit:"십억 Gb",data:[{year:"2026E",value:164},{year:"2027E",value:216},{year:"2028E",value:269}]}]}/><Notice>전체 DRAM bit 수요와 그 안에 포함되는 Server DRAM bit 수요를 같은 축의 별도 선으로 표시합니다. 두 수치는 중복되는 포함 관계이므로 합산하지 않습니다.</Notice><Sources items={["미래에셋증권 · SK하이닉스 산업분석 (2026-10-06), 표 5"]}/></div>
 <div className="panel"><h3>글로벌 NAND bit 수요 전망</h3><p className="muted">시장 전체 NAND 수요와 그 안에 포함되는 Enterprise SSD 수요 · 단위: 십억 Gb · 1GB=8Gb 환산</p><MultiLineChart label="Global NAND bit demand: Total and Enterprise SSD" series={[{name:"Total NAND",unit:"십억 Gb",data:[{year:"2020",value:3249.6},{year:"2021",value:4539.2},{year:"2022",value:5411.2},{year:"2023",value:6013.6},{year:"2024",value:6969.6},{year:"2025",value:8064.0},{year:"2026E",value:9590.4},{year:"2027E",value:11866.4},{year:"2028E",value:14385.6}]},{name:"Enterprise SSD",unit:"십억 Gb",data:[{year:"2020",value:596.8},{year:"2021",value:892.8},{year:"2022",value:1284.0},{year:"2023",value:1102.4},{year:"2024",value:1667.2},{year:"2025",value:2376.0},{year:"2026E",value:3927.2},{year:"2027E",value:5576.8},{year:"2028E",value:7491.2}]}]}/><Notice>Enterprise SSD는 전체 NAND 수요에 포함되는 부분집합이므로 두 계열을 합산하지 않습니다. 원자료의 십억 GB를 8배해 십억 Gb로 변환했습니다. 2026~2028년은 2026년 4월 발표 당시 전망치이며, 2026년 11월 Kioxia의 최신 코멘트는 2026년 bit 수요 성장률 high-teens, 2027년 low-20% 수준으로 제시하고 있어 절대량 전망과 구분해 해석해야 합니다.</Notice><Sources items={["미래에셋증권 · 반도체 NAND 수요 전망 (2026-04-13), 표 4"]}/></div>
 <div className="panel"><h3>AI 서버당 메모리 탑재량 전망</h3><p className="muted">서버 한 대에 탑재되는 평균 용량 전망 · 단위: TB/server</p><MultiLineChart label="DRAM capacity per AI server: Training and Inference" series={[{name:"Training (학습)",unit:"TB/server",data:[{year:"2024",value:8.3},{year:"2025",value:12.3},{year:"2026",value:14.7},{year:"2027",value:17.1},{year:"2028",value:18.9},{year:"2029",value:20.0}]},{name:"Inference (추론)",unit:"TB/server",data:[{year:"2024",value:2.3},{year:"2025",value:3.3},{year:"2026",value:4.3},{year:"2027",value:5.3},{year:"2028",value:6.2},{year:"2029",value:6.6}]}]}/><Notice>서버당 DRAM 탑재량도 학습과 추론을 한 그래프에 서로 다른 선으로 표시합니다. 서버 출하 대수와는 별개인 서버 1대당 평균 용량 전망입니다.</Notice><Sources items={["JPX · Wafer Demand Forecast for Leading-Edge DRAM in AI Servers (2026-02-09)"]}/></div>
 <div className="panel"><h3>기관 전망 핵심 요약</h3><Table headers={["기관·발표일","수요 전망","핵심 내용"]} rows={[
 ["TrendForce · 2026.11.16","2027년 AI 서버 출하량 약 +30%","2027년 출하 강세, 2028년 성장 둔화 전망. ASIC 출하량은 2027년 GPU를 추월할 것으로 전망"],
 ["TrendForce · 2026.07.30","2027년 DRAM 수급 타이트","HBM 생산능력 배분과 AI 서버 수요로 DRAM bit 공급 증가가 수요를 따라가기 어렵다고 분석"],
 ["TrendForce · 2026.11.20~25","NAND 수요 전망 하향 조정","중국 CSP의 enterprise SSD 주문 축소로 공급과잉 시점이 앞당겨질 수 있음. DRAM은 공급 부족이 이어지지만 구매자 신중론과 가격 상승폭 둔화 가능성"],
 ["Gartner · 2026.08.24","2026년 메모리 매출 $837B, 2027년 $1.08T","AI 데이터센터와 메모리 가격 상승이 시장 매출 성장을 견인. 매출 전망이며 bit 수요와는 구분"],
 ["TrendForce · 2026.09.29","2027년 HBM 공급 제약 지속","HBM4 비중 증가와 공급 제약으로 2027년 HBM blended ASP 상승 전망"]
 ]}/><Notice>기관별 전망은 발표 시점과 정의가 다릅니다. 매출액·출하량·bit 수요·wafer 투입량을 동일 지표처럼 비교하지 않습니다. NAND는 DRAM과 달리 2027년 공급 증가에 따른 수급 완화 가능성이 제기되고 있습니다.</Notice></div>
 <div className="panel"><h3>현재 수요 판단</h3><Table headers={["제품","기관 전망의 방향","판단"]} rows={[
 ["HBM","AI accelerator 세대 전환과 HBM 탑재량 증가, 2027년까지 공급 제약","수요 강세·공급 제약 지속"],
 ["Server DRAM","AI 서버 출하 증가와 서버당 DRAM 용량 상승","bit 수요 성장 강세"],
 ["Enterprise SSD / NAND","Inference·RAG·KV cache 저장 수요 증가","수요 성장 지속, 2027년 공급 확대 변수"],
 ["PC·Mobile DRAM","AI 서버로 생산능력 배분, 소비자 기기 수요는 상대적으로 약함","AI 서버와 일반 수요 간 온도차"]
 ]}/></div>
 <p className="muted">이 페이지는 기관이 공개한 수요·출하·탑재량 전망 중심으로 구성했습니다. 토큰→bit 탄력성 가정, 자체 장기 예측, 중복 표와 계산식은 제거했습니다. 원자료의 전망치가 갱신되면 발표일과 기준연도를 함께 업데이트해야 합니다.</p>
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
 <div className="panel"><h3>최근 분기 CAPEX 규모 참고 · 공시 정의 상이</h3><p className="muted">2026년 7~9월에 해당하는 최신 공개 분기 기준. Microsoft FY27 Q1은 2026년 7~9월이며, 나머지는 CY26 Q3입니다. 회사별 CAPEX 정의가 달라 직접적인 투자 강도 순위가 아닌 규모 참고용입니다.</p><Table headers={['기업','기간','분기 CAPEX','비교 기준']} rows={[
  ['Amazon','3Q26','$77.259B','Gross PPE purchases'],
  ['Alphabet','3Q26','$51.4B','PPE purchases'],
  ['Microsoft','FY27 Q1','$45.2B','CAPEX incl. finance leases'],
  ['Meta','3Q26','$34.91B','CAPEX incl. finance lease principal']
 ]}/><Sources items={['Amazon · 3Q26 실적','Alphabet · 3Q26 실적발표 콜','Microsoft · FY2027 Q1 실적발표 콜','Meta · 3Q26 SEC 10-Q']}/></div>
 <div className="panel"><h3>최근 연간 CAPEX 규모 참고 · 회계연도·정의 상이</h3><Table headers={['기업','회계기간','CAPEX','정의']} rows={[
  ['Amazon','CY2025','$128.32B','Gross PPE purchases'],
  ['Alphabet','CY2025','$91.4B','PPE purchases'],
  ['Meta','CY2025','$69.69B','PPE purchases; finance lease principal 별도'],
  ['Microsoft','FY2025','$64.55B','Additions to PPE']
 ]}/><Sources items={['Microsoft · FY2026 Annual Report','Alphabet · 3Q26 SEC 10-Q','Amazon · 3Q26 실적','Meta · 3Q26 SEC 10-Q']}/></div>
 <div className="panel"><h3>반도체 공급업체 투자 참고</h3><Table headers={['기업','기간','분기 CAPEX','누계','정의']} rows={supplierCapex.map(x=>[x.company,x.period,x.quarter,x.ytd,x.definition])}/><Sources items={['Samsung Electronics · 3Q26 실적','Micron · FY2026 Q4 및 연간 실적']}/></div>
 <div className="panel"><h3>CAPEX 해석 시 주의사항</h3><Table headers={['기업','기간·정의','비교 주의']} rows={[
  ['Microsoft','FY 종료 6월 · additions to PPE','FY 기준; FY27 Q1 CAPEX에는 finance leases 포함'],
  ['Alphabet','CY · PPE purchases','PPE purchase 기준; 분기·누계는 상단 표 참조'],
  ['Amazon','CY · gross PPE purchases','Gross purchase 기준; net proceeds와 구분'],
  ['Meta','CY · CAPEX incl. finance lease principal','Finance lease 원금 포함 기준'],
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
 <Title eyebrow="05 / COMPANY FINANCIALS" title="주요 반도체 기업 실적" desc="메모리 3사의 2016~2025 연간 실적에 각 사의 최신 공시 분기까지 누적한 실적을 추가해 비교합니다. 매출·영업이익 전환 및 타점별 수치 확인이 가능합니다."/>
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
 <Title eyebrow="06 / LONG-TERM HISTORY" title="장기 반도체 사이클" desc="글로벌 반도체 시장과 메모리 시장의 연간 매출 추이를 실제·추정·전망으로 구분해 장기 사이클을 봅니다."/>
 <TrendPanel title="글로벌 반도체 시장 매출" series={[{name:'SIA annual actual',unit:'USD bn',data:market},{name:'Gartner estimate / forecast',unit:'USD bn',data:marketForecast}]} quarterHeaders={['기간','매출','상태','자료 기준']} quarterRows={[
  ...market.map(x=>[x.year,'$'+x.value.toFixed(1)+'B','Actual','SIA']),
  ...globalQuarterly.map(x=>[x.year,'$'+x.value.toFixed(1)+'B','Actual','SIA quarterly release'])
 ]} note="SIA 2025 actual $791.7B와 Gartner 2025 estimate $809.0B는 서로 다른 출처·시점의 수치입니다. 같은 연도라도 하나로 덮어쓰지 않고 구분해 유지합니다. SIA 2026 Q1~Q3 분기 actual의 단순 합은 $1,219.5B이나 Q2 비교기준 개정 여부를 확인할 때까지 잠정 합산으로만 취급합니다." source={['SIA · 2025년 연간 글로벌 반도체 매출','SIA · 2026년 3분기 글로벌 반도체 매출','Gartner · 2026년 반도체 시장 공개 전망']}/>
 <TrendPanel title="메모리 반도체 시장 매출 전망" series={[{name:'Memory market revenue',unit:'USD bn · estimate/forecast',data:memoryForecast}]} quarterHeaders={['연도','시장 규모','상태']} quarterRows={memoryForecast.map(x=>[x.year,'$'+x.value.toFixed(1)+'B',x.status])} note="연간 시장 규모는 ASP가 아니라 시장 매출 추정·전망치입니다. 2026년 분기 메모리 시장 매출 actual은 동일한 시계열로 확보되지 않아 미확보입니다." source={['Gartner · 2026년 반도체 시장 공개 전망']}/>
 </>}

function Insights(){return <>
 <Title eyebrow="07 / INVESTMENT FRAMEWORK" title="투자 시나리오 & 인사이트" desc="공식 분기 실적·기업 가이던스·공개 메모리 가격·공급투자 신호로 메모리 사이클의 지속성과 위험을 점검합니다. 주가 목표·유료 컨센서스는 사용하지 않습니다."/>
 <div className="grid-3"><div className="scenario bull"><Pill tone="green">BULL CASE</Pill><h3>AI 인프라 투자 지속</h3><p>HBM4 양산 확대, Server DDR5 수요, QLC/eSSD 수요가 공급 증가를 흡수. 삼성은 2027 AI 수요가 업계 공급을 크게 웃돌 것으로 전망.</p><strong>확인 변수: HBM4 출하·서버 DDR5·CAPEX</strong></div><div className="scenario base"><Pill tone="blue">BASE CASE</Pill><h3>성장률 정상화</h3><p>AI 서버 수요는 견조하지만 메모리 가격 부담으로 PC·모바일의 구매량과 교체 수요가 둔화. NAND 기준가격은 최근 보합.</p><strong>확인 변수: NAND 가격·PC OEM 수요·제품 믹스</strong></div><div className="scenario bear"><Pill tone="amber">BEAR CASE</Pill><h3>CAPEX ROI·공급 조정</h3><p>하이퍼스케일러 투자가 매출·현금흐름으로 충분히 회수되지 않거나, 신규 팹·공정전환 공급이 수요를 앞서면 가격과 ASP가 하락할 수 있음.</p><strong>확인 변수: FCF·재고·CAPEX 가이던스</strong></div></div>
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
 const [yieldHistory,setYieldHistory]=useState<Array<{quarter:string;DGS2:number|null;DGS10:number|null;DGS30:number|null}>>([]);
 const [selectedYieldQuarter,setSelectedYieldQuarter]=useState<string|null>(null);
 const [yieldVisibleQuarters,setYieldVisibleQuarters]=useState(8);
 const [yieldError,setYieldError]=useState('');
 const [yieldUpdated,setYieldUpdated]=useState('');
 const [loading,setLoading]=useState(false);
 const [updated,setUpdated]=useState('');
 const [error,setError]=useState('');
 const [expanded,setExpanded]=useState<string|null>(null);
 const inFlight=useRef(false);
 const symbols=useMemo(()=>Array.from(new Set(['^GSPC','^IXIC','^DJI','^RUT','^VIX','NVDA','MSFT','GOOGL','AMZN','META','AAPL','AVGO','TSLA',...MARKET_GROUPS.flatMap(g=>[g.ticker,...g.symbols])])),[]);
 const load=async()=>{
  if(inFlight.current)return;
  inFlight.current=true;
  setLoading(true);setError('');
  try{
   const batches=Array.from({length:Math.ceil(symbols.length/5)},(_,i)=>symbols.slice(i*5,(i+1)*5));
   const merged:Record<string,MarketQuote>={};
   const allErrors:string[]=[];
   let latestYields:Record<string,{value:number;date:string}>={};
   let latestYieldHistory:Array<{quarter:string;DGS2:number|null;DGS10:number|null;DGS30:number|null}>=[];
   try {
    const yieldResponse=await fetch('/api/yields?refresh='+Date.now(),{cache:'no-store'});
    const yieldPayload=await yieldResponse.json();
    if(!yieldResponse.ok||!yieldPayload?.ok) throw new Error(yieldPayload?.error||('HTTP '+yieldResponse.status));
    latestYields=yieldPayload.latest||{};
    latestYieldHistory=Array.isArray(yieldPayload.history)?yieldPayload.history:[];
    setYieldError(latestYieldHistory.length?'':'분기 데이터가 아직 충분하지 않습니다.');
    setYieldUpdated(yieldPayload.updatedAt||'');
   } catch(rateError) {
    setYieldError(rateError instanceof Error?rateError.message:'금리 데이터 요청 실패');
    setYields({});
    setYieldHistory([]);
   }
   for(let i=0;i<batches.length;i+=2){
    const results=await Promise.allSettled(batches.slice(i,i+2).map(async(batch)=>{
     const response=await fetch('/api/market?symbols='+encodeURIComponent(batch.join(','))+'&includeYields=0',{cache:'no-store'});
     const payload=await response.json();
     if(!response.ok)throw new Error(payload?.error||('HTTP '+response.status));
     return payload;
    }));
    for(const result of results){
     if(result.status==='fulfilled'){Object.assign(merged,result.value?.quotes||{});allErrors.push(...(result.value?.errors||[]));}
     else allErrors.push(result.reason instanceof Error?result.reason.message:'시세 묶음 요청 실패');
    }
   }
   setQuotes(merged);
   setYields(latestYields);
   setYieldHistory(latestYieldHistory);
   if(Object.keys(merged).length<8||allErrors.length>0){
    setError('일부 시세를 불러오지 못했습니다. 잠시 후 다시 시도합니다.');
   }
  }catch(e){
   setError('시장 데이터 연결이 원활하지 않습니다. 잠시 후 다시 시도합니다.');
  }finally{
   setUpdated(new Date().toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}));
   setLoading(false);
   inFlight.current=false;
  }
 };
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),300000);return()=>window.clearInterval(id);},[]);
 const fmt=(v:number)=>v.toLocaleString('en-US',{maximumFractionDigits:2});
 const pct=(v:number|null|undefined)=>v==null?'—':(v>0?'+':'')+v.toFixed(2)+'%';
 const tone=(v:number|null|undefined)=>v==null?'flat':v>=1?'strong':v>0?'up':v<=-1?'weak':v<0?'down':'flat';
 const sectorData=MARKET_GROUPS.map(g=>{const list=g.symbols.map(s=>quotes[s]).filter((q):q is MarketQuote=>Boolean(q));const avg=list.length?list.reduce((a,q)=>a+q.change,0)/list.length:null;const fiveList=list.filter(q=>q.change5d!=null);const avg5d=fiveList.length?fiveList.reduce((a,q)=>a+(q.change5d||0),0)/fiveList.length:null;const etf=quotes[g.ticker];return {...g,avg,avg5d,etf,coverage:list.length};}).sort((a,b)=>(b.avg??-999)-(a.avg??-999)); const up=sectorData.filter(g=>(g.avg??0)>0).length;
 const benchmark=quotes['^GSPC']?.change;
 return <><Title eyebrow="08 / GLOBAL MARKET PULSE" title="글로벌 금융시장 & 산업별 강세 지도" desc="미국 주요 지수·빅테크·산업별 대표 종목·국채 금리를 한 화면에서 확인합니다. 초록은 상승, 빨강은 하락이며 모든 주가 수치는 전일 종가 기준 등락률입니다."/>
 <section className="panel market-panel" style={{marginBottom:18,border:"1px solid var(--border)"}}>
  <div className="panel-head"><div><h3>Nasdaq-100 투자 후보 TOP 3</h3><p>밸류에이션 · 구조적 수요 · 영업이익 성장성 · 재무 리스크를 함께 평가한 선별 의견</p></div><span className="pill blue">2026.11.25 기준</span></div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
   <article style={{padding:16,border:"1px solid var(--border)",borderRadius:12,background:"var(--surface-2,rgba(127,127,127,.06))"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><span className="pill blue">1위 · 최우선 검토</span><b style={{fontSize:22}}>GOOGL</b></div>
    <h4 style={{margin:"12px 0 6px"}}>Alphabet</h4>
    <p style={{margin:"0 0 10px",fontSize:13}}>AI를 검색·광고·클라우드·자체 TPU까지 직접 수익화하는 플랫폼 기업</p>
    <div style={{display:"grid",gap:5,fontSize:12}}><div><b>밸류에이션</b> · TTM P/E 14.6배</div><div><b>실적 모멘텀</b> · Q3 매출 +25%, 영업이익 +30%</div><div><b>수요 근거</b> · Google Cloud 매출 +103%, AI 인프라 수요 강세</div></div>
    <p style={{fontSize:12,margin:"10px 0 0",color:"var(--muted,#888)"}}>핵심 위험: AI 검색 전환에 따른 기존 광고 모델 잠식, 반독점 규제, 대규모 AI CAPEX</p>
    <a href="https://www.sec.gov/Archives/edgar/data/1652044/000165204426000080/googexhibit991q32026.htm" target="_blank" rel="noreferrer" style={{fontSize:12}}>Q3 2026 공식 실적 ↗</a> · <a href="https://www.morningstar.com/stocks/an-undervalued-stock-buy-that-even-warren-buffett-likes" target="_blank" rel="noreferrer" style={{fontSize:12}}>Morningstar 가치평가 ↗</a>
   </article>
   <article style={{padding:16,border:"1px solid var(--border)",borderRadius:12,background:"var(--surface-2,rgba(127,127,127,.06))"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><span className="pill">2위 · AI 반도체 공급망</span><b style={{fontSize:22}}>AMAT</b></div>
    <h4 style={{margin:"12px 0 6px"}}>Applied Materials</h4>
    <p style={{margin:"0 0 10px",fontSize:13}}>선단 로직·DRAM·HBM 패키징 투자 확대의 장비 수혜 기업</p>
    <div style={{display:"grid",gap:5,fontSize:12}}><div><b>밸류에이션</b> · TTM P/E 27.7배, Morningstar 4성·공정가치 $570 (11/20)</div><div><b>실적 모멘텀</b> · FY26 Q4 매출 +53% YoY</div><div><b>수요 근거</b> · 회사는 2027년 WFE 시장 +30% 초과 성장 전망</div></div>
    <p style={{fontSize:12,margin:"10px 0 0",color:"var(--muted,#888)"}}>핵심 위험: 반도체 설비투자 사이클, 중국 수출규제, 고객사 팹 증설 지연</p>
    <a href="https://ir.appliedmaterials.com/static-files/14fd85ae-ff29-4756-879c-c899da301ae6" target="_blank" rel="noreferrer" style={{fontSize:12}}>FY26 Q4 실적발표 자료 ↗</a> · <a href="https://www.morningstar.com/stocks/applied-materials-earnings-recap-strong-results-guidance-point-solid-year-ahead" target="_blank" rel="noreferrer" style={{fontSize:12}}>Morningstar 가치평가 ↗</a>
   </article>
   <article style={{padding:16,border:"1px solid var(--border)",borderRadius:12,background:"var(--surface-2,rgba(127,127,127,.06))"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><span className="pill">3위 · 메모리 성장 수혜</span><b style={{fontSize:22}}>MU</b></div>
    <h4 style={{margin:"12px 0 6px"}}>Micron Technology</h4>
    <p style={{margin:"0 0 10px",fontSize:13}}>HBM·서버 DRAM·고성능 SSD 수요 확대에 직접 노출</p>
    <div style={{display:"grid",gap:5,fontSize:12}}><div><b>밸류에이션</b> · TTM P/E 8.4배 (11/24)</div><div><b>실적 모멘텀</b> · FY26 매출 $133.2B vs FY25 $37.4B</div><div><b>수요 근거</b> · FY27 Q1 매출 가이던스 $61.5B ± $1.5B</div></div>
    <p style={{fontSize:12,margin:"10px 0 0",color:"var(--muted,#888)"}}>핵심 위험: 메모리 가격·공급 증설에 따른 이익 변동성. 낮은 PER을 정상화 이익 기준으로 재검증 필요</p>
    <a href="https://investors.micron.com/news/press-release/2026/Micron-Technology-Inc--Reports-Record-Fiscal-Fourth-Quarter-and-Full-Year-2026-Results/default.aspx" target="_blank" rel="noreferrer" style={{fontSize:12}}>FY26 공식 실적·가이던스 ↗</a>
   </article>
  </div>
  <div style={{marginTop:12,fontSize:12,color:"var(--muted,#888)"}}>선정 기준: Nasdaq-100 편입 여부 확인 후 최신 공시 실적, 시장 수요 방향, 이익 성장 가시성, Morningstar의 가치평가 및 최근 밸류에이션을 종합. P/E는 2026.11.24 종가 기준 TTM 수치이며, 서로 다른 회계연도·업종의 배수를 단순 비교하지 않습니다. 순위는 수익률 보장이나 개인별 매수 권유가 아닌 분석 우선순위입니다.</div>
 </section>
 <div className="market-toolbar"><div><span className="market-live-dot"/><b>시장 데이터</b><small>{updated?'최근 확인 '+updated+' (한국시간)':'데이터 확인 중'}</small></div><button className="market-refresh" onClick={()=>void load()} disabled={loading}><Activity size={14}/>{loading?'업데이트 중':'새로고침'}</button></div>
 {error&&<div className="market-warning"><Info size={15}/>{error} · 시세 제공처의 접속 정책에 따라 일부 브라우저에서 제한될 수 있습니다.</div>}
 <div className="market-index-grid">{['^GSPC','^IXIC','^DJI','^RUT','^VIX'].map(s=>{const q=quotes[s];return <div className={'market-index '+(q?'tone-'+tone(s==='^VIX'?-q.change:q.change):'')} key={s}><span>{MARKET_NAMES[s]}</span><strong>{q?fmt(q.price):'—'}</strong><div className="market-index-changes"><div><span>전일 대비</span><b>{q?pct(q.change):loading?'불러오는 중':'미확보'}</b></div><div><span>5일 대비</span><b>{q&&q.change5d!=null?pct(q.change5d):'—'}</b></div></div>{s==='^VIX'&&<small className="market-index-note">변동성 지수 · 상승은 위험 신호</small>}</div>})}</div>
 <section className="panel market-panel"><div className="panel-head"><div><h3>산업별 강세 지도</h3><p>구성 대표 종목의 단순 평균 수익률 기준 · 종목 수익률로 계산한 테마 지표</p></div><span className="pill blue">{up} / {sectorData.length}개 산업 상승</span></div>
 <div className="market-legend"><span><i className="heat-strong"/> 강한 상승 +1% 이상</span><span><i className="heat-up"/> 상승 0~+1%</span><span><i className="heat-flat"/> 보합</span><span><i className="heat-down"/> 하락 0~-1%</span><span><i className="heat-weak"/> 강한 하락 -1% 이하</span></div>
 <div className="market-heatmap">{sectorData.map(g=><button key={g.name} className={'heat-card tone-'+tone(g.avg)} onClick={()=>setExpanded(expanded===g.name?null:g.name)}><span>{g.name}</span><strong>{pct(g.avg)}</strong><small>5일 {pct(g.avg5d)} · {g.ticker} · {g.coverage}/{g.symbols.length}</small><em>{g.avg==null?'데이터 미확보':g.avg>=1?'강한 강세':g.avg>0?'강세':g.avg<=-1?'강한 약세':g.avg<0?'약세':'보합'}</em></button>)}</div>
 {expanded&&(()=>{const g=sectorData.find(x=>x.name===expanded);if(!g)return null;return <div className="market-detail"><div className="market-detail-head"><b>{g.name} 대표 종목</b><span>ETF {g.ticker} {g.etf?pct(g.etf.change):'—'}</span></div><div className="market-stock-list">{g.symbols.map(s=>{const q=quotes[s];return <div key={s}><b>{s}</b><span>{q?fmt(q.price):'—'}</span><strong className={'market-pct tone-'+tone(q?.change)}>{q?pct(q.change):'미확보'}</strong></div>})}</div><small>{g.desc} · 카드를 다시 누르면 접힙니다.</small></div>})()}
 </section>
 <section className="panel market-panel"><div className="panel-head"><div><h3>미국 빅테크 · AI 핵심 종목</h3><p>시가총액 상위 기술기업과 AI 인프라 대표 종목</p></div><span className="pill">USD · 등락률</span></div><div className="market-stock-grid">{['NVDA','MSFT','GOOGL','AMZN','META','AAPL','AVGO','TSLA'].map(s=>{const q=quotes[s];return <div className={'market-stock-card tone-'+tone(q?.change)} key={s}><b>{s}</b><span>{q?fmt(q.price):'—'}</span><div className="market-stock-changes"><div><strong>{q?pct(q.change):'미확보'}</strong><small>전일 대비</small></div><div><strong>{q&&q.change5d!=null?pct(q.change5d):'—'}</strong><small>5일 대비</small></div></div></div>})}</div></section>
 <section className="panel market-panel"><div className="panel-head"><div><h3>미국 국채 금리</h3><p>2년물(단기) · 10년물(중기) · 30년물(장기) | 최근 3년 분기 평균</p></div><a className="market-source" href="https://home.treasury.gov/policy-issues/financing-the-government/interest-rate-statistics" target="_blank" rel="noreferrer">미 재무부 원문 <ExternalLink size={12}/></a></div>
 <div className="market-yield-grid">{[['DGS2','2년물 · 단기'],['DGS10','10년물 · 중기'],['DGS30','30년물 · 장기']].map(([k,n])=><div key={k}><span>{n}</span><strong>{yields[k]?yields[k].value.toFixed(2)+'%':'—'}</strong><small>{yields[k]?.date||'최신 관측치 확인 중'}</small></div>)}</div>
 <div className="market-spread"><span>10년-2년 장단기 금리차</span><b>{yields.DGS10&&yields.DGS2?(yields.DGS10.value-yields.DGS2.value>0?'+':'')+(yields.DGS10.value-yields.DGS2.value).toFixed(2)+'%p':'—'}</b></div>
 <div className="market-yield-history"><div className="rate-section-heading"><div><h4>미국 국채금리 3년 추이</h4><p>2년물·10년물·30년물 분기 평균 · 단위 %</p></div><small>{yieldHistory.length?yieldHistory.length+'개 분기': '데이터 상태 확인'}</small></div><div className="yield-chart-legend"><span><i className="yield-line-2y"/>2년물</span><span><i className="yield-line-10y"/>10년물</span><span><i className="yield-line-30y"/>30년물</span></div>
 {yieldHistory.length>0?(()=>{const w=680,h=270,left=48,right=14,top=16,bottom=38;const chartHistory=yieldHistory.slice(-Math.min(yieldVisibleQuarters,yieldHistory.length));const vals=chartHistory.flatMap(d=>[d.DGS2,d.DGS10,d.DGS30].filter((v):v is number=>v!==null&&Number.isFinite(v)));if(!vals.length)return <div className="market-empty">금리 데이터가 비어 있습니다.</div>;const min=Math.max(0,Math.floor((Math.min(...vals)-0.5)*2)/2);const max=Math.ceil((Math.max(...vals)+0.5)*2)/2;const x=(i:number)=>left+i*(w-left-right)/Math.max(1,chartHistory.length-1);const y=(v:number)=>top+(max-v)*(h-top-bottom)/(max-min||1);const path=(key:'DGS2'|'DGS10'|'DGS30')=>chartHistory.map((d,i)=>d[key]===null?null:x(i)+','+y(d[key] as number)).filter(Boolean).join(' ');const ticks=chartHistory.filter((_,i)=>i%2===0||i===chartHistory.length-1);const selectedIndex=yieldHistory.findIndex(d=>d.quarter===selectedYieldQuarter);const selected=selectedIndex>=0?yieldHistory[selectedIndex]:null;const previous=selected&&selectedIndex>0?yieldHistory[selectedIndex-1]:null;const delta=(key:'DGS2'|'DGS10'|'DGS30')=>selected&&previous&&selected[key]!=null&&previous[key]!=null?selected[key]!-previous[key]!:null;const fmtDelta=(v:number|null)=>v===null?'비교 불가':(v>0?'+':'')+v.toFixed(2)+'%p';return <><div className="yield-zoom-control"><div className="yield-zoom-label"><b>그래프 표시 구간</b><strong>최근 {Math.min(yieldVisibleQuarters,yieldHistory.length)}개 분기</strong></div><input aria-label="금리 그래프 표시 분기 수" type="range" min="4" max={Math.max(4,yieldHistory.length)} step="1" value={Math.min(yieldVisibleQuarters,yieldHistory.length)} onChange={e=>setYieldVisibleQuarters(Number(e.target.value))}/><div className="yield-zoom-range"><span>최근 4개 분기</span><span>전체 {yieldHistory.length}개 분기</span></div></div><svg viewBox={'0 0 '+w+' '+h} role="img" aria-label="최근 3년 미국 국채 2년물 10년물 30년물 분기 평균 금리 추이. 타점을 누르면 해당 분기와 전 분기 대비 변화량을 확인할 수 있습니다." style={{width:'100%',height:'auto',display:'block',touchAction:'pan-y'}}>{Array.from({length:5},(_,i)=>{const v=min+(max-min)*i/4;return <g key={i}><line x1={left} x2={w-right} y1={y(v)} y2={y(v)} stroke="currentColor" opacity=".16" strokeDasharray="3 4"/><text x={left-8} y={y(v)+4} textAnchor="end" fill="currentColor" opacity=".75" fontSize="11">{v.toFixed(1)}</text></g>})}<polyline points={path('DGS2')} fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/><polyline points={path('DGS10')} fill="none" stroke="#34D399" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/><polyline points={path('DGS30')} fill="none" stroke="#FBBF24" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>{ticks.map(d=>{const i=yieldHistory.indexOf(d);return <text key={d.quarter} x={x(i)} y={h-9} textAnchor="middle" fill="currentColor" opacity=".75" fontSize="10">{d.quarter}</text>})}{chartHistory.map((d,i)=><g key={'hit-'+d.quarter} onClick={()=>setSelectedYieldQuarter(d.quarter)} style={{cursor:'pointer'}}><rect x={x(i)-Math.max(10,(w-left-right)/Math.max(1,chartHistory.length-1)/2)} y={top} width={Math.max(20,(w-left-right)/Math.max(1,chartHistory.length-1))} height={h-top-bottom+4} fill="transparent"/>{(['DGS2','DGS10','DGS30'] as const).map((key,j)=>d[key]===null?null:<circle key={key} cx={x(i)} cy={y(d[key]!)} r={selectedYieldQuarter===d.quarter?5:3.5} fill={j===0?'#60A5FA':j===1?'#34D399':'#FBBF24'} stroke={selectedYieldQuarter===d.quarter?'currentColor':'none'} strokeWidth="1.5"/>)}{selectedYieldQuarter===d.quarter&&<line x1={x(i)} x2={x(i)} y1={top} y2={h-bottom} stroke="currentColor" opacity=".45" strokeDasharray="3 3"/>}</g>)}</svg><div className="yield-point-hint">그래프의 분기별 타점을 누르면 해당 분기 금리와 전 분기 대비 증감량이 표시됩니다.</div>{selected&&<div className="yield-quarter-detail"><div className="yield-quarter-title"><b>{selected.quarter} 분기 평균</b><small>{previous?previous.quarter+' 대비':'첫 관측 분기 · 이전 분기 비교 없음'}</small></div><div className="yield-quarter-grid">{([{key:'DGS2',label:'2년물 · 단기',color:'#60A5FA'},{key:'DGS10',label:'10년물 · 중기',color:'#34D399'},{key:'DGS30',label:'30년물 · 장기',color:'#FBBF24'}] as const).map(item=><div key={item.key}><span><i style={{background:item.color}}/>{item.label}</span><strong>{selected[item.key]===null?'—':selected[item.key]!.toFixed(2)+'%'}</strong><small>전 분기 대비 <b>{fmtDelta(delta(item.key))}</b></small></div>)}</div></div>}</>})():<div className="market-empty"><b>금리 그래프 데이터를 불러오지 못했습니다.</b><span>{yieldError||'API 응답에 유효한 분기 데이터가 없습니다.'}</span><a href="/api/yields" target="_blank" rel="noreferrer">금리 API 응답 직접 확인</a></div>}<small className="yield-updated">{yieldUpdated?'데이터 확인 '+new Date(yieldUpdated).toLocaleString('ko-KR'):'미 재무부 데이터 연결 상태를 확인 중입니다.'}</small></div>
 <div className="market-rate-outlook"><h4>FOMC 일정 및 금리 전망</h4><div className="rate-current"><div><b>현재 기준금리</b><small>2026년 10월 28일 결정 기준</small></div><strong>3.75~4.00%</strong></div><h5>향후 FOMC 일정</h5><div className="table-wrap"><table className="rate-data-table"><thead><tr><th>회의</th><th>일정</th><th>비고</th></tr></thead><tbody><tr><td>2026년 12월</td><td>12.08~09</td><td>금리 결정</td></tr><tr><td>2027년 1월</td><td>01.26~27</td><td>금리 결정</td></tr><tr><td>2027년 3월</td><td>03.16~17</td><td>SEP 발표</td></tr><tr><td>2027년 6월</td><td>06.08~09</td><td>SEP 발표</td></tr><tr><td>2027년 9월</td><td>09.14~15</td><td>SEP 발표</td></tr><tr><td>2027년 10월</td><td>10.26~27</td><td>정책전략 논의</td></tr><tr><td>2027년 11월</td><td>11.16~17</td><td>금리 결정</td></tr></tbody></table></div><h5>연준 점도표 중간값</h5><div className="table-wrap"><table className="rate-data-table"><thead><tr><th>시점</th><th>정책금리 전망</th></tr></thead><tbody><tr><td>2026년 말</td><td>4.1%</td></tr><tr><td>2027년 말</td><td>4.1%</td></tr><tr><td>2028년 말</td><td>3.9%</td></tr><tr><td>2029년 말</td><td>3.6%</td></tr><tr><td>장기 중립금리</td><td>3.2%</td></tr></tbody></table></div><p className="rate-summary">점도표는 FOMC 위원들의 조건부 전망이며 확정된 금리 경로가 아닙니다. 실제 결정은 물가·고용·성장률 등 새로 발표되는 지표에 따라 달라집니다.</p><div className="rate-links"><a href="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" target="_blank" rel="noreferrer">FOMC 공식 일정 <ExternalLink size={11}/></a><a href="https://www.federalreserve.gov/monetarypolicy/fomcprojtabl20260916.htm" target="_blank" rel="noreferrer">9월 점도표 원문 <ExternalLink size={11}/></a></div></div></section>
 <section className="panel market-panel"><div className="panel-head"><div><h3>시장 해석 · 상대강도</h3><p>시장 전체 대비 산업별 당일 성과 차이</p></div></div><div className="market-readthrough"><div><span>S&P 500</span><b className={'tone-'+tone(benchmark)}>{pct(benchmark)}</b></div><div><span>상승 산업</span><b>{up} / {sectorData.length}</b></div><div><span>최강 산업</span><b>{sectorData[0]?.name||'—'}</b><small>{pct(sectorData[0]?.avg)}</small></div><div><span>최약 산업</span><b>{sectorData[sectorData.length-1]?.name||'—'}</b><small>{pct(sectorData[sectorData.length-1]?.avg)}</small></div></div>
 <div className="table-wrap"><table className="market-rank-table"><thead><tr><th>산업</th><th>1일</th><th>5일</th><th>S&P 대비</th><th>상태</th></tr></thead><tbody>{sectorData.map(g=><tr key={g.name}><td>{g.name}</td><td className={'tone-'+tone(g.avg)}>{pct(g.avg)}</td><td className={'tone-'+tone(g.avg5d)}>{pct(g.avg5d)}</td><td className={'tone-'+tone(g.avg!=null&&benchmark!=null?g.avg-benchmark:null)}>{g.avg!=null&&benchmark!=null?pct(g.avg-benchmark):'—'}</td><td><span className={'market-status tone-'+tone(g.avg)}>{g.avg==null?'미확보':g.avg>=1?'강세 ↑':g.avg<=-1?'약세 ↓':g.avg>0?'상승':g.avg<0?'하락':'중립'}</span></td></tr>)}</tbody></table></div></section>
 <div className="market-footnote"><b>데이터·해석 기준</b><p>주가: Yahoo Finance 공개 차트 데이터(전일 종가 대비). 산업별 평균: 표시된 대표 종목들의 단순 평균이며 공식 업종지수와 다릅니다. 산업별 ETF는 참고용입니다. 국채 금리: 미국 재무부 Daily Treasury Par Yield Curve Rates 공식 XML의 2년물·10년물·30년물 일별 관측치와 최근 3년 분기 평균입니다. 5거래일 수익률은 각 종목의 최근 5개 거래일 데이터가 충분할 때만 표시합니다. 투자 추천이 아닌 시장 모니터링 자료입니다.</p><div className="market-source-links"><a href="https://finance.yahoo.com/" target="_blank" rel="noreferrer">Yahoo Finance <ExternalLink size={11}/></a><a href="https://fred.stlouisfed.org/" target="_blank" rel="noreferrer">FRED <ExternalLink size={11}/></a><a href="https://home.treasury.gov/resource-center/data-chart-center/interest-rates" target="_blank" rel="noreferrer">U.S. Treasury <ExternalLink size={11}/></a></div></div>
 </>;
}

function App(){
 const [active,setActive]=useState<Section>(()=>{const tab=new URLSearchParams(window.location.search).get('tab');return menu.some(m=>m.id===tab)?tab as Section:'overview'});
 const [period,setPeriod]=useState<Period>('3Y');
 const [demandWeight,setDemandWeight]=useState(60);
 const [mobileOpen,setMobileOpen]=useState(false);
 const current=menu.find(m=>m.id===active)!;
 const render=()=>{switch(active){
  case'overview':return <Overview period={period} setPeriod={setPeriod} demandWeight={demandWeight}/>;
  case'pricing':return <Pricing/>;
  case'demand':return <Demand demandWeight={demandWeight} setDemandWeight={setDemandWeight}/>;
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
   <header className="topbar"><div className="top-left"><button className="menu-button" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><span>대시보드 / <b>{current.label}</b></span></div><div className="top-actions"><div className="date-label"><CalendarDays size={15}/> 정적 데이터는 항목별 기준일 · 환산 환율 1 USD = 1,344.23원 (2026.11.25)</div><button className="share-button" onClick={()=>navigator.clipboard?.writeText(window.location.href)}><ExternalLink size={15}/> 링크 공유</button></div></header>
   <div className="content">{render()}<footer><div><b>SI · Semiconductor Intelligence</b><span>공개자료 기반 반도체 산업 분석 대시보드</span></div><span>실적 / 추정 / 전망 / 미확보 · v1.1</span></footer></div>
  </main>
 </div>;
}
export default App;
