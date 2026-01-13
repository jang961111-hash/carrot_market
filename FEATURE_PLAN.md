# 🎥 Live-Local-Market 기획안 및 구현 로드맵

## 📌 프로젝트 개요

**서비스명:** 라이브 로컬 마켓 (Live-Local-Market)  
**핵심 가치:** 1:N 라이브 스트리밍 + AI 가드 + 실시간 시세 분석을 결합한 하이퍼로컬 중고거래 플랫폼

---

## 🏗️ 시스템 아키텍처

| 구분 | 기술 스택 | 상세 역할 |
|------|----------|-----------|
| **Frontend** | Vue.js | 반응형 UI, WebRTC 스트리밍 플레이어, 실시간 경매 대시보드 |
| **Backend** | Spring Boot | 비즈니스 로직, 경매 시스템 제어, API 서버 |
| **Database** | MySQL | 유저, 상품 정보, 경매 기록, 거래 내역 저장 |
| **Real-time** | WebRTC (SFU) / WebSocket | 1:N 고화질 화상 송출, 입찰 데이터 초저지연 전송 |
| **Concurrency** | Redis (Redlock) | 경매 입찰 동시성 제어 및 최고가 캐싱 |
| **Messaging** | Kafka | 라이브 시작 알림 및 이벤트 메시지 비동기 처리 |
| **AI (Vision)** | YOLOv8 | 실시간 영상 분석 (금지 품목 탐지 및 상품 일치 확인) |

---

## 🗄️ Entity 설계 구조

### 1. 표준 모델 정보 (product_models)
```sql
- model_id (PK)
- model_name (모델명)
- category
- specifications (상세사양 JSON)
- original_price (출시 원가)
- manufacturer (제조사)
- release_date
```

### 2. 시세 통계 (market_prices)
```sql
- price_stat_id (PK)
- model_id (FK)
- avg_price_3month (최근 3개월 평균가)
- min_price
- max_price
- sample_count (거래 샘플 수)
- last_updated
```

### 3. 판매 매물 (items) - 기존 확장
```sql
+ model_id (FK) - 표준 모델 연결
+ detailed_model_name (세부 모델명)
+ condition_grade (상태 등급: S/A/B/C)
+ live_requested (라이브 요청 여부)
+ live_request_count (요청 누적 수)
```

### 4. 라이브 방송 (live_broadcasts)
```sql
- broadcast_id (PK)
- item_id (FK)
- seller_id (FK)
- status (WAITING/LIVE/ENDED)
- viewer_count
- ai_warning_count (AI 경고 누적)
- stream_key (WebRTC 스트림 키)
- started_at
- ended_at
```

### 5. 찜/알림 설정 (wishlists)
```sql
- wishlist_id (PK)
- user_id (FK)
- item_id (FK)
- live_alarm_enabled (라이브 알림 수신 여부)
- created_at
```

### 6. AI 경고 로그 (ai_warning_logs)
```sql
- log_id (PK)
- broadcast_id (FK)
- warning_type (PROHIBITED_ITEM/PRODUCT_MISMATCH)
- detected_object (탐지된 객체)
- confidence_score
- timestamp
```

---

## 🎯 핵심 기능별 구현 계획

### Phase 1: 기반 인프라 구축 (Week 1-2)

#### ✅ 1.1 회원 및 인증 시스템
- [ ] JWT 기반 인증 구현 (Spring Security)
- [ ] 소셜 로그인 (Kakao, Google OAuth 2.0)
- [ ] GPS 기반 동네 인증 API
- [ ] 매너 온도/등급 관리 시스템
- [ ] 관심 카테고리 설정 기능

**구현 순서:**
1. Spring Boot에 Spring Security + JWT 설정
2. User Entity 확장 (location, manner_score, interest_categories)
3. Vue.js 로그인/회원가입 페이지
4. 위치 정보 수집 API (Geolocation API)

---

#### ✅ 1.2 상품 등록 및 모델명 시스템
- [ ] 모델명 입력 UI (대표/세부 모델명)
- [ ] 표준 모델 DB 구축 (초기 데이터 100개)
- [ ] OCR 기반 자동 입력 (Tesseract.js)
- [ ] Google Lens API 연동 (상품명 추천)

**구현 순서:**
1. ProductModel Entity 생성
2. Item Entity에 model_id 추가
3. Vue.js 상품 등록 폼에 모델명 입력란 추가
4. OCR 라이브러리 테스트 (이미지 → 텍스트)

---

### Phase 2: 실시간 시세 엔진 (Week 3-4)

#### ✅ 2.1 시세 비교 엔진
- [ ] 최근 3개월 거래 데이터 집계 로직
- [ ] 평균가/최고가/최저가 산출 알고리즘
- [ ] 시세 통계 자동 갱신 배치 (Spring Batch)

**구현 순서:**
1. MarketPrice Entity 생성
2. 시세 계산 Service 구현 (PriceAnalysisService)
3. 스케줄러로 매일 자정 시세 갱신
4. API 엔드포인트: `GET /api/prices/model/{modelId}`

---

#### ✅ 2.2 실시간 시세 보드 UI
- [ ] Vue.js 대시보드 컴포넌트 (Gauge Chart)
- [ ] 현재가 vs 평균가 vs 신품가 비교 그래프
- [ ] 가치 알림 봇 (30% 이하 시 팝업)

**구현 순서:**
1. Chart.js 또는 ECharts 설치
2. PriceBoard.vue 컴포넌트 생성
3. WebSocket으로 실시간 가격 변동 반영
4. 조건부 알림 로직 (if currentPrice < avgPrice * 0.7)

---

### Phase 3: 1:N 라이브 스트리밍 (Week 5-7)

#### ✅ 3.1 WebRTC SFU 구축
- [ ] Kurento/Janus 또는 mediasoup 서버 설치
- [ ] Spring Boot와 Media Server 연동
- [ ] 송출자(1) → SFU → 시청자(N) 아키텍처

**구현 순서:**
1. Docker로 Kurento 컨테이너 실행
2. Spring Boot에서 Kurento Client 연동
3. Vue.js에서 WebRTC API (getUserMedia, RTCPeerConnection)
4. 테스트: 1명 송출 → 10명 수신

---

#### ✅ 3.2 라이브 방송 관리
- [ ] LiveBroadcast Entity 생성
- [ ] 방송 시작/종료 API
- [ ] 실시간 시청자 수 카운팅 (Redis)
- [ ] 채팅 기능 (기존 WebSocket 확장)

**구현 순서:**
1. BroadcastController (start, stop, status)
2. Redis로 viewer_count 관리
3. Vue.js LiveStreamPlayer.vue 컴포넌트
4. 라이브 목록 페이지 (/live)

---

### Phase 4: AI 가드 시스템 (Week 8-9)

#### ✅ 4.1 YOLOv8 객체 탐지
- [ ] YOLOv8 모델 학습 (금지 품목 데이터셋)
- [ ] Python Flask API 서버 구축
- [ ] Spring Boot → Flask 비동기 호출
- [ ] 실시간 프레임 분석 (1초당 1회)

**구현 순서:**
1. YOLOv8 학습 환경 구축 (Google Colab)
2. Flask API: `POST /detect` (image → detected_objects)
3. Spring Boot RestTemplate으로 호출
4. 경고 로그 DB 저장 (AiWarningLog Entity)

---

#### ✅ 4.2 상품 일치성 체크
- [ ] 등록 상품 이미지 vs 라이브 화면 비교
- [ ] 불일치 시 Overlay 경고 메시지
- [ ] 3회 경고 시 방송 자동 종료

**구현 순서:**
1. 상품 등록 시 대표 이미지 feature 추출 (CLIP/ResNet)
2. 라이브 중 주기적으로 현재 프레임 비교
3. Vue.js에서 WebSocket으로 경고 수신 → UI 표시

---

### Phase 5: 하이퍼로컬 & 알림 시스템 (Week 10-11)

#### ✅ 5.1 위치 기반 매칭
- [ ] PostGIS 설치 (공간 데이터 처리)
- [ ] 반경 3km 내 라이브 검색 API
- [ ] 지도 뷰 (Kakao Map API)

**구현 순서:**
1. MySQL → PostgreSQL + PostGIS 마이그레이션
2. ST_Distance 함수로 거리 계산
3. Vue.js에 Kakao Map 컴포넌트 추가

---

#### ✅ 5.2 Kafka 기반 푸시 알림
- [ ] Kafka 클러스터 구축 (Docker)
- [ ] Producer: 라이브 시작 이벤트 발행
- [ ] Consumer: 찜 목록 조회 후 FCM 푸시 발송
- [ ] Spring Boot Admin 모니터링

**구현 순서:**
1. docker-compose.yml에 Kafka + Zookeeper 추가
2. Spring Kafka Producer 설정
3. FCM 서버 키 설정
4. 알림 발송 테스트 (100명 동시 발송)

---

### Phase 6: 경매 시스템 (Week 12-13)

#### ✅ 6.1 Redis Redlock 동시성 제어
- [ ] 입찰 요청 시 분산 락 획득
- [ ] 최고 입찰가 Redis 캐싱
- [ ] 낙찰 로직 (경매 종료 시)

**구현 순서:**
1. Redisson 라이브러리 추가
2. BidService에 @Lock 어노테이션
3. Vue.js 입찰 버튼 연타 방지
4. 부하 테스트 (JMeter 1000 TPS)

---

## 📊 개발 우선순위 및 MVP 범위

### MVP (Minimum Viable Product) - 8주 목표
1. ✅ **회원 인증 (JWT + 소셜 로그인)**
2. ✅ **모델명 기반 상품 등록**
3. ✅ **시세 비교 엔진 + 보드 UI**
4. ✅ **기본 1:N 라이브 스트리밍**
5. ✅ **위치 기반 검색**

### Post-MVP (추가 기능)
- AI 가드 고도화 (정확도 90% 이상)
- Kafka 대규모 알림 (10만+ 유저)
- 경매 시스템 완성
- 관리자 대시보드

---

## 🔧 개발 환경 설정

### 기존 스택 변경사항
| Before | After | 이유 |
|--------|-------|------|
| React | **Vue.js** | 기획안 명시 |
| PostgreSQL | **MySQL** | 기획안 명시 |
| - | **Redis** | 동시성 제어 필수 |
| - | **Kafka** | 대규모 알림 처리 |
| - | **YOLOv8 (Python)** | AI 비전 |

### 새로운 인프라
```bash
# Docker Compose 구성
- Spring Boot (8080)
- MySQL (3306)
- Redis (6379)
- Kafka + Zookeeper (9092, 2181)
- Kurento Media Server (8888)
- Flask AI Server (5000)
- Vue.js (8081)
```

---

## 📅 다음 단계 (즉시 시작 가능)

### 🎯 Step 1: 프로젝트 마이그레이션 (현재 React → Vue.js)
**예상 시간:** 2-3시간
- [ ] Vue.js 프로젝트 생성 (Vue CLI)
- [ ] 기존 React 컴포넌트 → Vue 컴포넌트 변환
- [ ] Vue Router 설정
- [ ] Vuex 또는 Pinia 상태 관리

**시작할까요? (Y/N)**

---

### 🎯 Step 2: JWT 인증 시스템 구축
**예상 시간:** 3-4시간
- [ ] Spring Security + JWT 설정
- [ ] User Entity 확장 (location, manner_score)
- [ ] 로그인/회원가입 API
- [ ] Vue.js 로그인 페이지

---

### 🎯 Step 3: 모델명 시스템 및 시세 엔진
**예상 시간:** 4-5시간
- [ ] ProductModel Entity
- [ ] 시세 계산 로직
- [ ] 상품 등록 폼 확장
- [ ] 시세 보드 UI

---

## 💡 권장 진행 순서

1. **마이그레이션** (React → Vue.js) - 2일
2. **JWT 인증** - 1일
3. **모델명 + 시세 엔진** - 2일
4. **라이브 스트리밍 기초** - 3일
5. **AI 가드 통합** - 2일
6. **위치 + 알림** - 2일

**총 예상 기간:** 12일 (풀타임 기준)

---

## 📝 참고 문서
- [WebRTC SFU 아키텍처](https://webrtc.org/)
- [YOLOv8 공식 문서](https://docs.ultralytics.com/)
- [Spring Kafka 가이드](https://spring.io/projects/spring-kafka)
- [Redisson Redlock](https://github.com/redisson/redisson/wiki/8.-Distributed-locks-and-synchronizers)

---

**마지막 업데이트:** 2026-01-13  
**문서 버전:** v1.0
