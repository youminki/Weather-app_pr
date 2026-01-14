# Weather App (Vite + React + TypeScript)

간단한 한국 지역 대상의 반응형 날씨 웹 애플리케이션입니다. Feature-Sliced Design(FSD)으로 구조화되어 확장성과 유지보수성에 중점을 두었습니다.

---

## 소개

이 저장소는 브라우저의 위치 정보 및 외부 기상 API(Open-Meteo)를 사용해 현재 날씨와 시간별/일별 예보를 보여주는 SPA입니다. 지역 검색(한국 행정구역 데이터 포함), 즐겨찾기(최대 6개), 애플리케이션 레벨 캐시 및 UI 최적화를 포함합니다.

---

## 요구사항

- Node.js v18+ (권장)
- pnpm (권장) 또는 npm/yarn

---

## 빠른 시작

1. 의존성 설치

```bash
pnpm install
# 또는
# npm install
# yarn
```

2. 개발 서버 실행

```bash
pnpm dev
# npm run dev
```

3. 빌드

```bash
pnpm build
```

4. 프로덕션 미리보기

```bash
pnpm preview
```

브라우저에서 http://localhost:5173 를 열어 확인하세요.

---

## 구현된 기능

- **현재 위치 자동 감지**: 브라우저 Geolocation API를 이용해 사용자의 현재 위치를 찾아 초기 위치로 설정합니다.
- **지역 검색 (한국 중심)**: `src/shared/assets/korea_districts.json`을 활용한 빠른 로컬 검색 및 Open-Meteo 지오코딩 API로의 폴백 검색을 제공합니다.
- **즐겨찾기**: 최대 6개까지 즐겨찾기를 저장 가능하며 LocalStorage에 영구 저장됩니다. 별칭(alias) 수정 기능 제공.
- **상세 날씨 정보**: 현재 기온, 체감온도, 최저/최고 기온, 풍속, 시간별 예보(24시간), 일별 요약 제공.
- **환경 데이터**: 일출/일몰, UV 지수, 가능한 경우 PM2.5/PM10(소스에 따라 제공) 가져오기.
- **지연 로딩 및 코드분할**: `React.lazy` + `Suspense`를 사용해 대형 위젯(`WeatherDashboard`)을 동적 로드합니다.
- **반응형 UI 및 스타일**: Tailwind CSS를 이용한 모던 UI(Glassmorphism 일부 적용).

---

## 기술적 의사결정 및 이유

### 1) SPA + CSR 선택 (현재 구현 방식)

- 이 프로젝트는 Vite 기반의 SPA로 구현되어 있으며, 브라우저 전용 API(Geolocation 등)를 적극 사용합니다. 따라서 CSR이 가장 단순하고 실용적입니다.

### 2) Feature-Sliced Design (FSD)

- 컴포넌트와 도메인 경계를 명확히 해 유지보수성과 확장성을 확보하기 위해 FSD를 적용했습니다. 화면 단위, 위젯, 엔티티, 공통 유틸로 책임을 분리했습니다.

### 3) 데이터 페칭과 캐싱: Tanstack Query

- 서버 상태(기상 API 응답)는 캐싱, 리패칭, 로딩/에러 상태 처리가 필요해 Tanstack Query를 사용했습니다. 별도 전역 상태관리 라이브러리 없이도 서버 상태를 효율적으로 관리할 수 있습니다.

### 4) API 선정: Open-Meteo + Nominatim 폴백

- Open-Meteo는 무료로 기상/지오코딩 데이터를 제공해 초기 개발과 배포에 적합합니다. 일부 지역 대응이 부족할 경우 Nominatim을 폴백으로 사용합니다.

### 5) 코드분할과 지연로딩

- 초기 번들 크기를 줄이기 위해 `React.lazy`로 대형 위젯을 분리했습니다. 또한 Vite(Rollup) 설정에서 수동 청크(`manualChunks`)를 적용하면 번들 경고를 더 줄일 수 있습니다.

### 6) 콘솔/주석 정책

- 개발 중 디버깅을 위해 사용하던 `console.*` 호출은 제품용 빌드 전에 제거했습니다. 필요한 로그는 중앙 로깅(예: Sentry)으로 전환하는 것을 권장합니다.

---

## 기술 스택

- 프레임워크: React 19
- 번들러/개발서버: Vite
- 언어: TypeScript
- 스타일링: Tailwind CSS
- 데이터 페칭/캐싱: @tanstack/react-query (React Query)
- 라우팅: react-router-dom
- 아이콘: lucide-react
- HTTP 클라이언트: axios

---

## 코드 구조(요약)

- `src/app/` — 전역 Provider 및 엔트리
- `src/pages/` — 페이지 컴포지션 (Home)
- `src/widgets/` — 재사용 가능한 UI 블록 (WeatherDashboard, FavoritesList)
- `src/features/` — 도메인별 상호작용 컴포넌트 (LocationSearch)
- `src/entities/` — 비즈니스 객체(Weather 관련 컴포넌트)
- `src/shared/` — 공용 유틸, API, 스타일

---

## 환경변수

- 현재 Open-Meteo 기반으로 API 키가 필요하지 않습니다. 다른 API(예: OpenWeatherMap)를 사용하려면 `.env`에 Vite 환경변수를 추가하고 코드를 조정하세요.

---
