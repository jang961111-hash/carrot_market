# 🚀 GitHub 푸시 가이드

## 현재 상태
✅ **로컬 Git 저장소 초기화 완료**
- 51개 파일 커밋됨
- `.gitignore` 설정됨 (node_modules 등 제외)
- 커밋 메시지: "feat: Live-Local-Market 초기 커밋 - Step 1-5 완료"

---

## 📌 다음 단계: GitHub에 푸시하기

### 1️⃣ GitHub에서 새 저장소 생성

**웹브라우저에서:**
1. https://github.com/new 접속
2. **Repository name**: `carrot_market` (또는 원하는 이름)
3. **Description**: "Live-Local-Market: WebRTC + AI Vision + Market Analysis"
4. **Public** 선택 (또는 Private)
5. **Create repository** 클릭
6. 저장소 주소 복사 (예: `https://github.com/YOUR_USERNAME/carrot_market.git`)

### 2️⃣ 로컬에서 리모트 추가 및 푸시

```bash
# 터미널에서 실행 (carrot_market 디렉토리)
cd C:\Users\SSAFY\Desktop\carrot_market

# 리모트 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/carrot_market.git

# (선택사항) SSH로 사용할 경우
# git remote add origin git@github.com:YOUR_USERNAME/carrot_market.git

# 현재 브랜치명 확인
git branch

# 메인 브랜치로 이름 변경 (필요시)
# git branch -M main

# 원격 저장소에 푸시
git push -u origin master
# 또는
# git push -u origin main
```

### 3️⃣ GitHub 토큰으로 인증 (HTTPS 사용 시)

첫 푸시할 때 인증을 요구하면:

**GitHub Personal Access Token 생성:**
1. https://github.com/settings/tokens 접속
2. **Generate new token (classic)** 클릭
3. **Token name**: "carrot_market"
4. **Scopes 선택**: `repo` 체크
5. **Generate token** 클릭
6. 토큰 복사
7. 터미널에서 암호 입력 시 토큰 붙여넣기

---

## 🔄 이후 작업 흐름

### 새로운 기능 커밋
```bash
# 변경사항 확인
git status

# 파일 스테이징
git add .

# 커밋
git commit -m "feat: Step 6 - YOLOv8 AI Guard 추가"

# 푸시
git push origin master
```

### 다른 컴퓨터에서 클론 받기
```bash
# 프로젝트 폴더에서
git clone https://github.com/YOUR_USERNAME/carrot_market.git

# 의존성 설치
cd carrot_market
npm install

# 개발 서버 실행
npm run dev
```

---

## 📋 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
  - Step 6: YOLOv8 AI Guard 추가

fix: 버그 수정
  - 한글 JWT 인코딩 문제 해결

refactor: 코드 리팩토링
  - authUtils 함수 정리

docs: 문서 수정
  - README 업데이트

style: 코드 스타일 변경
  - CSS 정렬

test: 테스트 추가
  - 로그인 기능 테스트
```

---

## 🌳 브랜치 전략 (선택사항)

```bash
# main 브랜치 생성 (프로덕션)
git branch main

# develop 브랜치 생성 (개발)
git checkout -b develop

# feature 브랜치 생성 (기능 개발)
git checkout -b feature/step-6-yolo

# 커밋 후 푸시
git push origin feature/step-6-yolo

# GitHub에서 Pull Request 생성 → Merge
```

---

## 🔒 .gitignore 설정 확인

현재 제외되는 파일들:
```
node_modules/          # 의존성 (npm install로 복구 가능)
dist/                  # 빌드 결과물
.env                   # 환경 변수 (민감정보)
.vscode/               # IDE 설정
.gradle/               # Gradle 캐시
__pycache__/           # Python 캐시
```

---

## 💡 유용한 Git 명령어

```bash
# 로그 확인
git log --oneline

# 특정 파일의 변경 이력
git log -- apps/web/src/authUtils.ts

# 변경사항 diff 보기
git diff

# 마지막 커밋 수정
git commit --amend

# 특정 파일 언스테이징
git restore --staged filename

# 변경사항 되돌리기
git restore filename

# 원격 상태 확인
git remote -v
git branch -a
```

---

## 📌 주의사항

⚠️ **커밋하지 말아야 할 것들:**
- `node_modules/` → `.gitignore`에 이미 등록
- `.env` 파일 → `.gitignore`에 이미 등록
- IDE 설정 (`.vscode/`, `.idea/`) → `.gitignore`에 이미 등록
- 개인 토큰, API 키, 비밀번호

✅ **항상 커밋해야 할 것들:**
- `package.json`, `package-lock.json` → 의존성 정보
- `src/` 폴더 → 소스 코드
- `README.md` → 문서
- `.gitignore` → Git 설정

---

## 🎯 완료 체크리스트

- [ ] GitHub 계정 생성 (이미 있으면 ✓)
- [ ] GitHub에 새 저장소 생성
- [ ] `git remote add origin ...` 실행
- [ ] `git push -u origin master` 실행
- [ ] GitHub에서 확인 (파일이 보이는지)
- [ ] 다른 컴퓨터에서 `git clone` 테스트 (선택)

---

**🎉 이제 언제 어디서든 `git clone`으로 프로젝트를 사용할 수 있습니다!** 🚀
