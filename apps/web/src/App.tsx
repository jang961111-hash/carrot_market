import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthProvider, useAuth } from './AuthContext';
import HomePage from './pages/HomePage';
import ItemDetailPage from './pages/ItemDetailPage';
import ChatPage from './pages/ChatPage';
import CallPage from './pages/CallPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SellPage from './pages/SellPage';
import MarketBoardPage from './pages/MarketBoardPage';
import LiveBroadcastPage from './pages/LiveBroadcastPage';
import './styles.css';

// 인증이 필요한 라우트 보호
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>로딩 중...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// 메인 앱 컴포넌트 (AuthProvider 내부)
function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socketInstance = io('http://localhost:3001');

    socketInstance.on('connect', () => {
      console.log('Connected to signaling server');
      socketInstance.emit('user:join', { userId: user?.id });
    });

    socketInstance.on('chat:message', (message) => {
      setUnreadMessages((prev) => prev + 1);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  return (
    <div className="app">
      {isAuthenticated && (
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🥕 당근마켓 Live+
            </Link>
            <ul className="nav-menu">
              <li><Link to="/">홈</Link></li>
              <li><Link to="/market-board">시세분석</Link></li>
              <li><Link to="/live">라이브방송</Link></li>
              <li>
                <Link to="/chat">
                  채팅 {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
                </Link>
              </li>
              <li><Link to="/profile">프로필</Link></li>
              <li><Link to="/sell">판매하기</Link></li>
            </ul>
          </div>
        </nav>
      )}

      <main className={isAuthenticated ? 'main-content' : ''}>
        <Routes>
          {/* 인증 경로 */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />

          {/* 보호된 경로 */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/item/:itemId" element={<ProtectedRoute><ItemDetailPage userId={user?.id || 1} /></ProtectedRoute>} />
          <Route path="/market-board" element={<ProtectedRoute><MarketBoardPage /></ProtectedRoute>} />
          <Route path="/live" element={<ProtectedRoute><LiveBroadcastPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage userId={user?.id || 1} socket={socket} /></ProtectedRoute>} />
          <Route path="/call/:dealId" element={<ProtectedRoute><CallPage userId={user?.id || 1} socket={socket} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/sell" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />

          {/* 기본 경로 */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

// 최상위 App 컴포넌트 (AuthProvider로 감싸기)
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
