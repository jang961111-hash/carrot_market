# 🥕 당근마켓 Live+

**실시간 라이브 방송 + 시세 분석 + AI 안전 거래**를 갖춘 당근마켓 확장 프로젝트

---

## 🚀 빠른 시작

```bash
# 1. 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저 접속
http://localhost:5173

# 4. 테스트 계정으로 로그인
이메일: testuser@example.com
비밀번호: password123
```

**서버 포트**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

---

## 📋 프로젝트 구조

```
carrot_market/
├── apps/web/                   # React Frontend (Vite)
│   └── src/
│       ├── pages/              # 8개 페이지 (140-580줄)
│       │   ├── HomePage.tsx           # 상품 목록 + 가격 배지
│       │   ├── ItemDetailPage.tsx     # 상품 상세 + 시세 비교
│       │   ├── LoginPage.tsx          # 이메일 로그인
│       │   ├── RegisterPage.tsx       # 회원가입
│       │   ├── ProfilePage.tsx        # 프로필 + 매너 온도
│       │   ├── SellPage.tsx           # 상품 등록 + 모델명 자동완성
│       │   ├── ChatPage.tsx           # 거래 채팅 + AI 협상 제안 (NEW!)
│       │   ├── MarketBoardPage.tsx    # 시세 분석 + Chart.js 차트
│       │   └── LiveBroadcastPage.tsx  # 라이브 방송 + AI 추천 질문 (NEW!)
│       ├── App.tsx             # 라우터 설정
│       ├── AuthContext.tsx      # 전역 인증 상태 (useAuth 훅)
│       ├── authUtils.ts        # Mock JWT (한글 지원)
│       ├── aiUtils.ts          # 🤖 AI 협상제안 & 질문 생성 (NEW!)
│       ├── mockData.ts         # 8개 상품 + 시세 데이터
│       ├── api.ts              # API 클라이언트 (Mock 토글)
│       └── styles.css          # 글로벌 스타일 (608줄)
│
├── apps/server/                # Node.js Express Server
│   └── index.js                # API 서버 + Socket.io
│
├── api-server/                 # Spring Boot (Java 17)
│   └── src/main/java/          # 26개 클래스 (코드만 완성)
│
├── signaling/                  # WebRTC Signaling (독립)
│   └── server.js               # Socket.io 신호 서버
│
└── docker-compose.yml          # 전체 서비스 오케스트레이션
```

---

## ✅ 완료된 기능

### Step 1️⃣: JWT 인증 시스템
- ✅ Mock JWT 토큰 (한글 지원)
- ✅ localStorage 자동 저장
- ✅ useAuth() 전역 훅
- ✅ 2개 테스트 계정

### Step 2️⃣: 상품 모델명 시스템
- ✅ ProductModel: 8개 상품 (iPhone, MacBook, Nike 등)
- ✅ MarketPrice: 평균가, 최고가, 최저가
- ✅ SellPage: 모델명 자동완성 드롭다운
- ✅ HomePage/ItemDetailPage: 가격 배지 + 시세 비교

### Step 3️⃣: 시세 분석 대시보드
- ✅ **MarketBoardPage** (580줄)
  - 📈 Line 차트: 시간별 시세 추이 (3개 카테고리)
  - 📊 Bar 차트: 카테고리별 가격 분포
  - 📋 모델 테이블: 8개 상품 시세 + 변동률
  - 🏆 인기 TOP 5: 상승세/하락세

### Step 4️⃣: WebRTC Live Streaming (Mock)
- ✅ **LiveBroadcastPage** (320줄)
  - 📝 방송 설정 화면 (상품명, 가격)
  - 🎥 Mock 비디오 스트림 (Canvas API)
  - 💬 실시간 채팅 (양방향)
  - 👥 시청자 목록 + 카운트
  - 🎛️ 방송 컨트롤 (마이크, 카메라, 화면공유)

### Step 5️⃣: AI 협상 제안 & 추천 질문 (NEW!)
- ✅ **ChatPage**: 시세 기반 협상 제안
  - 💰 판매자 모드: "현재 가격이 시세보다 ₩XXX 비쌉니다. ₩YYY(으)로 조정하면 시세와 비슷해집니다!"
  - 🛍️ 구매자 모드: "이 상품 가격이 시세보다 ₩XXX 비싼 편입니다. ₩YYY(으)로 네고해보시는 건 어떨까요?"
  - 🎯 역할 선택 토글 (판매자 ↔ 구매자)
  - 📊 실시간 시세 비교
- ✅ **LiveBroadcastPage**: AI 추천 질문
  - 🤖 상품 기반 자동 질문 생성 (카테고리별)
  - 📌 전자제품: "배터리 상태는 어떻게 되나요?" (🔋)
  - 📌 의류: "사이즈가 정확한가요?" (📏)
  - 📌 가구: "조립이 필요한가요?" (🔧)
  - 👆 클릭 시 자동 입력 + Mock AI 응답 (30% 확률)

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | React 18 + TypeScript + Vite + React Router v6 |
| **Styling** | Pure CSS (550+ lines) + CSS 변수 |
| **Data** | Chart.js + Mock 데이터 |
| **Real-time** | Socket.io-client |
| **Auth** | Mock JWT (Base64 인코딩) |
| **Backend** | Node.js + Express (포트 4000) |
| **DevOps** | Docker Compose |

---

## 📄 핵심 파일 설명

### `authUtils.ts` (한글 지원)
```typescript
// UTF-8을 Base64로 인코딩
function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// JWT 토큰 생성 (header.payload.signature)
function generateMockJWT(payload: any): string {
  const header = encodeBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64(JSON.stringify({ ...payload, iat, exp }));
  const signature = encodeBase64('mock-signature');
  return `${header}.${body}.${signature}`;
}
```

### `mockData.ts` (8개 상품)
```typescript
const mockProductModels = [
  { id: 1, name: 'iPhone 13', category: '전자제품', manufacturer: 'Apple' },
  { id: 2, name: 'MacBook M2', category: '전자제품', manufacturer: 'Apple' },
  { id: 3, name: 'Nike Air Force 1', category: '의류', manufacturer: 'Nike' },
  // ... 5개 더
];

const mockMarketPrices = [
  { modelId: 1, avgPrice: 750000, minPrice: 600000, maxPrice: 900000 },
  // ... 7개 더
];

// 가격 비교 함수
export function getPriceComparison(currentPrice: number, modelId: number) {
  const marketPrice = getMarketPrice(modelId);
  const percentDifference = ((currentPrice - marketPrice.avgPrice) / marketPrice.avgPrice) * 100;
  return {
    status: percentDifference < -30 ? 'great' : percentDifference > 30 ? 'expensive' : 'fair',
    percentDifference,
  };
}
```

### `api.ts` (Mock 토글)
```typescript
const USE_MOCK = true;  // true = Mock 데이터, false = 실제 API

export const itemAPI = {
  getAll: async () => USE_MOCK ? mockItems : axios.get('/api/items'),
  getOne: async (id) => USE_MOCK ? mockItems.find(i => i.id === id) : axios.get(`/api/items/${id}`),
  // ...
};
```

### `AuthContext.tsx` (전역 상태)
```typescript
interface User {
  id: number;
  email: string;
  nickname: string;
  mannerScore: number;
  location: string;
}

const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  return { user, isAuthenticated, isLoading, login, register, logout, updateProfile };
};
```

---

## 🧪 테스트 시나리오

### 1️⃣ 로그인
```
1. /login 접속
2. testuser@example.com / password123 입력
3. JWT 토큰이 localStorage에 저장됨
4. / (홈)으로 자동 리다이렉트
```

### 2️⃣ 상품 등록 (모델명 자동완성)
```
1. /sell 접속
2. "모델명" 입력 시 "iPhone" 등 자동 제안
3. 카테고리, 가격, 상태 선택 후 등록
```

### 3️⃣ 시세 분석
```
1. /market-board 접속
2. Line 차트: 시간별 추이 확인
3. Bar 차트: 카테고리별 비교
4. 모델 테이블: 8개 상품 시세 조회
5. TOP 5: 인기 상품 확인
```

### 4️⃣ 라이브 방송
```
1. /live 접속
2. 상품명 "iPhone 13", 가격 "800000" 입력
3. "🔴 방송 시작" 버튼 클릭
4. Mock 비디오 스트림 + Canvas 애니메이션
5. 📌 AI 추천 질문 자동 생성 (예: "배터리 상태는?")
6. 질문 클릭 → 채팅창에 자동 입력
7. 메시지 전송 → Mock AI 응답 (30% 확률로 자동 답변)
8. 시청자 목록 자동 증가
9. "방송 종료" 클릭
```

### 5️⃣ AI 협상 제안 (NEW!)
```
1. /chat/room-123 접속 (거래 채팅)
2. 우측 상단 "판매자/구매자" 토글로 역할 선택
3. AI가 시세 데이터 자동 분석
4. 파란색(구매자) 또는 주황색(판매자) 카드로 협상 제안 표시
   - "현재 가격이 시세보다 ₩50,000 비쌉니다. ₩700,000(으)로 조정하면 시세와 비슷해집니다!"
5. 제안 메시지 복사 후 상대방에 전송
6. 시세 기반 협상으로 공정한 거래 체계 확립
```

---

## 🎨 스타일 특징

- **CSS 변수**: `--primary: #ff6f0f` (당근 오렌지)
- **반응형**: 768px, 480px 미디어쿼리
- **애니메이션**: 
  - LIVE 배지 펄스
  - 호버 스케일 효과
  - 부드러운 전환 (transition)
- **다크 테마**: LiveBroadcastPage (#1a1a2e)

---

## 🔄 상태 관리 흐름

```
AuthContext (전역)
  ├── user (현재 로그인 사용자)
  ├── isAuthenticated (로그인 여부)
  └── methods: login, register, logout, updateProfile

useState (지역)
  ├── HomePage: selectedCategory, filteredItems
  ├── LiveBroadcastPage: isLive, viewers, chatMessages
  ├── MarketBoardPage: selectedModel, chartData
  └── ...
```

---

## 🐛 현재 제약사항

| 항목 | 상태 | 이유 |
|------|------|------|
| **Spring Boot API** | ❌ 미실행 | Java/Gradle 설정 이슈 (코드는 완성) |
| **Mock 데이터** | ✅ 동작 | `api.ts`에서 USE_MOCK=true 사용 |
| **WebRTC 스트림** | ✅ Mock | Canvas API로 가상 비디오 구현 |
| **Socket.io 채팅** | ✅ 동작 | 클라이언트만 (백엔드 미연결) |
| **AI 협상 제안** | ✅ Mock | aiUtils.ts의 시세 기반 제안 |
| **AI 추천 질문** | ✅ Mock | aiUtils.ts의 카테고리 기반 질문 |
| **Kafka 알림** | ⏳ 예정 | Step 6 |
| **Redis 경매** | ⏳ 예정 | Step 7 |

---

## 📦 npm 스크립트

```bash
npm run dev          # Web + Server 동시 실행
npm run dev-web     # Frontend만 (포트 5173)
npm run dev-server  # Backend만 (포트 4000)
```

---

## 🔜 다음 단계

### Step 6: Kafka 실시간 알림
- 이벤트 스트리밍
- 푸시 알림 시스템

### Step 7: Redis 경매 시스템
- 실시간 입찰
- 분산 락

---

## 📞 문의

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Real-time**: Socket.io + Canvas Mock
- **Database**: Mock 데이터 (추후 MySQL + MongoDB)

---

**⚡ 모노레포 구조 (npm workspaces)**

```json
{
  "workspaces": ["apps/*"]
}
```

이를 통해 단일 `npm install`로 전체 의존성을 관리하고, `npm run dev`로 Web + Server를 동시에 실행할 수 있습니다.

---

🥕 **Happy Coding!** 🚀
