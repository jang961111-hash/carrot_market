import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './AuthPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다');
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      await login('testuser@example.com', 'password123');
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🥕 당근마켓</h1>
          <p>로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="divider">또는</div>

        <button
          type="button"
          className="demo-button"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          📱 데모 계정으로 로그인
        </button>

        <div className="auth-footer">
          <p>계정이 없으신가요? <a href="/register">회원가입</a></p>
        </div>
      </div>

      <div className="auth-info">
        <h3>테스트 계정</h3>
        <div className="test-account">
          <p><strong>이메일:</strong> testuser@example.com</p>
          <p><strong>비밀번호:</strong> password123</p>
        </div>
        <div className="test-account">
          <p><strong>이메일:</strong> buyer@example.com</p>
          <p><strong>비밀번호:</strong> password123</p>
        </div>
      </div>
    </div>
  );
}
