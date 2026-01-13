# 🚀 빠른 실행 가이드

## 사전 요구사항 확인

### 1️⃣ Java 설치 확인
```bash
java -version
```
**필요**: Java 17 이상

### 2️⃣ Node.js 설치 확인
```bash
node -v
npm -v
```
**필요**: Node.js 18 이상

### 3️⃣ PostgreSQL 설치 확인
```bash
psql --version
```
**필요**: PostgreSQL 12 이상

---

## 📦 데이터베이스 생성

PostgreSQL을 실행한 후:

```bash
psql -U postgres
```

PostgreSQL 프롬프트에서:
```sql
CREATE DATABASE daangn_db;
\c daangn_db
\q
```

---

## 🎯 실행 순서 (3개 터미널에서 동시 실행)

### 터미널 1: Spring Boot API 서버 (포트 8080)
```bash
cd api-server
./gradlew bootRun
```

**예상 출력:**
```
Started MarketApplication in X.XXX seconds
```

**테스트:**
```bash
curl http://localhost:8080/api/health
```

예상 응답: `OK`

---

### 터미널 2: Node.js Signaling 서버 (포트 3001)
```bash
cd signaling
npm install
npm run dev
```

**예상 출력:**
```
🚀 Signaling Server listening on http://localhost:3001
```

**테스트:**
```bash
# 다른 터미널에서
curl http://localhost:3001/health
```

---

### 터미널 3: React 개발 서버 (포트 5173)
```bash
npm --workspace apps/web run dev
# 또는
cd apps/web
npm run dev
```

**예상 출력:**
```
  Local:   http://localhost:5173/
  press h to show help
```

---

## ✅ 모든 서버 실행 확인

### 헬스 체크
```bash
# Terminal 4에서
curl http://localhost:8080/api/health
curl http://localhost:3001/health
```

### 브라우저 테스트
```
http://localhost:5173
```

**페이지가 로드되면 성공!**

---

## 📝 샘플 API 테스트

### 1️⃣ 사용자 회원가입
```bash
curl -X POST http://localhost:8080/api/users/join \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123",
    "nickname": "User1",
    "latitude": 37.7749,
    "longitude": -122.4194
  }'
```

### 2️⃣ 상품 등록
```bash
curl -X POST http://localhost:8080/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "iPhone 13",
    "price": 800000,
    "category": "전자제품",
    "description": "거의 새것같은 상태",
    "latitude": 37.7749,
    "longitude": -122.4194
  }'
```

### 3️⃣ 상품 목록 조회
```bash
curl "http://localhost:8080/api/items?status=AVAILABLE&category=전자제품&page=0&size=10"
```

---

## 🐛 문제 해결

### Spring Boot 실행 안 됨
```bash
# Gradle 캐시 삭제
./gradlew clean

# 다시 시도
./gradlew bootRun
```

### PostgreSQL 연결 실패
```bash
# PostgreSQL 실행 확인
psql -U postgres -c "SELECT 1"

# DB 존재 확인
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname = 'daangn_db';"
```

### Node.js 포트 충돌
```bash
# 3001 포트 사용 중인 프로세스 확인
netstat -ano | findstr :3001

# 프로세스 종료 (PID 확인 후)
taskkill /PID <PID> /F
```

### React 빌드 에러
```bash
# node_modules 재설치
rm -r apps/web/node_modules
npm --workspace apps/web install
```

---

## 🎮 사용 흐름 테스트

1. **홈페이지 접속**
   - `http://localhost:5173`
   - 상품 카테고리 필터 테스트

2. **상품 상세 보기**
   - 목록에서 상품 클릭
   - "채팅하기" 버튼 클릭

3. **실시간 채팅 테스트** (두 개 브라우저 필요)
   - 브라우저 A, B에서 각각 로그인
   - A가 상품에 대해 채팅 시작
   - B가 채팅 응답
   - 실시간 메시지 동기화 확인

4. **WebRTC 비디오 통화** (카메라 필요)
   - 채팅 중에 "📞 전화" 버튼 클릭
   - 상대방이 수락하면 비디오 표시
   - 음성/영상 송수신 테스트

---

## 📊 포트 확인

| 서비스 | 포트 | URL |
|--------|------|-----|
| React | 5173 | http://localhost:5173 |
| Spring Boot API | 8080 | http://localhost:8080/api |
| Node Signaling | 3001 | http://localhost:3001 |

---

**준비 완료! 🎉**

3개 터미널을 열고 위 순서대로 실행하세요.
