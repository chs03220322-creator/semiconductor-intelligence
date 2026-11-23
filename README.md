# Semiconductor Intelligence

원본 AppDeploy 프로젝트 `semiconductor-intelligence-4hw5wk`의 대시보드 소스를 GitHub로 이전한 저장소입니다.

## 보존한 원본 구성
- React/Vite 앱과 8개 메뉴: 산업 사이클, 제품별 가격, AI 수요·데이터센터, 빅테크 투자, 기업 실적, 장기 사이클, 투자 시나리오, 데이터 출처·방법론
- 메모리 업황 점수, 7개 지표, 가중치, 근거 설명, 미확보 데이터 처리 및 산식
- DRAM 16Gb·8Gb, NAND 128Gb 가격 series 및 2025 가격 series
- 글로벌 반도체 매출, 메모리 시장 전망, IEA 데이터센터 전력, TSMC·NVIDIA 연간/분기 실적
- 하이퍼스케일러 CAPEX 연간 actual, 분기 actual, YTD, 회계기간·CAPEX 정의
- 삼성전자·SK hynix·Micron·TSMC·NVIDIA 재무 actual과 전망
- 장기 사이클 및 투자 시나리오, 출처 링크, 데이터 품질·방법론 주의사항
- 원본 반응형 UI, 차트, 표, 기간 선택, 모바일 내비게이션
- 원본 UI 테스트 명세

## 저장소 구조
- `src/App.tsx`, `src/index.css`, `src/main.tsx`: 원본 대시보드 화면 및 스타일
- `tests/tests.json`: 원본 UI 테스트 명세
- `archive/appdeploy-backend/`: 원본 AppDeploy 구독/realtime backend 보존본

## 로컬 실행
- Node.js 22 이상
- `npm install`
- `npm run dev`
- 프로덕션 빌드: `npm run build`

## Cloudflare Pages 배포
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

## 데이터 관련 중요사항
이번 이전은 원본 소스와 원본 데이터 스냅샷을 보존하는 작업입니다. 원본의 수치, 환율 가정, Actual/Estimate/Forecast 표기, 회계연도 구분, 출처 및 결측 처리 규칙을 임의로 재작성하지 않았습니다. 데이터는 원본 앱 스냅샷의 기준 시점에 해당하므로, 현재 시점의 최신 수치로 간주하기 전에 각 원문 발표를 재검증하고 갱신해야 합니다.

## Backend
원본 realtime 구독 backend는 `archive/appdeploy-backend/`에 보존했습니다. Cloudflare Pages 정적 호스팅에서는 AppDeploy SDK backend를 실행하지 않습니다. 원본 대시보드 UI와 정적 데이터 탐색 기능을 보존한 것이며, AppDeploy 전용 realtime API는 Cloudflare 배포 기능으로 이식된 것이 아닙니다.