# Weather App (Vite + React + TypeScript)

한국 행정구역 기반의 반응형 날씨 SPA입니다. 브라우저 Geolocation과 Open-Meteo API를 사용해 현재 기상, 시간별/일별 예보, 환경(일출/일몰, UV, PM) 정보를 제공합니다. 프로젝트는 Feature-Sliced Design(FSD)으로 구성되어 유지보수와 확장에 용이합니다.

---

## 한눈에 보기

- 핵심: 위치 자동 감지 · 한국 중심 검색 · 시간/일별 예보 · 환경 데이터 · 즐겨찾기
- 실행: Node.js v18+, pnpm 권장
- 주요 파일: [src/shared/api/weather.ts](src/shared/api/weather.ts), [src/shared/api/location.ts](src/shared/api/location.ts), [src/shared/lib/useFavorites.ts](src/shared/lib/useFavorites.ts)
- 배포(데모): https://weather-app-pr.vercel.app/

---

## 구현 기능 요약

- 위치 자동 감지 — `useGeolocation` 훅으로 초기 위치 설정 ([src/shared/lib/useGeolocation.ts](src/shared/lib/useGeolocation.ts))
- 스마트 검색 — `korea_districts.json` 로컬 인덱스 우선, 폴백으로 Open-Meteo/Nominatim ([src/shared/api/location.ts](src/shared/api/location.ts))
- 정밀 예보 — 현재/시간별/일별 데이터 및 그래프 ([src/widgets/weather-dashboard])
- 환경 데이터 — 일출/일몰, UV, PM10/PM2.5 최신값 ([src/shared/api/weather.ts#getEnvironmental])
- 즐겨찾기 — LocalStorage 기반 최대 6개, 실시간 동기화 훅 ([src/shared/lib/useFavorites.ts](src/shared/lib/useFavorites.ts))
- 성능 최적화 — `React.lazy`/`Suspense` 지연 로드, 입력 디바운스 (`useDebounce`)

---

## 기술 스택

| 분류             | 주요 기술                              |
| ---------------- | -------------------------------------- |
| Framework / 언어 | React 19, TypeScript, Vite             |
| 데이터/상태      | @tanstack/react-query, axios           |
| 스타일링/아이콘  | Tailwind CSS, lucide-react             |
| 라우팅/유틸      | react-router-dom, clsx, tailwind-merge |

---

## 프로젝트 실행

필수: Node.js v18+, pnpm 권장

설치 및 개발

```bash
pnpm install
pnpm dev
```

빌드 및 미리보기

```bash
pnpm build
pnpm preview
```

사용한 스크립트

- `pnpm run generate:district-index` — 행정구역 인덱스 생성 (scripts/ 폴더)
- `pnpm run generate:district-coords` — 좌표 데이터 생성

개발 서버 기본 주소: http://localhost:5173

---

## 코드 구조(요약)

- `src/app/` — 앱 엔트리, Provider 설정
- `src/pages/` — 화면 컴포넌트 (HomePage)
- `src/widgets/` — 대시보드, 즐겨찾기 등 재사용 위젯
- `src/features/` — 검색/즐겨찾기 등 상호작용 로직
- `src/entities/` — 도메인별 UI 컴포넌트
- `src/shared/` — API 클라이언트, 훅, 유틸, 공통 UI
- `public/` — 정적 파일 (korea_districts.json 포함)

주요 참조 파일

- [src/shared/api/weather.ts](src/shared/api/weather.ts) — 기상/환경 데이터 로직
- [src/shared/api/location.ts](src/shared/api/location.ts) — 로컬 인덱스 및 지오코딩
- [src/shared/lib/useFavorites.ts](src/shared/lib/useFavorites.ts) — 즐겨찾기 훅

---

## 기술적 의사결정 및 이유 (상세)

- 아키텍처: Feature-Sliced Design (FSD)
  - 이유: 도메인(엔티티)·기능(피처)·UI(위젯)를 분리하여 파일/폴더 수준에서 책임을 명확히 함으로써 기능 확장과 리팩토링 시 영향을 최소화합니다.
  - 구현 포인트: `src/widgets`, `src/features`, `src/entities`, `src/shared` 계층을 통해 각 책임을 분리했습니다. 이로 인해 UI 재사용성이 높아지고, 테스트와 코드리뷰가 용이해집니다.

- 데이터 페칭 & 캐싱: @tanstack/react-query
  - 이유: 기상 데이터는 빈번한 갱신과 네트워크 실패 가능성이 있으므로 캐싱, 재시도, 로딩/에러 상태 관리를 선언적으로 처리하는 것이 유리합니다.
  - 구현 포인트: `src/shared/api/queryClient.ts`에서 기본 옵션(`staleTime`, `retry`, `refetchOnWindowFocus` 등)을 설정해 불필요한 네트워크 호출을 줄였습니다. 필요한 경우 쿼리별로 `staleTime`을 조정해실시간성 vs 비용을 균형있게 관리합니다.

- 검색 전략: 로컬 인덱스 우선 → 지오코딩 폴백
  - 이유: 한국 사용자를 주 타깃으로 하는 만큼, 로컬에 `korea_districts.json`을 두어 초고속 자동완성을 제공합니다. 네트워크 호출은 필요한 경우에만 수행해 비용과 응답 지연을 줄입니다.
  - 구현 포인트: `src/shared/api/location.ts`는 토큰화/정규화(normalize) 기반 매칭 로직, 후보 변형(공백/접미사/역순 등)과 `geocodeCache`를 통해 안정적 결과를 선택합니다. 폴백으로 Open-Meteo 지오코딩 및 Nominatim을 사용해 커버리지를 확보합니다.
  - 트레이드오프: 로컬 인덱스는 최신 행정구역 변경·이름 표기에 취약하므로 정기적 인덱스 갱신 스크립트(`scripts/`)를 제공합니다.

- 위치/사용자 경험: 브라우저 Geolocation
  - 이유: 첫 방문 시 사용자의 현재 위치로 빠르게 날씨를 보여주기 위해 Geolocation을 사용합니다. 비동의 시 검색으로 자연스럽게 전환됩니다.
  - 구현 포인트: `src/shared/lib/useGeolocation.ts`는 지원 여부와 에러를 구분해 UI에 반영합니다.

- 즐겨찾기 설계 (LocalStorage 기반)
  - 이유: 간단한 UX 요구(최대 6개 즐겨찾기)를 위해 서버 동기화 없이 로컬 저장을 선택해 복잡도를 낮추고 오프라인 사용성을 확보했습니다.
  - 구현 포인트: `src/shared/lib/useFavorites.ts`는 전역 캐시와 리스너 패턴으로 여러 컴포넌트 간 상태 동기화를 구현하고, id는 `lat-lon` 조합으로 생성합니다. 저장 실패(스토리지 예외) 대비 복구 로직을 포함합니다.
  - 트레이드오프: 사용자 계정 간 동기화가 없으므로 여러 기기 동기화가 필요하면 향후 백엔드 연동이 필요합니다.

- 기상 API 선택 및 데이터 매핑
  - 이유: Open-Meteo는 무료로 시간/일별·환경 데이터를 제공하기 때문에 초기 개발과 비용 효율성 면에서 적합합니다. 지오코딩은 Open-Meteo 우선, 결과 부족 시 Nominatim 폴백을 사용합니다.
  - 구현 포인트: `src/shared/api/weather.ts`에서 WMO(세계기상기구) 코드와 아이콘/한글 설명을 맵핑하는 `mapWmoCodeToWeather`를 구현해 UI에 일관된 텍스트와 아이콘을 제공합니다. 환경 데이터(`getEnvironmental`)는 옵션 필드(PM2.5/PM10 등)를 안전하게 처리합니다.

- 성능 최적화
  - 지연 로딩: `React.lazy` + `Suspense`로 대형 위젯(예: `WeatherDashboard`)을 분리해 초기 번들 크기 및 LCP를 개선했습니다.
  - 입력 UX: 검색 입력에 `useDebounce`를 적용해 불필요한 검색 호출을 줄였습니다.
  - 렌더 최적화: 불필요한 재렌더를 줄이기 위해 컴포넌트가 받는 props를 단순화하고, 필요 시 `memo` 적용 여지가 있습니다.

---
