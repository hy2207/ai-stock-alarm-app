# AI Stock Alarm UI/UX Prototype

`ai-stock-alarm-app`은 AI Stock Alarm의 **랜딩페이지 + 서비스 프로토타입**입니다.

목표는 사용자가 미국주식 정보를 오래 탐색하지 않고, 관심종목 기준으로 **오늘 살지, 팔지, 기다릴지**를 빠르게 판단할 수 있는지 검증하는 것입니다.

## Current Position

현재 구조는 랜딩페이지를 서비스 전면에 두고, CTA를 통해 실제 프로토타입 홈으로 진입하는 방식입니다.

```text
랜딩페이지(#/)
  -> CTA
  -> 서비스 홈(#/app)
  -> 추천 상세(#/recommendations/:id)

서비스 홈(#/app)
  -> 이력(#/archive)
  -> 설정(#/settings)
  -> 상태 화면 테스트(#/state/*)
```

랜딩페이지는 체크리스트 평가 기준상 **C 유형, 결과 지향형 자동화 솔루션**으로 설계되어 있습니다.

- 핵심 메시지: “미국주식 판단을 아침 3분 안에 끝내세요”
- 핵심 구조: 관심종목 입력 -> AI 판단 엔진 -> 의사결정 카드
- 핵심 전환: CTA 클릭 후 현재 구현된 서비스 홈으로 이동
- 핵심 차별점: 직접 리서치 45-90분을 3분 점검으로 압축한다는 효율성 수치

## What This Prototype Validates

이 앱은 실제 백엔드가 붙기 전, 다음 UX를 빠르게 검증하기 위한 React + Vite 기반 독립형 데모입니다.

- 랜딩페이지가 고객 Hook 단계로 충분히 작동하는지
- CTA를 통해 기존 서비스 홈으로 자연스럽게 진입하는지
- 온보딩에서 관심 종목/섹터를 선택하는 흐름이 이해되는지
- 홈에서 1-3개 의사결정 카드로 판단이 압축되는지
- 상세에서 차트 없이 가격, 기간, 근거, 성과를 읽을 수 있는지
- Confidence Score 변경이 추천 숫자와 액션 감각에 반영되는지
- 성공뿐 아니라 실패 이력까지 보여주는 Trust Layer가 납득되는지

## Product Principles

### Decision Layer

뉴스 요약 앱이 아니라, 사용자가 바로 판단 가능한 행동 카드 중심 UI를 지향합니다.

### Chartless UI

상세 화면의 핵심 폴드에 차트, RSI, MACD 같은 원본 지표를 두지 않습니다. 방향, 진입가, 목표가, 손절가, 보유 기간, 한 줄 이유를 먼저 보여줍니다.

### Risk Choice UX

Confidence Score는 단순 배지가 아니라 사용자가 직접 선택하는 리스크 기준입니다. `안정형 / 중립형 / 공격형` 변경 시 추천 숫자와 액션이 함께 바뀝니다.

### Trust Layer

성공 이력만 보여주지 않습니다. 실패 기록, 평균 수익률, 데이터 부족 상태를 함께 보여주는 구조를 유지합니다.

## Landing Page Strategy

랜딩페이지는 다음 체크리스트를 기준으로 구성되었습니다.

### Core Essentials

- 히어로: 고객이 얻을 최종 이득을 “아침 3분”으로 명확히 제시
- CTA: 상단, 히어로, 중단, 결과 갤러리, 하단에 반복 배치
- Social Proof: 3분, 1장, 0개, 3단계 지표와 NASDAQ, SEC EDGAR, FRED 등 참고 데이터 신호 배치
- Value Proposition: 기능 나열보다 “판단 시간 단축”, “리스크 기준 반영”, “아침 브리핑”이라는 혜택 중심으로 설명

### C Type Elements

- Input-Output Diagram: 관심종목 입력 -> AI 판단 엔진 -> 의사결정 카드
- Outcome Showcase: NVDA, AAPL, TSLA 결과 카드 샘플
- Efficiency Graph: 직접 리서치 45-90분 vs AI Stock Alarm 3분

평가 문서:

- [랜딩페이지 최종 평가 문서](./docs/landing-page-checklist-evaluation.md)

평가 요약:

- 서비스 유형: C 유형, 결과 지향형
- 종합 점수: 49/60
- 최종 판정: 전환을 유도할 수 있는 구조는 갖췄고, 신뢰 증거를 보강하면 설득력이 크게 올라감
- 최우선 개선점: 실제 사용자 수, 누적 카드 수, 사용자 후기, 데이터 검증 방식 등 신뢰 증거 보강

## Design Direction

랜딩페이지와 앱 내부 화면은 같은 시각 언어로 정렬되어 있습니다.

- 배경: `#f7f8f5`
- 카드: 흰색 배경, 얇은 slate border, 8px radius
- CTA: 파란색 primary button 중심
- 브랜드: 검정 로고 블록과 절제된 타이포그래피
- 의미 색상: BUY/성공은 emerald, SELL/실패는 rose, 중립 상태는 amber/slate

이전의 과한 그라데이션, 큰 라운딩, 반투명 카드 스타일은 제거하고, 랜딩과 서비스 화면이 하나의 제품처럼 보이도록 정리했습니다.

## Current App Flow

```text
랜딩
  -> 무료 데모로 시작하기 / 오늘 카드 보기
  -> 홈

로그인
  -> 온보딩(관심 종목/섹터 최대 3개 선택)
  -> 홈

홈
  -> Confidence Score 변경
  -> 추천 카드 상세
  -> 이력
  -> 설정

설정
  -> 관심 항목 수정
  -> 기본 리스크 성향 변경
  -> 푸시 수신 토글
  -> 상태 화면 테스트
```

## Routes

현재 프로토타입은 브라우저 라우터 대신 hash route를 사용합니다.

| Route | 화면 |
| --- | --- |
| `#/` | 랜딩페이지 |
| `#/login` | 로그인 |
| `#/onboarding` | 온보딩 |
| `#/app` | 서비스 홈 |
| `#/recommendations/:id` | 추천 상세 |
| `#/archive` | 추천 이력 |
| `#/settings` | 설정 |
| `#/state/no-call` | No Call 상태 |
| `#/state/loading` | Loading 상태 |
| `#/state/empty` | Empty 상태 |
| `#/state/error` | Error 상태 |

## State Management

전역 상태는 [AppContext.tsx](./src/app/context/AppContext.tsx)에서 관리합니다.

- `isLoggedIn`
- `watchlist`
- `riskProfile`
- `pushEnabled`
- `debugEvents`

핵심 사용자 설정은 브라우저 `localStorage`에 임시 저장됩니다. 실제 제품에서는 이 부분이 `NextAuth + Prisma + Server Actions` 기반으로 대체될 예정입니다.

## Backend Integration Assumptions

실제 제품 전환 시 다음 연결을 상정합니다.

| 영역 | 현재 프로토타입 | 실제 제품 방향 |
| --- | --- | --- |
| 인증 | localStorage 기반 데모 로그인 | NextAuth |
| 관심 항목 저장 | context + localStorage | Server Action + Prisma |
| 리스크 성향 저장 | context + localStorage | Server Action + session restore |
| 추천 카드 | `mockData.ts` | LLM pipeline + DTO validation |
| 추천 조회 | client mock data | Query/RSC + persisted recommendation |
| 푸시 | UI 시뮬레이션 | OneSignal |
| 행동 이벤트 | Debug Panel | PostHog |

## Key Files

- [App.tsx](./src/app/App.tsx): hash route 기반 루트 라우터
- [routes.ts](./src/app/routes.ts): 라우트 상수와 정규화 로직
- [LandingPageV2.tsx](./src/app/pages/LandingPageV2.tsx): 고객 Hook용 랜딩페이지
- [HomePageV2.tsx](./src/app/pages/HomePageV2.tsx): 서비스 홈
- [RecommendationCard.tsx](./src/app/components/RecommendationCard.tsx): 홈 추천 카드
- [RecommendationDetailPageV2.tsx](./src/app/pages/RecommendationDetailPageV2.tsx): 추천 상세
- [ArchivePageV2.tsx](./src/app/pages/ArchivePageV2.tsx): 추천 이력
- [SettingsPageV2.tsx](./src/app/pages/SettingsPageV2.tsx): 설정
- [OnboardingPageV2.tsx](./src/app/pages/OnboardingPageV2.tsx): 관심 종목/섹터 선택
- [LoginPageV2.tsx](./src/app/pages/LoginPageV2.tsx): 로그인/데모 진입
- [StatePageV2.tsx](./src/app/pages/StatePageV2.tsx): 상태 화면
- [mockData.ts](./src/app/mockData.ts): 추천/성과/사용자 목업 데이터

## Documents

- [PRD v1](./docs/PRD_v1.md)
- [SRS v1](./docs/SRS-v1.md)
- [Landing Page Checklist Evaluation](./docs/landing-page-checklist-evaluation.md)

## Run

```bash
npm install
npm run dev
```

Vite 기본 개발 서버에서 실행됩니다.

```text
http://localhost:5173/#/
```

## Build

```bash
npm run build
```

최근 검증 결과:

- `npm run build` 통과

## Review Checklist

1. `#/`에서 랜딩 메시지와 CTA가 3초 안에 이해되는지 확인
2. 히어로 CTA 클릭 시 `#/app` 서비스 홈으로 이동하는지 확인
3. 홈에서 Confidence Score 변경 시 카드 숫자와 액션이 바뀌는지 확인
4. 추천 상세에서 차트 없이 판단 정보가 충분한지 확인
5. 이력에서 성공/실패/평가 중 상태가 명확한지 확인
6. 설정에서 관심 항목과 리스크 성향을 바꾼 뒤 새로고침해도 상태가 유지되는지 확인
7. 상태 화면 테스트와 Debug Panel로 예외 흐름을 확인

## Known Gaps

- 랜딩페이지의 Social Proof는 아직 실제 사용자 수나 리뷰가 아닌 설계 지표와 데이터 소스 신호 중심입니다.
- Outcome Showcase는 정적 샘플 카드이며, 실제 앱 캡처나 영상 데모가 아닙니다.
- 45-90분 리서치 절감 수치는 베타 검증 전 가설성 메시지로, 실제 데이터 확보 후 재조정해야 합니다.
- 투자 관련 신뢰 강화를 위해 추천 생성 기준, 데이터 지연 가능성, 면책 문구를 더 구조화할 필요가 있습니다.
