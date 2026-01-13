// 인증 관련 Mock 데이터 및 유틸리티
const USE_JWT_MOCK = true; // JWT 모의 구현

// UTF-8을 Base64로 인코딩 (한글 지원)
function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// Base64를 UTF-8로 디코딩 (한글 지원)
function decodeBase64(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

// Mock JWT 토큰 생성 (실제 JWT 대신 사용)
function generateMockJWT(payload: any): string {
  // 실제 JWT 형식: header.payload.signature
  // Mock에서는 간단한 버전 사용 (한글 지원)
  const header = encodeBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64(JSON.stringify({ ...payload, iat: Date.now() / 1000, exp: Date.now() / 1000 + 86400 }));
  const signature = encodeBase64('mock-signature-' + Date.now());
  return `${header}.${body}.${signature}`;
}

// Mock JWT 파싱 (실제 검증 없이 payload만 추출)
function decodeMockJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(decodeBase64(parts[1]));
  } catch {
    return null;
  }
}

// Mock 사용자 데이터베이스
const mockUsers: Record<string, any> = {
  'testuser@example.com': {
    id: 1,
    email: 'testuser@example.com',
    password: 'password123',
    nickname: 'TestUser',
    mannerScore: 95,
    location: '강남구',
    createdAt: new Date().toISOString(),
  },
  'buyer@example.com': {
    id: 2,
    email: 'buyer@example.com',
    password: 'password123',
    nickname: 'BuyerUser',
    mannerScore: 87,
    location: '서초구',
    createdAt: new Date().toISOString(),
  },
};

// 세션/토큰 저장소
const tokenStore: Record<string, any> = {};

export const authUtils = {
  // 토큰 저장
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  // 토큰 조회
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // 토큰 제거
  removeToken() {
    localStorage.removeItem('auth_token');
  },

  // 현재 사용자 정보 조회
  getCurrentUser(): any {
    const token = this.getToken();
    if (!token) return null;
    return decodeMockJWT(token);
  },

  // 토큰 유효성 확인
  isTokenValid(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.exp > Date.now() / 1000;
  },

  // 회원가입
  register(email: string, password: string, nickname: string, location: string = '강남구') {
    if (mockUsers[email]) {
      throw new Error('이미 존재하는 이메일입니다');
    }

    const newUser = {
      id: Object.keys(mockUsers).length + 1,
      email,
      password, // 실제로는 암호화해야 함
      nickname,
      mannerScore: 50,
      location,
      createdAt: new Date().toISOString(),
    };

    mockUsers[email] = newUser;
    return { id: newUser.id, email, nickname, location };
  },

  // 로그인
  login(email: string, password: string) {
    const user = mockUsers[email];
    if (!user || user.password !== password) {
      throw new Error('이메일 또는 비밀번호가 잘못되었습니다');
    }

    const token = generateMockJWT({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      mannerScore: user.mannerScore,
      location: user.location,
    });

    this.setToken(token);
    tokenStore[token] = { user, expiresAt: Date.now() + 86400000 };

    return {
      token,
      user: { id: user.id, email, nickname: user.nickname, mannerScore: user.mannerScore, location: user.location },
    };
  },

  // 로그아웃
  logout() {
    this.removeToken();
  },

  // 프로필 조회
  getProfile(userId: number) {
    const user = Object.values(mockUsers).find((u: any) => u.id === userId);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // 프로필 업데이트
  updateProfile(userId: number, updates: any) {
    const user = Object.values(mockUsers).find((u: any) => u.id === userId) as any;
    if (!user) return null;

    Object.assign(user, updates);

    // 토큰 갱신
    const token = generateMockJWT({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      mannerScore: user.mannerScore,
      location: user.location,
    });

    this.setToken(token);
    return { id: user.id, email: user.email, nickname: user.nickname, ...updates };
  },

  // 매너 온도 조회
  getMannerScore(userId: number) {
    const user = Object.values(mockUsers).find((u: any) => u.id === userId);
    return user ? user.mannerScore : 0;
  },

  // 매너 온도 업데이트
  updateMannerScore(userId: number, score: number) {
    const user = Object.values(mockUsers).find((u: any) => u.id === userId) as any;
    if (user) {
      user.mannerScore = Math.max(0, Math.min(100, score));
      return user.mannerScore;
    }
    return 0;
  },
};
